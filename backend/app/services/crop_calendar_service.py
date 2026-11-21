import datetime
from typing import Dict, Any, List, Optional
from app.models.calendar import CropStage, CropCalendarResponse

CROP_STAGE_DEFINITIONS = {
    "Chilli": {
        "base_duration": 150,
        "stages": [
            {
                "name": "Nursery & Land Preparation",
                "das_pct": (0, 0.10),
                "description": "Nursery raising on raised beds, deep ploughing, and FYM application.",
                "activities": ["Plough field to fine tilth", "Apply 10 tonnes FYM/acre", "Treat seeds with Trichoderma @ 10g/kg"],
                "nutrient": "Basal DAP 50 kg + MOP 25 kg per acre",
                "irrigation": "Light irrigation to nursery beds every 2-3 days",
                "pest": "Monitor for damping-off fungus in nursery beds",
                "weather_risk": "Protect young seedlings from heavy downpours with shade netting."
            },
            {
                "name": "Transplanting & Establishment",
                "das_pct": (0.10, 0.22),
                "description": "Transplanting 35-40 day old seedlings into the main field with proper spacing.",
                "activities": ["Transplant seedlings at 60x45 cm spacing", "Drench seedling roots with Biofertilizer slurry", "Gap filling within 7 days"],
                "nutrient": "Zinc sulphate @ 10 kg/acre if deficient",
                "irrigation": "Immediate life irrigation after transplanting; repeat on day 3",
                "pest": "Install blue sticky traps for early thrips detection",
                "weather_risk": "Avoid transplanting during extreme hot afternoons."
            },
            {
                "name": "Vegetative Growth & First Top-Dressing",
                "das_pct": (0.22, 0.40),
                "description": "Rapid branching and foliage development.",
                "activities": ["First shallow inter-cultivation and weeding", "Side-dressing of nitrogen", "Earthing up"],
                "nutrient": "Urea @ 30 kg/acre + Neem cake coating",
                "irrigation": "Irrigate at 7-10 day intervals; avoid water stagnation",
                "pest": "Inspect underside of leaves for chilli thrips and yellow mites",
                "weather_risk": "Clear weather required before top-dressing fertilizer."
            },
            {
                "name": "Flowering & Fruit Set",
                "das_pct": (0.40, 0.65),
                "description": "Profuse flowering and initial fruit development.",
                "activities": ["Foliar spray of Planofix (NAA) @ 4 ml/15 L to prevent flower drop", "Place yellow sticky traps", "Ensure pollinator activity"],
                "nutrient": "13-0-45 (Potassium Nitrate) foliar spray @ 5g/L",
                "irrigation": "Critical moisture stage; water stress causes flower drop",
                "pest": "Monitor for Helicoverpa pod borer and Anthracnose fruit rot",
                "weather_risk": "High humidity and overcast skies trigger Anthracnose die-back."
            },
            {
                "name": "Pod Maturation & Green Harvest",
                "das_pct": (0.65, 0.85),
                "description": "Green chillies reach harvest size; continuous picking every 10-14 days.",
                "activities": ["Harvest green chillies in early morning", "Grade and pack in ventilated crates", "Remove diseased fallen pods"],
                "nutrient": "Light MOP application @ 15 kg/acre to improve fruit pungency and color",
                "irrigation": "Moderate irrigation immediately after each picking",
                "pest": "Check for fruit borer entrance holes in developing pods",
                "weather_risk": "Do not harvest during wet rain spells to avoid post-harvest rotting."
            },
            {
                "name": "Red Ripening & Final Harvest",
                "das_pct": (0.85, 1.00),
                "description": "Chillies turn deep uniform red for drying and powder production.",
                "activities": ["Final pickings of ripe red pods", "Sun-dry on clean tarpaulins for 10-15 days", "Store at <10% moisture"],
                "nutrient": "None (crop near termination)",
                "irrigation": "Withhold irrigation 10 days before final picking",
                "pest": "Inspect drying yard for storage moulds",
                "weather_risk": "Protect drying pods from unseasonal rain with tarpaulin covers."
            }
        ]
    },
    "Rice": {
        "base_duration": 125,
        "stages": [
            {
                "name": "Nursery & Puddling",
                "das_pct": (0, 0.18),
                "description": "Wet bed nursery raising and main field puddling to reduce percolation.",
                "activities": ["Puddle field twice with rotavator", "Level field thoroughly", "Incorporate green manure (Dhaincha)"],
                "nutrient": "Basal: DAP 40 kg + MOP 20 kg + Zinc Sulphate 10 kg/acre",
                "irrigation": "Maintain 2-3 cm standing water during puddling",
                "pest": "Treat seed with Carbendazim against blast",
                "weather_risk": "Ensure good drainage to prevent seed wash in nursery."
            },
            {
                "name": "Transplanting & Tillering",
                "das_pct": (0.18, 0.40),
                "description": "Transplanting 2-3 seedlings per hill; vegetative tillering.",
                "activities": ["Transplant at 20x15 cm spacing", "Cono-weeder operation at 15 and 30 DAT"],
                "nutrient": "First top-dressing: Urea 35 kg/acre",
                "irrigation": "Maintain thin layer of 2 cm water until tillering",
                "pest": "Monitor for yellow stem borer dead hearts and leaf folder",
                "weather_risk": "Excess water prevents vigorous tillering."
            },
            {
                "name": "Panicle Initiation & Booting",
                "das_pct": (0.40, 0.65),
                "description": "Transition from vegetative to reproductive phase; panicle emerging.",
                "activities": ["Second top-dressing of N and K", "Field scouting for bacterial leaf blight"],
                "nutrient": "Urea 25 kg + MOP 15 kg/acre",
                "irrigation": "Maintain 5 cm water depth without allowing soil to crack",
                "pest": "Check for Brown Planthopper (BPH) at the base of stems",
                "weather_risk": "Strong winds during flowering cause spikelet sterility."
            },
            {
                "name": "Flowering & Grain Filling (Milk to Dough)",
                "das_pct": (0.65, 0.85),
                "description": "Anthesis followed by rapid starch accumulation in grains.",
                "activities": ["Monitor grain filling uniformity", "Erect bird scaring flags"],
                "nutrient": "Foliar spray of 0.5% zinc sulphate if deficiency appears",
                "irrigation": "Alternate wetting and drying; do not let soil dry completely",
                "pest": "Scout for Gundhi bug which sucks sap from milky grains",
                "weather_risk": "Rains during milking wash away pollen."
            },
            {
                "name": "Ripening & Harvesting",
                "das_pct": (0.85, 1.00),
                "description": "Golden yellow turning of 80% grains; physiological maturity.",
                "activities": ["Drain field completely 10 days before harvest", "Harvest at 20-22% grain moisture", "Thresh and dry to 14%"],
                "nutrient": "None",
                "irrigation": "Drain completely",
                "pest": "Rat control along field bunds",
                "weather_risk": "Cyclonic rain at harvest causes lodging and seed germination in earhead."
            }
        ]
    },
    "Wheat": {
        "base_duration": 120,
        "stages": [
            {
                "name": "Sowing & Crown Root Initiation (CRI)",
                "das_pct": (0, 0.20),
                "description": "Seed drilling and critical first root establishment.",
                "activities": ["Drill seed at 20 cm row spacing", "Ensure seed depth 4-5 cm", "Apply seed treatment"],
                "nutrient": "Basal: DAP 55 kg + MOP 20 kg/acre",
                "irrigation": "First and most critical irrigation at 21 DAS (CRI stage)",
                "pest": "Check for termite attack in sandy soils",
                "weather_risk": "Delayed winter cold can retard crown root initiation."
            },
            {
                "name": "Tillering & Jointing",
                "das_pct": (0.20, 0.45),
                "description": "Stem elongation and rapid tiller development.",
                "activities": ["First weeding / herbicide spray at 30-35 DAS", "Top-dress nitrogen"],
                "nutrient": "Urea 45 kg/acre before second irrigation",
                "irrigation": "Second irrigation at tillering (40-45 DAS)",
                "pest": "Scout for yellow rust stripes on lower leaves",
                "weather_risk": "Warm temperature (>25°C) restricts tiller numbers."
            },
            {
                "name": "Flowering & Heading",
                "das_pct": (0.45, 0.70),
                "description": "Earhead emergence and pollination.",
                "activities": ["Foliar spray of 19-19-19 water soluble fertilizer", "Monitor for aphid colonies on heads"],
                "nutrient": "Foliar spray: 13-0-45 @ 10g/L",
                "irrigation": "Third irrigation at flowering stage (65-70 DAS)",
                "pest": "Aphids and Karnal Bunt surveillance",
                "weather_risk": "High winds right after irrigation cause severe crop lodging."
            },
            {
                "name": "Grain Filling & Milk Stage",
                "das_pct": (0.70, 0.88),
                "description": "Starch deposition in kernels.",
                "activities": ["Protect from bird damage", "Inspect kernel weight"],
                "nutrient": "None",
                "irrigation": "Light irrigation at early dough stage if dry winds prevail",
                "pest": "Aphid predators (ladybird beetles) conservation",
                "weather_risk": "Terminal heat stress (hot winds in March) shrivels grain."
            },
            {
                "name": "Maturity & Combine Harvesting",
                "das_pct": (0.88, 1.00),
                "description": "Straw turns dry yellow and grains harden.",
                "activities": ["Harvest with combine harvester when grains crack under teeth", "Bale straw; avoid burning"],
                "nutrient": "None",
                "irrigation": "Dry field completely",
                "pest": "Store grain in clean, fumigated metal bins",
                "weather_risk": "Hailstorm or unseasonal March rain causes shattering."
            }
        ]
    },
    "Cotton": {
        "base_duration": 160,
        "stages": [
            {
                "name": "Sowing & Square Emergence",
                "das_pct": (0, 0.25),
                "description": "Seed germination, thinning, and first floral bud (square) formation.",
                "activities": ["Dibble seeds at 90x60 cm", "Thin to one healthy seedling per hill", "Inter-cultivation"],
                "nutrient": "Basal: 10:26:26 @ 50 kg/acre + Neem cake",
                "irrigation": "Light furrow irrigation",
                "pest": "Check for sucking pests (Jassids, Thrips, Whiteflies)",
                "weather_risk": "Heavy rain after sowing causes soil crusting and poor emergence."
            },
            {
                "name": "Squaring to Peak Flowering",
                "das_pct": (0.25, 0.55),
                "description": "Profuse flowering and sympodial branch growth.",
                "activities": ["First top-dressing of Urea", "Install pink bollworm pheromone traps (5/acre)", "Detopping at 90 DAS"],
                "nutrient": "Urea 35 kg + MOP 20 kg/acre",
                "irrigation": "Critical irrigation at 12-15 day intervals",
                "pest": "Scout for Pink Bollworm rosette flowers and Whitefly honeydew",
                "weather_risk": "Continuous cloudy weather causes massive square and flower shedding."
            },
            {
                "name": "Boll Development & Maturation",
                "das_pct": (0.55, 0.80),
                "description": "Boll enlargement and fiber synthesis.",
                "activities": ["Magnesium sulphate 1% foliar spray against leaf reddening", "Maintain trap catches log"],
                "nutrient": "0-0-50 (SOP) foliar spray @ 5g/L",
                "irrigation": "Provide timely moisture to avoid premature boll opening",
                "pest": "Pink bollworm larval entry in green bolls",
                "weather_risk": "Moisture stress reduces staple fiber length."
            },
            {
                "name": "Boll Bursting & Picking",
                "das_pct": (0.80, 1.00),
                "description": "Bolls burst open revealing clean white seed cotton lint.",
                "activities": ["Pick clean open bolls in dry sunny mornings", "Do not mix stained or insect-damaged cotton", "Store in dry room"],
                "nutrient": "None",
                "irrigation": "Stop irrigation after 135 DAS to assist uniform boll opening",
                "pest": "Protect harvested cotton from cotton stainer bug",
                "weather_risk": "Rain during boll bursting discolors lint and degrades quality."
            }
        ]
    },
    "Maize": {
        "base_duration": 110,
        "stages": [
            {
                "name": "Sowing & Seedling Establishment",
                "das_pct": (0, 0.20),
                "description": "Seed germination and seedling establishment.",
                "activities": ["Sow at 60x20 cm spacing", "Apply basal fertilizer"],
                "nutrient": "Basal DAP 50 kg + MOP 25 kg/acre",
                "irrigation": "Initial light irrigation after sowing",
                "pest": "Scout for Fall Armyworm (FAW) in leaf whorls",
                "weather_risk": "Avoid waterlogging in early seedling stage."
            },
            {
                "name": "Knee-High Stage (Vegetative)",
                "das_pct": (0.20, 0.45),
                "description": "Rapid stem elongation and leaf growth.",
                "activities": ["Inter-cultivation and earthing up", "First top-dressing"],
                "nutrient": "Urea 35 kg/acre",
                "irrigation": "Critical irrigation at knee-high stage (30-35 DAS)",
                "pest": "Apply Neem formulations for FAW prevention",
                "weather_risk": "Moisture stress during knee-high reduces yield."
            },
            {
                "name": "Tasseling & Silking Stage",
                "das_pct": (0.45, 0.70),
                "description": "Tassel emergence and silk pollination.",
                "activities": ["Second top-dressing of N and K", "Field inspection for stem borers"],
                "nutrient": "Urea 25 kg + MOP 15 kg/acre",
                "irrigation": "Most critical irrigation stage; do not allow moisture deficit",
                "pest": "Monitor silk cut by earworm",
                "weather_risk": "Extreme heat (>38°C) desiccatess pollen and reduces seed set."
            },
            {
                "name": "Grain Filling & Dough Stage",
                "das_pct": (0.70, 0.88),
                "description": "Starch deposition in kernels.",
                "activities": ["Maintain adequate soil moisture", "Bird scaring"],
                "nutrient": "Foliar spray 00-00-50 @ 5g/L if needed",
                "irrigation": "Light irrigation at grain dough stage",
                "pest": "Inspect cobs for fungal mold",
                "weather_risk": "Cloudy humid weather can trigger cob rot."
            },
            {
                "name": "Physiological Maturity & Harvest",
                "das_pct": (0.88, 1.00),
                "description": "Black layer formation at kernel base; husk turns straw yellow.",
                "activities": ["Harvest when husk dries completely", "De-husk and shell cobs", "Dry to 12% moisture"],
                "nutrient": "None",
                "irrigation": "Withhold irrigation 10 days before harvest",
                "pest": "Fumigate stored grain",
                "weather_risk": "Rain at harvest causes cob sprouting."
            }
        ]
    },
    "Tomato": {
        "base_duration": 120,
        "stages": [
            {
                "name": "Nursery & Transplanting",
                "das_pct": (0, 0.20),
                "description": "Seedling raising and transplanting to raised ridges.",
                "activities": ["Transplant 25-30 day seedlings at 60x45 cm", "Dip roots in Trichoderma slurry"],
                "nutrient": "Basal 10:26:26 @ 50 kg/acre + FYM",
                "irrigation": "Life irrigation immediately after planting",
                "pest": "Install yellow sticky traps for whiteflies",
                "weather_risk": "Protect tender transplants from harsh afternoon sun."
            },
            {
                "name": "Vegetative Branching & Staking",
                "das_pct": (0.20, 0.45),
                "description": "Erecting stakes and side shoots pruning.",
                "activities": ["Staking with bamboo sticks and twine", "First top dressing"],
                "nutrient": "Urea 30 kg + Micronutrient foliar spray",
                "irrigation": "Irrigate at 5-7 day intervals",
                "pest": "Scout for leaf miner and early blight",
                "weather_risk": "Over-irrigation leads to damping-off and root rot."
            },
            {
                "name": "Flowering & Fruit Set",
                "das_pct": (0.45, 0.70),
                "description": "Flower clusters and initial fruit development.",
                "activities": ["Spray boron 20% @ 1g/L to prevent blossom end rot", "Pheromone traps for fruit borer"],
                "nutrient": "13-0-45 foliar spray @ 5g/L",
                "irrigation": "Consistent moisture to prevent fruit cracking",
                "pest": "Fruit borer (Helicoverpa) surveillance",
                "weather_risk": "Temperature >32°C causes flower drop."
            },
            {
                "name": "Fruit Maturation & Pickings",
                "das_pct": (0.70, 1.00),
                "description": "Continuous fruit picking at breaker to red-ripe stage.",
                "activities": ["Harvest at breaker stage for long-distance transport", "Grade and crate fruits"],
                "nutrient": "Calcium nitrate spray @ 3g/L",
                "irrigation": "Light irrigation after every 2 pickings",
                "pest": "Fruit rot and whitefly control",
                "weather_risk": "Sudden rains after dry spells cause severe fruit splitting."
            }
        ]
    },
    "Mustard": {
        "base_duration": 115,
        "stages": [
            {
                "name": "Sowing & Emergence",
                "das_pct": (0, 0.18),
                "description": "Drilling seeds in moist seedbed and thinning.",
                "activities": ["Line sowing at 30x10 cm", "Thinning at 15-20 DAS to one plant per hill"],
                "nutrient": "Basal DAP 40 kg + Sulphur 15 kg/acre",
                "irrigation": "Pre-sowing irrigation essential",
                "pest": "Treat seed with Thiamethoxam against painted bug",
                "weather_risk": "Delayed sowing beyond October drastically cuts oil yield."
            },
            {
                "name": "Vegetative & Branching",
                "das_pct": (0.18, 0.45),
                "description": "Primary and secondary branching.",
                "activities": ["First weeding and inter-culture", "Top-dressing nitrogen"],
                "nutrient": "Urea 35 kg/acre before first irrigation",
                "irrigation": "First irrigation at 30-35 DAS (flowering initiation)",
                "pest": "Scout for mustard aphid colonies on inflorescence",
                "weather_risk": "Cloudy weather triggers rapid aphid multiplication."
            },
            {
                "name": "Flowering & Pod (Siliqua) Formation",
                "das_pct": (0.45, 0.75),
                "description": "Golden yellow flowering and pod filling.",
                "activities": ["Protect bee pollinators during morning hours", "Aphid management with Neem or Dimethoate"],
                "nutrient": "Foliar spray of 19-19-19 @ 5g/L",
                "irrigation": "Second irrigation at siliqua development (60-65 DAS)",
                "pest": "Mustard aphid and white rust",
                "weather_risk": "Frost and fog in December-January cause siliqua blight."
            },
            {
                "name": "Pod Ripening & Harvesting",
                "das_pct": (0.75, 1.00),
                "description": "Pods turn yellow-brown; seeds darken.",
                "activities": ["Harvest in early morning to avoid seed shattering", "Sun-dry on threshing floor"],
                "nutrient": "None",
                "irrigation": "Stop all irrigation",
                "pest": "Store seed at <8% moisture",
                "weather_risk": "High winds during maturity cause heavy shattering loss."
            }
        ]
    },
    "Potato": {
        "base_duration": 100,
        "stages": [
            {
                "name": "Tuber Planting & Sprouting",
                "das_pct": (0, 0.20),
                "description": "Placing sprouted seed tubers on ridges.",
                "activities": ["Plant well-sprouted certified seed tubers (40-50g) at 60x20 cm", "Ridging"],
                "nutrient": "Basal 12:32:16 @ 60 kg + MOP 30 kg/acre",
                "irrigation": "Light furrow irrigation right after planting",
                "pest": "Seed dip with Mancozeb against seed-borne rots",
                "weather_risk": "Temperature >25°C retards tuber initiation."
            },
            {
                "name": "Vegetative Growth & Earthing Up",
                "das_pct": (0.20, 0.45),
                "description": "Foliage canopy development and tuber initiation.",
                "activities": ["First and second earthing up at 25 and 40 DAP to cover developing tubers", "Side-dressing Urea"],
                "nutrient": "Urea 40 kg/acre before earthing up",
                "irrigation": "Irrigate at 8-10 day intervals; keep ridges moist but not waterlogged",
                "pest": "Monitor for late blight water-soaked lesions",
                "weather_risk": "Prolonged cloudy cool weather (<18°C) causes rapid late blight epidemics."
            },
            {
                "name": "Tuber Bulking Stage",
                "das_pct": (0.45, 0.80),
                "description": "Rapid tuber enlargement and starch accumulation.",
                "activities": ["Prophylactic spray of Mancozeb against late blight", "Check that tubers do not get exposed to light (prevents greening)"],
                "nutrient": "Foliar spray 00-00-50 @ 5g/L to boost tuber size",
                "irrigation": "Critical moisture stage; maintain uniform furrow moisture",
                "pest": "Aphids (vector for potato viruses) surveillance",
                "weather_risk": "Water stress at bulking causes knobby or cracked tubers."
            },
            {
                "name": "Dehaulming & Harvest",
                "das_pct": (0.80, 1.00),
                "description": "Cutting haulms (foliage) 10-12 days before digging to cure skin.",
                "activities": ["Dehaulm vines with sickle or chemical 10 days before harvest", "Dig tubers gently in dry soil", "Cure in shade for 10 days"],
                "nutrient": "None",
                "irrigation": "Stop irrigation 10 days before dehaulming",
                "pest": "Inspect for potato tuber moth in storage",
                "weather_risk": "Rains during digging cause tuber rotting in transit."
            }
        ]
    }
}

