import pytest
from app.services.adapters.kvk_service import KvkDirectoryMockAdapter
from app.models.support import CallbackRequest, PostCreateRequest
from app.services.schemes_service import SchemesService
from app.services.community_service import CommunityService
from app.services.adapters.mandi_service import AgmarknetMockAdapter

def test_agmarknet_mandi_prices():
    service = AgmarknetMockAdapter()
    res = service.get_prices()
    assert res.total_markets >= 5
    assert res.is_demo is True
    for rec in res.records:
        assert rec.min_price_quintal <= rec.modal_price_quintal <= rec.max_price_quintal
        assert rec.price_trend in ["rising", "stable", "declining"]
        assert "AGMARKNET" in res.data_source

def test_mandi_commodity_filter():
    service = AgmarknetMockAdapter()
    res = service.get_prices(commodity="Chilli")
    assert len(res.records) >= 1
    for rec in res.records:
        assert "chilli" in rec.commodity.lower()

def test_kvk_directory_search():
    service = KvkDirectoryMockAdapter()
    res = service.search_kvk_centers(district="Guntur")
    assert res.total >= 1
    assert res.kisan_call_center_toll_free == "1800-180-1551"
    guntur_kvk = res.centers[0]
    assert "guntur" in guntur_kvk.district.lower()
    assert len(guntur_kvk.phone) >= 8

def test_kvk_callback_request():
    service = KvkDirectoryMockAdapter()
    req = CallbackRequest(
        farmer_name="Balaram",
        phone="9876543210",
        village="Tenali",
        district="Guntur",
        crop="Chilli",
        problem_description="Leaf thrips infestation",
        preferred_language="te",
    )
    res = service.request_callback(req)
    assert res.status == "confirmed"
    assert "KVK-TKT-" in res.ticket_id
    assert "9876543210" in res.message

def test_schemes_directory_privacy():
    res = SchemesService.get_schemes()
    assert res.total >= 4
    assert "Aadhaar" in res.privacy_notice
    for scheme in res.schemes:
        assert scheme.official_portal_url.startswith("https://")
        assert len(scheme.eligibility_criteria) >= 2
        assert len(scheme.required_documents) >= 2

def test_community_posts_and_outbreak_alerts():
    posts = CommunityService.get_posts()
    assert len(posts) >= 3
    # Check verified agronomist answer exists
    has_verified = False
    for p in posts:
        for c in p.comments:
            if "Agronomist" in c.author_role or "Scientist" in c.author_role:
                has_verified = True
    assert has_verified is True

    # Test create post
    new_p = CommunityService.create_post(
        PostCreateRequest(
            author_name="Kisan Mitra",
            author_location="Guntur",
            category="Crop Protection",
            title="How to prevent collar rot in seedling nursery?",
            content="Heavy rain caused seedling damping off in my nursery. Please advise.",
            crop="Chilli",
        )
    )
    assert new_p.id.startswith("post-")
    assert new_p.author_name == "Kisan Mitra"

    # Test outbreak alert
    alerts = CommunityService.get_pest_alerts("Guntur")
    assert len(alerts) >= 1
    assert "Armyworm" in alerts[0].pest_name or "Guntur" in alerts[0].district


def test_mandi_filters_do_not_leak_unrelated_crops_and_include_nearby_quote():
    adapter = AgmarknetMockAdapter()
    result = adapter.get_prices(commodity="Chilli", district="Ludhiana", state="Punjab", latitude=30.901, longitude=75.857)
    assert result.total_markets == 1
    assert result.records[0].commodity == "Chilli"
    assert result.records[0].district == "Ludhiana"
    assert result.records[0].distance_km == 0

    missing = adapter.get_prices(commodity="Unknown crop", district="Guntur")
    assert missing.records == []
