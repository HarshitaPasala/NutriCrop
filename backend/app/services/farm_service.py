import datetime
from typing import List, Dict, Optional
from app.core.state_store import read_state, write_state
from app.models.farm import (
    FarmPlot,
    ExpenseEntry,
    ExpenseSummary,
    SoilTrendPoint,
    OfflineCropGuide,
    FarmOverviewResponse,
    AddPlotRequest,
    AddExpenseRequest,
)

PRESEEDED_PLOTS: List[FarmPlot] = [
    FarmPlot(
        plot_id="plot-1",
        name="Main Chilli Parcel (Plot 2A)",
        area_acres=2.45,
        current_crop="Chilli",
        variety="Guntur Teja (Dry Red)",
        soil_type="Clay Loam",
        sowing_date="15 Sep 2026",
        last_soil_test_date="12 Oct 2026",
        soil_health_score=76,
    ),
    FarmPlot(
        plot_id="plot-2",
        name="North Wetland (Plot 1B)",
        area_acres=1.80,
        current_crop="Paddy (Rice)",
        variety="BPT 5204 (Sona Masuri)",
        soil_type="Alluvial Clay",
        sowing_date="01 Aug 2026",
        last_soil_test_date="20 Jul 2026",
        soil_health_score=82,
    ),
]

PRESEEDED_EXPENSES: List[ExpenseEntry] = [
    ExpenseEntry(
        id="exp-1",
        plot_id="plot-1",
        date="15 Sep 2026",
        category="Seeds",
        amount_inr=2400.0,
        note="Chilli certified hybrid seed packet (Teja 4) with fungicide seed treatment.",
    ),
    ExpenseEntry(
        id="exp-2",
        plot_id="plot-1",
        date="25 Sep 2026",
        category="Fertilizers",
        amount_inr=4800.0,
        note="INM formulation: Basal DAP + FYM compost + Biofertilizer (Azospirillum). Saved ₹1,650 vs full chemical.",
    ),
    ExpenseEntry(
        id="exp-3",
        plot_id="plot-1",
        date="10 Oct 2026",
        category="Pesticides",
        amount_inr=3200.0,
        note="Neem Oil (10,000 ppm) foliar spray + 25 blue sticky traps for thrips prevention.",
    ),
    ExpenseEntry(
        id="exp-4",
        plot_id="plot-1",
        date="20 Oct 2026",
        category="Labor",
        amount_inr=8500.0,
        note="Seedling nursery lifting, transplanting labor (5 workers x 2 days) and manual weeding.",
    ),
    ExpenseEntry(
        id="exp-5",
        plot_id="plot-1",
        date="02 Nov 2026",
        category="Machinery",
        amount_inr=3100.0,
        note="Custom hiring tractor rotavator for inter-cultivation and battery knapsack sprayer rental.",
    ),
]

PRESEEDED_SOIL_TRENDS: List[SoilTrendPoint] = [
    SoilTrendPoint(
        season_label="Kharif 2024",
        year=2024,
        organic_carbon_pct=0.42,
        nitrogen_kg_ha=185.0,
        phosphorus_kg_ha=12.0,
        potassium_kg_ha=190.0,
        ph=7.8,
    ),
    SoilTrendPoint(
        season_label="Rabi 2024",
        year=2024,
        organic_carbon_pct=0.48,
        nitrogen_kg_ha=198.0,
        phosphorus_kg_ha=14.5,
        potassium_kg_ha=205.0,
        ph=7.6,
    ),
    SoilTrendPoint(
        season_label="Kharif 2025",
        year=2025,
        organic_carbon_pct=0.55,
        nitrogen_kg_ha=218.0,
        phosphorus_kg_ha=17.2,
        potassium_kg_ha=222.0,
        ph=7.4,
    ),
    SoilTrendPoint(
        season_label="Rabi 2025",
        year=2025,
        organic_carbon_pct=0.62,
        nitrogen_kg_ha=242.0,
        phosphorus_kg_ha=20.4,
        potassium_kg_ha=245.0,
        ph=7.2,
    ),
]

