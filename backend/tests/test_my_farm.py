import pytest
from app.services.farm_service import FarmService
from app.models.farm import AddPlotRequest, AddExpenseRequest

def test_farm_overview_plots():
    overview = FarmService.get_overview()
    assert len(overview.plots) >= 2
    assert overview.is_demo is True
    for p in overview.plots:
        assert p.area_acres > 0
        assert len(p.current_crop) > 0
        assert p.soil_health_score > 0

def test_expense_ledger_calculation():
    overview = FarmService.get_overview("plot-1")
    summary = overview.expense_summary
    assert summary.total_expense_inr > 0
    assert summary.gross_revenue_inr > summary.total_expense_inr
    assert summary.net_profit_inr == summary.gross_revenue_inr - summary.total_expense_inr
    assert summary.profit_per_acre_inr > 0
    assert "Fertilizers" in summary.category_breakdown
    assert "Seeds" in summary.category_breakdown

def test_add_farm_plot():
    initial_count = len(FarmService.plots)
    new_plot = FarmService.add_plot(
        AddPlotRequest(
            name="South Cotton Acreage",
            area_acres=3.2,
            current_crop="Cotton",
            variety="Shankar-6",
            soil_type="Black Cotton Soil",
            sowing_date="2026-07-20",
        )
    )
    assert new_plot.name == "South Cotton Acreage"
    assert new_plot.area_acres == 3.2
    assert len(FarmService.plots) == initial_count + 1

def test_add_expense_entry():
    initial_exp_count = len(FarmService.expenses)
    new_exp = FarmService.add_expense(
        AddExpenseRequest(
            plot_id="plot-1",
            category="Labor",
            amount_inr=1500.0,
            note="Second manual weeding",
        )
    )
    assert new_exp.amount_inr == 1500.0
    assert len(FarmService.expenses) == initial_exp_count + 1

def test_soil_health_trends():
    overview = FarmService.get_overview()
    assert len(overview.soil_trends) >= 3
    # Verify Organic Carbon trajectory
    first_season = overview.soil_trends[0]
    last_season = overview.soil_trends[-1]
    assert last_season.organic_carbon_pct > first_season.organic_carbon_pct
    for pt in overview.soil_trends:
        assert 6.0 <= pt.ph <= 8.5
        assert pt.nitrogen_kg_ha > 0

def test_offline_crop_guides():
    overview = FarmService.get_overview()
    assert len(overview.crop_guides) >= 4
    crops = [g.crop_name for g in overview.crop_guides]
    assert any("Chilli" in c for c in crops)
    assert any("Rice" in c or "Paddy" in c for c in crops)
    for g in overview.crop_guides:
        assert len(g.critical_stages) >= 3
        assert len(g.seed_rate) > 0
        assert len(g.harvest_indicator) > 0