class CropCalendarService:
    @staticmethod
    def get_supported_crops() -> List[Dict[str, Any]]:
        return [
            {"crop": "Chilli", "variety_types": ["short", "medium", "long"], "default_duration": 150, "ideal_season": "Kharif / Rabi"},
            {"crop": "Rice", "variety_types": ["short", "medium", "long"], "default_duration": 125, "ideal_season": "Kharif"},
            {"crop": "Wheat", "variety_types": ["short", "medium", "long"], "default_duration": 120, "ideal_season": "Rabi"},
            {"crop": "Cotton", "variety_types": ["short", "medium", "long"], "default_duration": 160, "ideal_season": "Kharif"},
        ]

    @staticmethod
    def generate_calendar(
        crop: str,
        variety_duration: str, # 'short', 'medium', 'long'
        sowing_date_str: str,
        district: Optional[str] = "Guntur"
    ) -> CropCalendarResponse:
        crop_data = CROP_STAGE_DEFINITIONS.get(crop, CROP_STAGE_DEFINITIONS["Chilli"])
        base_dur = crop_data["base_duration"]

        multiplier = 1.0
        if variety_duration == "short":
            multiplier = 0.85
        elif variety_duration == "long":
            multiplier = 1.15

        total_days = int(base_dur * multiplier)

        try:
            sowing_date = datetime.datetime.strptime(sowing_date_str, "%Y-%m-%d").date()
        except Exception:
            sowing_date = datetime.date.today() - datetime.timedelta(days=35)

        today = datetime.date.today()
        current_das = (today - sowing_date).days
        current_das = max(0, min(current_das, total_days + 15))

        stages: List[CropStage] = []
        current_stage_name = "Completed"
        next_activity = "Prepare field for next crop rotation"

        for idx, sdef in enumerate(crop_data["stages"]):
            s_start = int(sdef["das_pct"][0] * total_days)
            s_end = int(sdef["das_pct"][1] * total_days)

            d_start = sowing_date + datetime.timedelta(days=s_start)
            d_end = sowing_date + datetime.timedelta(days=s_end)

            if current_das < s_start:
                status = "upcoming"
            elif current_das <= s_end:
                status = "current"
                current_stage_name = sdef["name"]
                next_activity = sdef["activities"][0] if sdef["activities"] else "Field inspection"
            else:
                status = "completed"

            stage = CropStage(
                stage_id=f"stage-{idx+1}",
                stage_number=idx + 1,
                name=sdef["name"],
                das_range=f"{s_start} – {s_end} DAS",
                start_das=s_start,
                end_das=s_end,
                target_start_date=d_start.strftime("%d %b %Y"),
                target_end_date=d_end.strftime("%d %b %Y"),
                status=status,
                description=sdef["description"],
                key_activities=sdef["activities"],
                nutrient_application=sdef.get("nutrient"),
                irrigation_advisory=sdef["irrigation"],
                pest_monitoring=sdef["pest"],
                weather_risk_alert=sdef.get("weather_risk"),
            )
            stages.append(stage)

        # If beyond all stages
        if current_das > total_days:
            current_stage_name = "Harvest Completed"
            next_activity = "Soil testing for next crop season"

        harvest_date = sowing_date + datetime.timedelta(days=total_days)

        return CropCalendarResponse(
            calendar_id=f"cal-{crop.lower()}-{variety_duration}",
            crop=crop,
            variety_duration=variety_duration,
            sowing_date=sowing_date.strftime("%d %b %Y"),
            expected_harvest_date=harvest_date.strftime("%d %b %Y"),
            total_duration_days=total_days,
            current_das=current_das,
            current_stage_name=current_stage_name,
            stages=stages,
            next_key_activity=next_activity,
            is_demo=True,
        )
