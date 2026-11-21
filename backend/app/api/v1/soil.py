from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.models.soil import SoilReport
from app.services.fertilizer_calculator import fertilizer_calculator

router = APIRouter(prefix="/soil", tags=["Soil Health"])

class SoilCalculateRequest(BaseModel):
    n: float = Field(..., ge=0, le=1000, description="Available Nitrogen in kg/ha")
    p: float = Field(..., ge=0, le=300, description="Available Phosphorus in kg/ha")
    k: float = Field(..., ge=0, le=1000, description="Available Potassium in kg/ha")
    ph: float = Field(..., ge=3.0, le=11.0, description="Soil pH scale 3.0 to 11.0")
    farm_size: float = Field(..., gt=0, le=500, description="Farm size")
    crop: str = Field(default="Paddy (Rice)", description="Crop name")
    soil_type: str = Field(default="Alluvial", description="Soil type")
    unit: str = Field(default="acre", pattern="^(acre|acres|hectare|hectares|ha)$", description="acre or hectare")
    oc: Optional[float] = Field(default=None, ge=0.01, le=5.0, description="Organic Carbon %")
    farmer_name: Optional[str] = "Farmer"
    village: Optional[str] = "Tenali Village"
    district: Optional[str] = "Guntur"
    save_report: bool = True