PRESEEDED_CROP_GUIDES: List[OfflineCropGuide] = [
    OfflineCropGuide(
        crop_name="Chilli (Capsicum annuum)",
        scientific_name="Capsicum annuum L.",
        ideal_season="Kharif (June-July) / Rabi (Sept-Oct)",
        duration_days=150,
        seed_rate="1.0 to 1.5 kg seeds / hectare (or 250g hybrid)",
        spacing="60 cm row-to-row x 45 cm plant-to-plant",
        water_requirement_mm="600 to 800 mm across cycle",
        critical_stages=[
            "Transplanting (0 DAS)",
            "Early branching (30-40 DAS)",
            "Flowering & Fruit Set (60-80 DAS)",
            "Fruit Ripening & Picking (100-140 DAS)",
        ],
        harvest_indicator="Green picking when firm and glossy; red picking when 90% uniform bright red.",
        storage_tips="Sun-dry pods to <10% moisture content on clean polythene sheets. Store in airtight gunny bags lined with polythene.",
    ),
    OfflineCropGuide(
        crop_name="Rice / Paddy (Oryza sativa)",
        scientific_name="Oryza sativa L.",
        ideal_season="Kharif (June-Nov) / Rabi (Nov-April)",
        duration_days=125,
        seed_rate="20 to 25 kg / acre (transplanted) or 10-12 kg (DSR)",
        spacing="20 cm x 15 cm (2-3 seedlings per hill)",
        water_requirement_mm="1100 to 1250 mm (Alternate Wetting & Drying saves 30% water)",
        critical_stages=[
            "Transplanting & Active Tillering (15-35 DAT)",
            "Panicle Initiation & Booting (45-65 DAT)",
            "Flowering & Anthesis (70-80 DAT)",
            "Milking to Dough (85-105 DAT)",
        ],
        harvest_indicator="80% of panicle grains turn golden yellow and upper grains are hard.",
        storage_tips="Dry paddy grains to 14% moisture before storage to prevent aflatoxin and storage insect multiplication.",
    ),
    OfflineCropGuide(
        crop_name="Wheat (Triticum aestivum)",
        scientific_name="Triticum aestivum L.",
        ideal_season="Rabi (Nov-Dec sowing)",
        duration_days=120,
        seed_rate="40 to 45 kg / acre",
        spacing="20 to 22.5 cm solid row drilling",
        water_requirement_mm="400 to 500 mm (4-6 critical irrigations)",
        critical_stages=[
            "Crown Root Initiation - CRI (21 DAS - Most critical!)",
            "Tillering (40-45 DAS)",
            "Jointing & Booting (60-65 DAS)",
            "Flowering & Grain Filling (80-95 DAS)",
        ],
        harvest_indicator="Straw becomes dry yellow and grains break with sharp snap under teeth (<12% moisture).",
        storage_tips="Clean and fumigate storage bins. Mix neem leaves or celphos tablets for long-term grain preservation.",
    ),
    OfflineCropGuide(
        crop_name="Cotton (Gossypium hirsutum)",
        scientific_name="Gossypium hirsutum L.",
        ideal_season="Kharif (May-July)",
        duration_days=160,
        seed_rate="1.8 to 2.2 kg / acre (Bt cotton hybrid)",
        spacing="90 cm x 60 cm or 120 cm x 45 cm",
        water_requirement_mm="700 to 900 mm",
        critical_stages=[
            "Square formation (35-50 DAS)",
            "Peak flowering (60-90 DAS)",
            "Boll development (90-120 DAS)",
            "Boll bursting & Picking (125-155 DAS)",
        ],
        harvest_indicator="Bolls burst wide open with fluffy clean white lint in dry weather.",
        storage_tips="Store seed cotton in well-ventilated dry rooms. Avoid high humidity which causes fiber yellowing.",
    ),
]

