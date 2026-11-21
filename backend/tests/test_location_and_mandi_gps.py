import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.farm_service import FarmService
from app.models.farm import AddPlotRequest

client = TestClient(app)

def test_reverse_geocode_guntur_coordinates():
    # Test reverse geocoding for Guntur coordinates (Lam Farm / Tenali area)
    response = client.get("/api/v1/auth/reverse-geocode?lat=16.3067&lon=80.4365")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Guntur"
    assert data["state"] == "Andhra Pradesh"
    assert len(data["pincode"]) == 6  # Valid Indian 6-digit PIN code
    assert len(data["mandal"]) > 0
    assert len(data["village"]) > 0
    assert data["country"] == "India"
    assert abs(data["latitude"] - 16.3067) < 0.1
    assert abs(data["longitude"] - 80.4365) < 0.1

def test_reverse_geocode_ludhiana_coordinates():
    # Test Ludhiana coordinates (Punjab)
    response = client.get("/api/v1/auth/reverse-geocode?lat=30.9010&lon=75.8572")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Ludhiana"
    assert data["state"] == "Punjab"
    assert data["pincode"] == "141001"
    assert data["country"] == "India"

def test_location_profile_persistence():
    phone = "9876543210"
    payload = {
        "name": "Ramesh Patel",
        "village": "Gondal Village",
        "mandal": "Gondal Mandal",
        "district": "Rajkot",
        "state": "Gujarat",
        "pincode": "360001",
        "country": "India",
        "latitude": 22.3039,
        "longitude": 70.8022
    }
    # Update location
    put_res = client.put(f"/api/v1/auth/location?phone={phone}", json=payload)
    assert put_res.status_code == 200
    res_data = put_res.json()
    assert res_data["district"] == "Rajkot"
    assert res_data["mandal"] == "Gondal Mandal"
    assert res_data["pincode"] == "360001"
    assert float(res_data["latitude"]) == 22.3039
    assert float(res_data["longitude"]) == 70.8022

    # Check profile retrieval
    me_res = client.get(f"/api/v1/auth/me?phone={phone}")
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["village"] == "Gondal Village"
    assert me_data["mandal"] == "Gondal Mandal"
    assert me_data["district"] == "Rajkot"
    assert me_data["pincode"] == "360001"

def test_farm_plot_with_unit_and_location():
    phone = "9876543210"
    add_req = AddPlotRequest(
        name="North Organic Orchard",
        area_acres=4.5,
        area_unit="Acres",
        current_crop="Pomegranate",
        variety="Bhagwa",
        soil_type="Red Sandy Loam",
        sowing_date="2026-08-10",
        irrigation_type="Drip Irrigation",
        village="Gondal Village",
        mandal="Gondal Mandal",
        district="Rajkot",
        state="Gujarat",
        pincode="360001",
        phone=phone
    )
    new_plot = FarmService.add_plot(add_req)
    assert new_plot.name == "North Organic Orchard"
    assert new_plot.area_unit == "Acres"
    assert new_plot.mandal == "Gondal Mandal"
    assert new_plot.pincode == "360001"

    # Edit plot
    updated_plot = FarmService.update_plot(
        new_plot.plot_id,
        {"area_acres": 5.0, "current_crop": "Pomegranate (Organic)"},
        phone=phone
    )
    assert updated_plot is not None
    assert updated_plot.area_acres == 5.0
    assert updated_plot.current_crop == "Pomegranate (Organic)"

    # Delete plot
    deleted = FarmService.delete_plot(new_plot.plot_id, phone=phone)
    assert deleted is True

def test_farm_photo_upload():
    # Create a small dummy JPEG
    dummy_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    files = {"file": ("test_farm.jpg", dummy_jpeg, "image/jpeg")}
    res = client.post("/api/v1/farm/upload-photo", files=files)
    assert res.status_code == 200
    data = res.json()
    assert "photo_url" in data
    assert data["photo_url"].startswith("/api/v1/farm/image/")

def test_mandi_prices_with_radius_and_distance():
    # Test Mandi prices near Guntur coordinates (lat: 16.3067, lon: 80.4365)
    res_25 = client.get("/api/v1/mandi/prices?district=Guntur&lat=16.3067&lon=80.4365&radius_km=25")
    assert res_25.status_code == 200
    data_25 = res_25.json()
    assert len(data_25["records"]) > 0
    # Every price should have a valid distance_km
    for item in data_25["records"]:
        assert item["distance_km"] is not None
        assert item["modal_price_quintal"] > 0
        assert item["distance_km"] <= 25.0

    # Expanding radius to 100km should return equal or more results
    res_100 = client.get("/api/v1/mandi/prices?district=Guntur&lat=16.3067&lon=80.4365&radius_km=100")
    assert res_100.status_code == 200
    data_100 = res_100.json()
    assert len(data_100["records"]) >= len(data_25["records"])

    # Prices should be sorted nearest distance first
    distances = [p["distance_km"] for p in data_100["records"] if p["distance_km"] is not None]
    assert distances == sorted(distances)