@router.post("/calculate")
def calculate_soil_health(payload: SoilCalculateRequest, db: Session = Depends(get_db)):
    calc_res = fertilizer_calculator.calculate(
        n=payload.n,
        p=payload.p,
        k=payload.k,
        ph=payload.ph,
        farm_size=payload.farm_size,
        crop=payload.crop,
        soil_type=payload.soil_type,
        unit=payload.unit,
        oc=payload.oc
    )

    report_id = None
    if payload.save_report:
        report = SoilReport(
            farmer_name=payload.farmer_name or "Farmer",
            village=payload.village or "Tenali Village",
            district=payload.district or "Guntur",
            state="Andhra Pradesh",
            crop=payload.crop,
            farm_size_acres=calc_res["farm_details"]["farm_size_acres"],
            soil_type=payload.soil_type,
            season="Kharif 2026",
            nitrogen_val=payload.n,
            phosphorus_val=payload.p,
            potassium_val=payload.k,
            ph_val=payload.ph,
            organic_carbon_val=payload.oc,
            calculation_result=calc_res
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        report_id = report.id

    calc_res["report_id"] = report_id
    calc_res["farmer_name"] = payload.farmer_name
    calc_res["location"] = f"{payload.village}, {payload.district}"
    return calc_res

@router.get("/history")
def get_soil_history():
    """
    Returns multi-season historical soil test records showing fertility progression over time.
    """
    return {
        "farm_name": "Main Field Plot A",
        "district": "Guntur, Andhra Pradesh",
        "seasons": [
            {
                "season": "Kharif 2025",
                "test_date": "15 July 2025",
                "crop": "Paddy",
                "n_kg_ha": 230,
                "p_kg_ha": 12,
                "k_kg_ha": 140,
                "ph": 6.2,
                "oc_pct": 0.42,
                "health_grade": "C+",
                "notes": "Low Organic Carbon and Nitrogen before compost intervention."
            },
            {
                "season": "Rabi 2025-26",
                "test_date": "10 Nov 2025",
                "crop": "Maize",
                "n_kg_ha": 275,
                "p_kg_ha": 16,
                "k_kg_ha": 165,
                "ph": 6.5,
                "oc_pct": 0.52,
                "health_grade": "B",
                "notes": "Incorporate FYM and green manure (Dhaincha). Noticeable microbial rebound."
            },
            {
                "season": "Kharif 2026",
                "test_date": "12 Oct 2026",
                "crop": "Paddy (Rice)",
                "n_kg_ha": 340,
                "p_kg_ha": 21,
                "k_kg_ha": 195,
                "ph": 6.8,
                "oc_pct": 0.64,
                "health_grade": "A-",
                "notes": "Balanced STCR fertilizer regime + Biofertilizers achieved optimal soil health."
            }
        ],
        "trends": {
            "nitrogen_trend": "+47.8% (Improving)",
            "phosphorus_trend": "+75.0% (Optimal)",
            "potassium_trend": "+39.2% (Steady)",
            "organic_carbon_trend": "+52.3% (Regenerating)",
            "ph_status": "Ideal Neutral (6.8)"
        },
        "is_demo": True
    }

@router.get("/library")
def get_soil_problem_library():
    """
    Returns practical guides on major soil degradation issues and reclamation methods.
    """
    problems = [
            {
                "id": "salinity",
                "title": "Soil Salinity (High EC)",
                "symptoms": "White salt crust on soil surface, stunted seed germination, burnt leaf tips, and patchy crop stands.",
                "causes": "High saline groundwater, over-irrigation in low drainage areas, arid climate evaporation.",
                "reclamation": [
                    "Ensure deep open field drainage ditches to lower water table.",
                    "Leach excess surface salts by ponding good quality water.",
                    "Adopt salt-tolerant varieties (e.g. CSR-36, CSR-43 for rice, KRL-210 for wheat).",
                    "Apply green manure crops like Dhaincha (Sesbania aculeata)."
                ],
                "severity_indicator": "High"
            },
            {
                "id": "acidity",
                "title": "Soil Acidity (pH < 6.0)",
                "symptoms": "Poor root elongation, Aluminium and Manganese toxicity, and severe phosphorus fixation.",
                "causes": "Heavy rainfall leaching basic cations (Ca, Mg, K), continuous unbuffered acid-forming fertilizers.",
                "reclamation": [
                    "Apply Agricultural Lime (CaCO3) or Dolomite at 250–500 kg/acre every 2–3 years.",
                    "Use Rock Phosphate or Single Super Phosphate (SSP) instead of DAP.",
                    "Incorporate compost and wood ash to naturally buffer soil reaction."
                ],
                "severity_indicator": "Medium"
            },
            {
                "id": "sodicity_alkalinity",
                "title": "Soil Sodicity & Alkalinity (pH > 8.5)",
                "symptoms": "Dispersed greasy soil surface, poor water infiltration, severe crusting when dry, high exchangeable sodium.",
                "causes": "Irrigation with high Sodium Adsorption Ratio (SAR) water, parent rock mineralogy.",
                "reclamation": [
                    "Broadcast Agricultural Gypsum (CaSO4·2H2O) at 500–1000 kg/acre based on soil test.",
                    "Plough gypsum into top 15 cm soil followed by 10 days of heavy submergence leaching.",
                    "Grow green manure Sesbania to produce organic acids that dissolve native calcium carbonate."
                ],
                "severity_indicator": "Critical"
            },
            {
                "id": "compaction",
                "title": "Subsoil Compaction & Hardpan",
                "symptoms": "Waterlogging after light rainfall, restricted shallow root penetration, poor aeration.",
                "causes": "Repeated heavy tractor tillage at uniform depth, rotavator continuous use in wet soil.",
                "reclamation": [
                    "Chisel ploughing or subsoiling to 45–60 cm depth once every 3 years in summer.",
                    "Plant deep-taprooted cover crops like Radish (Tillage Radish) or Pigeon Pea.",
                    "Adopt minimum tillage and controlled field traffic."
                ],
                "severity_indicator": "Medium"
            },
            {
                "id": "erosion",
                "title": "Topsoil Erosion & Runoff",
                "symptoms": "Rills and gullies in field, exposed tree and crop root zones, silting of downstream ponds.",
                "causes": "High velocity monsoon rain runoff on sloping land without vegetation cover.",
                "reclamation": [
                    "Construct contour bunds and vegetative barriers (Vetiver grass hedges).",
                    "Practice mulching with crop stubble to protect soil from droplet impact.",
                    "Contour ploughing across the slope rather than up and down."
                ],
                "severity_indicator": "High"
            },
            {
                "id": "micronutrient_deficiencies",
                "title": "Zinc & Iron Deficiency",
                "symptoms": "Khaira disease in rice (rusty brown spots on lower leaves), interveinal chlorosis in young leaves.",
                "causes": "Calcareous alkaline soils fixing native zinc, intensive cropping without micronutrient replenishment.",
                "reclamation": [
                    "Apply 25 kg Zinc Sulphate (ZnSO4 21%) or 15 kg Chelated Zinc/acre at soil preparation.",
                    "Foliar spray of 0.5% ZnSO4 + 0.25% lime when early symptoms appear.",
                    "Soil application of 10 kg Ferrous Sulphate mixed with 100 kg FYM."
                ],
                "severity_indicator": "Common"
            }
        ]
    problems.extend([
        {"id": "chilli_thrips", "title": "Chilli Thrips and Leaf Curl", "category": "pest", "crops": ["Chilli"], "symptoms": "Upward leaf curl, silvery scarring, bronzed leaves and stunted shoots.", "causes": "Thrips feeding on young leaves and growing tips, often worse in hot dry weather.", "reclamation": ["Inspect leaf undersides and remove heavily infested tips.", "Use blue sticky traps for monitoring.", "Use only locally registered crop protection products and follow label directions."], "prevention": "Scout twice weekly and avoid excessive nitrogen applications.", "severity_indicator": "High"},
        {"id": "paddy_leaf_blast", "title": "Rice Leaf Blast", "category": "disease", "crops": ["Rice", "Paddy (Rice)"], "symptoms": "Spindle-shaped lesions with grey centers and dark margins on leaves.", "causes": "Magnaporthe oryzae infection favored by humid weather, dense canopy and excess nitrogen.", "reclamation": ["Remove volunteer rice and infected residue.", "Avoid excessive nitrogen and maintain balanced nutrition.", "Seek local extension advice for approved fungicides."], "prevention": "Use tolerant varieties, clean seed and balanced fertilizer.", "severity_indicator": "High"},
        {"id": "cotton_aphids", "title": "Cotton Aphids and Mites", "category": "pest", "crops": ["Cotton"], "symptoms": "Leaf curling, sticky honeydew, sooty growth and fine webbing under leaves.", "causes": "Aphid and mite feeding, often encouraged by hot dry weather and broad-spectrum sprays.", "reclamation": ["Check leaf undersides and conserve ladybird beetles.", "Wash small colonies with water where practical.", "Use only crop-labelled treatments when economic thresholds are reached."], "prevention": "Monitor weekly, avoid unnecessary insecticide sprays and conserve beneficial insects.", "severity_indicator": "Medium"},
        {"id": "tomato_leaf_curl", "title": "Tomato Leaf Curl Virus", "category": "disease", "crops": ["Tomato"], "symptoms": "Upward curled, thickened leaves, shortened internodes and poor fruit set.", "causes": "Tomato leaf curl virus transmitted by whiteflies.", "reclamation": ["Remove severely infected plants early.", "Control weeds and volunteer host plants around the crop.", "Use locally recommended whitefly management; infected plants do not recover."], "prevention": "Use healthy seedlings, reflective mulch and insect-proof nursery netting.", "severity_indicator": "High"},
        {"id": "brinjal_borer", "title": "Brinjal Shoot and Fruit Borer", "category": "pest", "crops": ["Brinjal (Eggplant)"], "symptoms": "Drooping shoots and bore holes with frass on fruits.", "causes": "Larvae of Leucinodes orbonalis tunnel into shoots and fruit.", "reclamation": ["Clip and destroy affected shoots and fruits.", "Use pheromone traps for monitoring.", "Follow local integrated pest management recommendations."], "prevention": "Rotate crops and remove crop residues after harvest.", "severity_indicator": "High"},
        {"id": "wheat_nutrient_rust", "title": "Wheat Nitrogen Chlorosis and Rust", "category": "nutrient", "crops": ["Wheat"], "symptoms": "Pale older leaves or orange-brown pustules on leaf surfaces.", "causes": "Nitrogen shortage may cause general yellowing; rust fungi cause distinct raised pustules.", "reclamation": ["Distinguish nutrient deficiency from rust before treatment.", "Use soil test guidance for nitrogen top-dressing.", "Consult local extension for rust-resistant varieties and registered fungicides."], "prevention": "Use certified resistant seed and scout during cool humid weather.", "severity_indicator": "Medium"},
        {"id": "calcium_deficiency", "title": "Calcium Deficiency", "category": "nutrient", "crops": ["Tomato", "Chilli"], "symptoms": "Blossom-end rot in fruit and distortion or tip burn in young leaves.", "causes": "Low calcium uptake, irregular watering, salinity or rapid fruit growth.", "reclamation": ["Keep soil moisture even with regular irrigation.", "Check soil pH and salinity before adding amendments.", "Use a soil test to guide calcium application."], "prevention": "Maintain steady watering and avoid excessive nitrogen or potassium.", "severity_indicator": "Medium"},
        {"id": "heat_stress", "title": "Heat and Moisture Stress", "category": "weather", "crops": ["Chilli", "Tomato", "Cotton", "Maize"], "symptoms": "Midday wilting, flower drop, leaf scorch and poor fruit or grain set.", "causes": "High temperature combined with insufficient soil moisture or hot dry winds.", "reclamation": ["Irrigate early morning based on soil moisture.", "Use organic mulch to reduce evaporation.", "Avoid fertilizer or pesticide sprays during peak heat."], "prevention": "Use locally adapted planting dates and conserve soil moisture.", "severity_indicator": "High"},
    ])
    return {"problems": problems, "is_demo": True}
