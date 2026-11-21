import pytest
from app.services.fertilizer_calculator import FertilizerCalculatorService

@pytest.fixture
def calc_service():
    return FertilizerCalculatorService()

def test_nutrient_classification_ranges(calc_service):
    # Test Low Nitrogen (< 280)
    low_res = calc_service.classify_nutrient(n=200, p=8, k=90, ph=6.8)
    assert low_res["n"]["status"] == "Low"
    assert low_res["n"]["factor"] == 1.25
    assert low_res["p"]["status"] == "Low"
    assert low_res["k"]["status"] == "Low"

    # Test Medium Nitrogen (280 - 560)
    med_res = calc_service.classify_nutrient(n=350, p=18, k=180, ph=7.0)
    assert med_res["n"]["status"] == "Medium"
    assert med_res["n"]["factor"] == 1.0
    assert med_res["p"]["status"] == "Medium"
    assert med_res["k"]["status"] == "Medium"

    # Test High Nitrogen (> 560)
    high_res = calc_service.classify_nutrient(n=600, p=35, k=320, ph=7.2)
    assert high_res["n"]["status"] == "High"
    assert high_res["n"]["factor"] == 0.75

def test_ph_interpretation_and_amendments(calc_service):
    # Strongly Acidic
    acid_res = calc_service.classify_nutrient(n=300, p=15, k=150, ph=5.2)
    assert acid_res["ph"]["status"] == "Strongly Acidic"
    assert "lime" in acid_res["ph"]["remedy"].lower()

    # Optimal / Neutral
    neutral_res = calc_service.classify_nutrient(n=300, p=15, k=150, ph=6.8)
    assert "Optimal" in neutral_res["ph"]["status"] or "Neutral" in neutral_res["ph"]["status"]

    # Strongly Sodic / Alkaline
    alkaline_res = calc_service.classify_nutrient(n=300, p=15, k=150, ph=8.9)
    assert "Alkaline" in alkaline_res["ph"]["status"] or "Sodic" in alkaline_res["ph"]["status"]
    assert "gypsum" in alkaline_res["ph"]["remedy"].lower()

def test_paddy_fertilizer_calculation(calc_service):
    # 2.5 acres Paddy with medium soil test values
    res = calc_service.calculate(
        n=350,
        p=18,
        k=180,
        ph=6.8,
        farm_size=2.5,
        crop="paddy",
        soil_type="Clay Loam",
        unit="acre"
    )

    assert "farm_details" in res
    assert res["farm_details"]["farm_size_acres"] == 2.5
    assert len(res["formulations_comparison"]) == 3

    # Option A (Urea + DAP + MOP)
    opt_a = res["formulations_comparison"][0]
    assert opt_a["id"] == "option_1_traditional"
    assert opt_a["total_bags"] > 0
    assert opt_a["estimated_cost_inr"] > 0

    # Ensure DAP, Urea and MOP are included
    fertilizer_names = [f["name"] for f in opt_a["fertilizers"]]
    assert any("Urea" in name for name in fertilizer_names)
    assert any("DAP" in name for name in fertilizer_names)
    assert any("MOP" in name for name in fertilizer_names)

def test_inm_cost_savings(calc_service):
    res = calc_service.calculate(
        n=300,
        p=15,
        k=150,
        ph=6.5,
        farm_size=3.0,
        crop="cotton",
        soil_type="Black / Vertisol",
        unit="acre"
    )

    opt_a = res["formulations_comparison"][0]
    opt_c = res["formulations_comparison"][2]

    assert opt_c["id"] == "option_3_inm"
    # INM chemical savings must be positive
    assert opt_c["chemical_savings_inr"] > 0

def test_acidic_soil_amendment_generation(calc_service):
    res = calc_service.calculate(
        n=250,
        p=12,
        k=140,
        ph=5.0, # Acidic
        farm_size=2.0,
        crop="paddy"
    )

    amendments = res["soil_amendments"]
    assert len(amendments) > 0
    assert "Lime" in amendments[0]["name"]
    assert amendments[0]["quantity_kg"] > 0

@pytest.mark.parametrize(("value", "expected"), [(0.49, "Low"), (0.50, "Medium"), (0.75, "Medium"), (0.76, "High")])
def test_organic_carbon_classes_and_recommendations(calc_service, value, expected):
    classes = calc_service.classify_nutrient(n=350, p=18, k=180, ph=6.8, oc=value)
    assert classes["oc"]["status"] == expected
    result = calc_service.calculate(n=350, p=18, k=180, ph=6.8, farm_size=1, crop="paddy", oc=value)
    assert 0 <= result["soil_health_score"] <= 100
    assert result["soil_nutrient_status"]["oc"]["status"] == expected
    fym = result["organic_alternatives"][0]["dosage"]
    assert ("2.5 tonnes/acre" in fym) == (expected == "Low")

@pytest.mark.parametrize("value", [0, 0.001, 5.01, float("nan")])
def test_invalid_organic_carbon_is_rejected(calc_service, value):
    with pytest.raises(ValueError):
        calc_service.classify_nutrient(n=350, p=18, k=180, ph=6.8, oc=value)