class FarmService:
    plots = list(PRESEEDED_PLOTS)
    expenses = list(PRESEEDED_EXPENSES)
    _hydrated = False

    @classmethod
    def _user_key(cls, phone: Optional[str], entity: str) -> str:
        if phone:
            clean = "".join(ch for ch in str(phone) if ch.isalnum())
            if clean and clean.lower() != "demo":
                return f"farm.{entity}.{clean}"
        return f"farm.{entity}"

    @classmethod
    def _hydrate(cls, phone: Optional[str] = None) -> tuple[List[FarmPlot], List[ExpenseEntry]]:
        if not phone or str(phone).lower() == "demo":
            if not cls._hydrated:
                saved_plots = read_state("farm.plots")
                saved_expenses = read_state("farm.expenses")
                if saved_plots is not None:
                    cls.plots = [FarmPlot.model_validate(item) for item in saved_plots]
                if saved_expenses is not None:
                    cls.expenses = [ExpenseEntry.model_validate(item) for item in saved_expenses]
                cls._hydrated = True
            return cls.plots, cls.expenses

        # User-scoped hydration
        plots_key = cls._user_key(phone, "plots")
        exp_key = cls._user_key(phone, "expenses")
        saved_u_plots = read_state(plots_key)
        saved_u_exp = read_state(exp_key)

        plots = [FarmPlot.model_validate(item) for item in saved_u_plots] if saved_u_plots is not None else list(PRESEEDED_PLOTS)
        expenses = [ExpenseEntry.model_validate(item) for item in saved_u_exp] if saved_u_exp is not None else list(PRESEEDED_EXPENSES)
        return plots, expenses

    @classmethod
    def _persist(cls, plots: List[FarmPlot], expenses: List[ExpenseEntry], phone: Optional[str] = None) -> None:
        plots_key = cls._user_key(phone, "plots")
        exp_key = cls._user_key(phone, "expenses")
        write_state(plots_key, [item.model_dump() for item in plots])
        write_state(exp_key, [item.model_dump() for item in expenses])
        if not phone or str(phone).lower() == "demo":
            cls.plots = plots
            cls.expenses = expenses

    @classmethod
    def get_overview(cls, plot_id: Optional[str] = None, phone: Optional[str] = None) -> FarmOverviewResponse:
        current_plots, current_expenses = cls._hydrate(phone)
        active_id = plot_id or (current_plots[0].plot_id if current_plots else "plot-1")
        active_plot = next((p for p in current_plots if p.plot_id == active_id), current_plots[0] if current_plots else None)

        # Filter expenses for active plot
        plot_expenses = [e for e in current_expenses if e.plot_id == active_id]
        total_exp = sum(e.amount_inr for e in plot_expenses)

        cat_breakdown = {}
        for e in plot_expenses:
            cat_breakdown[e.category] = cat_breakdown.get(e.category, 0.0) + e.amount_inr

        # Gross revenue model based on plot acreage
        acreage = active_plot.area_acres if active_plot else 2.45
        crop = (active_plot.current_crop if active_plot else "Chilli").lower()
        crop_rate = 29000.0 if "chilli" in crop else 25000.0 if "cotton" in crop else 21225.0 if "rice" in crop or "paddy" in crop else 24000.0
        gross_rev = round(crop_rate * acreage, 2)
        net_prof = gross_rev - total_exp
        profit_per_acre = net_prof / acreage if acreage > 0 else 0.0

        summary = ExpenseSummary(
            total_expense_inr=total_exp,
            category_breakdown=cat_breakdown,
            gross_revenue_inr=gross_rev,
            net_profit_inr=net_prof,
            profit_per_acre_inr=round(profit_per_acre, 2),
            entries=plot_expenses,
        )

        return FarmOverviewResponse(
            plots=current_plots,
            active_plot_id=active_id,
            expense_summary=summary,
            soil_trends=[
                point.model_copy(update={
                    "organic_carbon_pct": round(max(0.2, min(0.9, point.organic_carbon_pct + (active_plot.soil_health_score - 76) / 500)), 2),
                    "nitrogen_kg_ha": round(point.nitrogen_kg_ha * (1 + (active_plot.soil_health_score - 76) / 300)),
                    "phosphorus_kg_ha": round(point.phosphorus_kg_ha * (1 + (active_plot.soil_health_score - 76) / 300), 1),
                    "potassium_kg_ha": round(point.potassium_kg_ha * (1 + (active_plot.soil_health_score - 76) / 300)),
                    "ph": round(point.ph + (active_plot.soil_health_score - 76) / 100, 1),
                }) for point in PRESEEDED_SOIL_TRENDS
            ] if active_plot else PRESEEDED_SOIL_TRENDS,
            crop_guides=PRESEEDED_CROP_GUIDES,
            is_demo=True,
        )

    @classmethod
    def add_plot(cls, req: AddPlotRequest, phone: Optional[str] = None) -> FarmPlot:
        user_phone = req.phone or phone
        current_plots, current_expenses = cls._hydrate(user_phone)
        new_plot = FarmPlot(
            plot_id=f"plot-{len(current_plots) + 1}",
            name=req.name,
            area_acres=req.area_acres,
            area_unit=req.area_unit or "acres",
            current_crop=req.current_crop,
            variety=req.variety or "Standard",
            soil_type=req.soil_type,
            sowing_date=req.sowing_date,
            last_soil_test_date=datetime.date.today().strftime("%d %b %Y"),
            soil_health_score=75,
            irrigation_type=req.irrigation_type or "Canal / Furrow",
            village=req.village,
            mandal=req.mandal,
            district=req.district,
            state=req.state,
            pincode=req.pincode,
            image_url=req.image_url,
        )
        updated_plots = list(current_plots) + [new_plot]
        cls._persist(updated_plots, current_expenses, user_phone)
        return new_plot

    @classmethod
    def update_plot(cls, plot_id: str, req: Any, phone: Optional[str] = None) -> Optional[FarmPlot]:
        if isinstance(req, dict):
            user_phone = req.get("phone") or phone
            update_data = req
        else:
            user_phone = getattr(req, "phone", None) or phone
            update_data = req.model_dump(exclude_unset=True) if hasattr(req, "model_dump") else dict(req)
        current_plots, current_expenses = cls._hydrate(user_phone)
        for index, plot in enumerate(current_plots):
            if plot.plot_id == plot_id:
                updated = plot.model_copy(update=update_data)
                updated_plots = list(current_plots)
                updated_plots[index] = updated
                cls._persist(updated_plots, current_expenses, user_phone)
                return updated
        return None

    @classmethod
    def delete_plot(cls, plot_id: str, phone: Optional[str] = None) -> bool:
        current_plots, current_expenses = cls._hydrate(phone)
        if len(current_plots) <= 1:
            return False
        before = len(current_plots)
        updated_plots = [plot for plot in current_plots if plot.plot_id != plot_id]
        if len(updated_plots) == before:
            return False
        updated_expenses = [expense for expense in current_expenses if expense.plot_id != plot_id]
        cls._persist(updated_plots, updated_expenses, phone)
        return True

    @classmethod
    def add_expense(cls, req: AddExpenseRequest, phone: Optional[str] = None) -> ExpenseEntry:
        user_phone = req.phone or phone
        current_plots, current_expenses = cls._hydrate(user_phone)
        today_str = datetime.date.today().strftime("%d %b %Y")
        new_exp = ExpenseEntry(
            id=f"exp-{len(current_expenses) + 1}",
            plot_id=req.plot_id,
            date=today_str,
            category=req.category,
            amount_inr=req.amount_inr,
            note=req.note,
        )
        updated_expenses = list(current_expenses) + [new_exp]
        cls._persist(current_plots, updated_expenses, user_phone)
        return new_exp
