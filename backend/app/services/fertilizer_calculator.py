import json
import os
import math
from typing import Dict, Any, Optional, List

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_crop_rules() -> Dict[str, Any]:
    path = os.path.join(DATA_DIR, "crop_nutrient_rules.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["crops"]

def load_fertilizer_prices() -> Dict[str, Any]:
    path = os.path.join(DATA_DIR, "fertilizer_prices.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["fertilizers"]

class FertilizerCalculatorService:
    def __init__(self):
        self.crop_rules = load_crop_rules()
        self.fertilizers = load_fertilizer_prices()

    def classify_nutrient(self, n: float, p: float, k: float, ph: float, oc: Optional[float] = None) -> Dict[str, Any]:
        """
        Classifies soil nutrient status according to ICAR / Soil Health Card benchmarks.
        """
        # Nitrogen (N) kg/ha
        if n < 280:
            n_status = "Low"
            n_factor = 1.25 # 25% increase
            n_comment = "Deficient. Crop requires +25% additional nitrogen to achieve optimal yield."
        elif n <= 560:
            n_status = "Medium"
            n_factor = 1.0 # 100% standard RDF
            n_comment = "Sufficient for normal growth. Apply standard recommended nitrogen dose."
        else:
            n_status = "High"
            n_factor = 0.75 # 25% reduction to prevent lodging and pest attack
            n_comment = "Abundant. Reduce nitrogen input by 25% to prevent insect vulnerability and input wastage."

        # Phosphorus (P2O5) kg/ha
        if p < 10:
            p_status = "Low"
            p_factor = 1.25
            p_comment = "Deficient. Apply +25% phosphate for root vigor and early establishment."
        elif p <= 25:
            p_status = "Medium"
            p_factor = 1.0
            p_comment = "Optimal range. Follow crop standard phosphorus application."
        else:
            p_status = "High"
            p_factor = 0.75
            p_comment = "High reserves in soil. Reduce phosphate dosage by 25%."

        # Potassium (K2O) kg/ha
        if k < 108:
            k_status = "Low"
            k_factor = 1.25
            k_comment = "Deficient. Apply +25% potash to bolster drought resistance and stem strength."
        elif k <= 280:
            k_status = "Medium"
            k_factor = 1.0
            k_comment = "Normal range. Apply standard potash recommendation."
        else:
            k_status = "High"
            k_factor = 0.75
            k_comment = "Rich in potassium. Reduce potash application by 25%."

        # Organic Carbon (%)
        oc_val = oc if oc is not None else 0.55
        if not math.isfinite(oc_val) or not 0.01 <= oc_val <= 5.0:
            raise ValueError("Organic Carbon must be between 0.01 and 5.0 percent")
        if oc_val < 0.50:
            oc_status = "Low"
            oc_comment = "Low organic matter. Soil biological activity and moisture retention are compromised."
        elif oc_val <= 0.75:
            oc_status = "Medium"
            oc_comment = "Moderate organic matter. Maintain with crop residues and compost."
        else:
            oc_status = "High"
            oc_comment = "Healthy organic carbon reserves. Excellent microbial biodiversity."

        # Soil pH
        if ph < 5.5:
            ph_status = "Strongly Acidic"
            ph_comment = "Severe acidity. Risk of Aluminium/Manganese toxicity and phosphorus fixation."
            remedy = "Apply agricultural lime (CaCO3) or dolomite at 200–400 kg/acre."
        elif ph < 6.5:
            ph_status = "Moderately Acidic"
            ph_comment = "Mild acidity. Minor phosphorus fixation risk."
            remedy = "Incorporate well-decomposed organic manure and consider light liming if sensitive crop."
        elif ph <= 7.5:
            ph_status = "Neutral (Optimal)"
            ph_comment = "Ideal soil reaction. All primary and secondary macro/micronutrients are readily available."
            remedy = "Maintain current soil management practices."
        elif ph <= 8.5:
            ph_status = "Moderately Alkaline"
            ph_comment = "Alkaline reaction. Micronutrients like Zinc, Iron, and Boron may get locked."
            remedy = "Apply farmyard manure (FYM), use ammonium-based fertilizers, and supplement with Zinc Sulphate."
        else:
            ph_status = "Strongly Alkaline / Sodic"
            ph_comment = "Excess sodium saturation. Soil structure is dispersed with poor water infiltration."
            remedy = "Apply agricultural gypsum at 500–1000 kg/acre followed by leaching irrigation."

        return {
            "n": {"value": n, "status": n_status, "factor": n_factor, "comment": n_comment},
            "p": {"value": p, "status": p_status, "factor": p_factor, "comment": p_comment},
            "k": {"value": k, "status": k_status, "factor": k_factor, "comment": k_comment},
            "oc": {"value": oc_val, "status": oc_status, "comment": oc_comment},
            "ph": {"value": ph, "status": ph_status, "comment": ph_comment, "remedy": remedy}
        }

    def calculate(
        self,
        n: float,
        p: float,
        k: float,
        ph: float,
        farm_size: float,
        crop: str,
        soil_type: str = "Alluvial",
        unit: str = "acre",
        oc: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes complete scientific fertilizer dosage and cost comparison equations.
        """
        if not all(math.isfinite(value) for value in (n, p, k, ph, farm_size)) or farm_size <= 0:
            raise ValueError("Soil inputs must be finite numbers and farm size must be greater than zero")
        if unit.lower() not in ["acre", "acres", "hectare", "hectares", "ha"]:
            raise ValueError("Farm size unit must be acre or hectare")
        crop_key = crop.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")
        crop_info = self.crop_rules.get(crop_key, self.crop_rules["paddy"])

        # Normalize farm size to both Acres and Hectares
        if unit.lower() in ["hectare", "ha", "hectares"]:
            farm_size_ha = farm_size
            farm_size_acres = round(farm_size * 2.47105, 2)
        else:
            farm_size_acres = farm_size
            farm_size_ha = round(farm_size * 0.404686, 3)

        # 1. Nutrient Status Analysis
        nutrients = self.classify_nutrient(n, p, k, ph, oc)

        # 2. Adjusted RDF per Hectare
        adj_rdf_n = round(crop_info["rdf_n"] * nutrients["n"]["factor"], 1)
        adj_rdf_p = round(crop_info["rdf_p2o5"] * nutrients["p"]["factor"], 1)
        adj_rdf_k = round(crop_info["rdf_k2o"] * nutrients["k"]["factor"], 1)

        # Net nutrient requirement for entire farm plot (kg)
        net_n = round(adj_rdf_n * farm_size_ha, 1)
        net_p = round(adj_rdf_p * farm_size_ha, 1)
        net_k = round(adj_rdf_k * farm_size_ha, 1)

        # 3. Formulation 1: Traditional Chemical Combination (Urea + DAP + MOP)
        # DAP supplies 46% P2O5 and 18% N
        dap_kg = round(net_p / 0.46, 1) if net_p > 0 else 0
        n_from_dap = round(dap_kg * 0.18, 1)
        rem_n_for_urea = max(0.0, net_n - n_from_dap)
        urea_kg = round(rem_n_for_urea / 0.46, 1)
        mop_kg = round(net_k / 0.60, 1) if net_k > 0 else 0

        urea_bags = math.ceil(urea_kg / 45) if urea_kg > 0 else 0
        dap_bags = math.ceil(dap_kg / 50) if dap_kg > 0 else 0
        mop_bags = math.ceil(mop_kg / 50) if mop_kg > 0 else 0

        cost_f1 = round(
            (urea_bags * self.fertilizers["urea"]["bag_price_inr"]) +
            (dap_bags * self.fertilizers["dap"]["bag_price_inr"]) +
            (mop_bags * self.fertilizers["mop"]["bag_price_inr"]),
            2
        )

        # 4. Formulation 2: Complex Fertilizer Formulation (NPK 10:26:26 + Urea)
        # 10:26:26 satisfies P2O5 and part of K2O and N
        npk_10_26_kg = round(net_p / 0.26, 1) if net_p > 0 else 0
        npk_bags = math.ceil(npk_10_26_kg / 50) if npk_10_26_kg > 0 else 0
        n_from_complex = round(npk_10_26_kg * 0.10, 1)
        k_from_complex = round(npk_10_26_kg * 0.26, 1)

        f2_rem_n = max(0.0, net_n - n_from_complex)
        f2_urea_kg = round(f2_rem_n / 0.46, 1)
        f2_urea_bags = math.ceil(f2_urea_kg / 45) if f2_urea_kg > 0 else 0

        f2_rem_k = max(0.0, net_k - k_from_complex)
        f2_mop_kg = round(f2_rem_k / 0.60, 1) if f2_rem_k > 0 else 0
        f2_mop_bags = math.ceil(f2_mop_kg / 50) if f2_mop_kg > 0 else 0

        cost_f2 = round(
            (npk_bags * self.fertilizers["npk_10_26_26"]["bag_price_inr"]) +
            (f2_urea_bags * self.fertilizers["urea"]["bag_price_inr"]) +
            (f2_mop_bags * self.fertilizers["mop"]["bag_price_inr"]),
            2
        )

        # 5. Formulation 3: Integrated Nutrient Management (INM - 75% Chemical + Organic Biofertilizer)
        inm_urea_kg = round(urea_kg * 0.75, 1)
        inm_dap_kg = round(dap_kg * 0.75, 1)
        inm_mop_kg = round(mop_kg * 0.75, 1)
        inm_urea_bags = math.ceil(inm_urea_kg / 45)
        inm_dap_bags = math.ceil(inm_dap_kg / 50)
        inm_mop_bags = math.ceil(inm_mop_kg / 50)

        # Base FYM recommendation is adjusted to the Soil Health Card OC class.
        fym_tons_per_acre = 2.5 if nutrients["oc"]["status"] == "Low" else 2.0 if nutrients["oc"]["status"] == "Medium" else 1.5
        fym_tons = round(farm_size_acres * fym_tons_per_acre, 1)
        biofert_packets = math.ceil(farm_size_acres * 2) # 2 packets (Azotobacter/Rhizobium + PSB)

        chemical_part_cost = (
            (inm_urea_bags * self.fertilizers["urea"]["bag_price_inr"]) +
            (inm_dap_bags * self.fertilizers["dap"]["bag_price_inr"]) +
            (inm_mop_bags * self.fertilizers["mop"]["bag_price_inr"])
        )
        bio_cost = biofert_packets * self.fertilizers["biofertilizer"]["price_per_unit"]
        cost_f3 = round(chemical_part_cost + bio_cost, 2)

        # Financial savings comparing Option 1 vs INM chemical savings
        chemical_savings_inr = round(cost_f1 - chemical_part_cost, 2)

        # 6. Application Splitting Schedule (Basal & Top Dressings)
        splits_result = []
        for split in crop_info.get("splits", []):
            stage_n = round((urea_kg * split["n_pct"]) / 100, 1)
            stage_dap = round(dap_kg if split.get("p_pct", 0) > 0 else 0, 1)
            stage_k = round((mop_kg * split.get("k_pct", 0)) / 100, 1)

            splits_result.append({
                "stage": split["stage"],
                "days_after_sowing": split["days"],
                "urea_kg": stage_n,
                "dap_kg": stage_dap,
                "mop_kg": stage_k,
                "action_guidance": f"Apply {stage_n} kg Urea" + (f", {stage_dap} kg DAP" if stage_dap > 0 else "") + (f", {stage_k} kg Potash" if stage_k > 0 else "") + " when soil has optimum moisture."
            })

        # 7. Soil Amendments (Liming / Gypsum)
        soil_amendments = []
        if ph < 5.8:
            lime_needed_kg = round(farm_size_acres * 250, 1)
            lime_bags = math.ceil(lime_needed_kg / 50)
            soil_amendments.append({
                "name": "Agricultural Dolomitic Lime",
                "reason": "Neutralize soil acidity and supply calcium/magnesium",
                "quantity_kg": lime_needed_kg,
                "bags": lime_bags,
                "est_cost_inr": round(lime_bags * self.fertilizers["lime"]["bag_price_inr"], 2)
            })
        elif ph > 8.5:
            gypsum_needed_kg = round(farm_size_acres * 500, 1)
            gypsum_bags = math.ceil(gypsum_needed_kg / 50)
            soil_amendments.append({
                "name": "Agricultural Gypsum",
                "reason": "Displace excess exchangeable sodium and restore soil permeability",
                "quantity_kg": gypsum_needed_kg,
                "bags": gypsum_bags,
                "est_cost_inr": round(gypsum_bags * self.fertilizers["gypsum"]["bag_price_inr"], 2)
            })

        # 8. Organic Alternatives & Soil Improvement Tips
        organic_recommendations = [
            {
                "practice": "Farm Yard Manure (FYM)",
                "dosage": f"{fym_tons} tonnes ({fym_tons_per_acre} tonnes/acre)",
                "benefit": f"Enriches organic carbon ({nutrients['oc']['status']} class) and supports soil structure and water retention."
            },
            {
                "practice": "Biofertilizers (Azotobacter / Rhizobium + PSB)",
                "dosage": f"{biofert_packets} packets (250g each)",
                "benefit": "Fixes 20–25 kg atmospheric Nitrogen/ha and solubilizes locked insoluble soil Phosphorus."
            },
            {
                "practice": "Green Manuring (Sesbania / Dhaincha)",
                "dosage": "Incorporate at 45–50 days before main crop transplanting",
                "benefit": "Adds 60–80 kg biological Nitrogen per hectare and prevents topsoil erosion."
            }
        ]

        status_scores = {"Low": 40, "Medium": 70, "High": 90}
        ph_score = 90 if 6.0 <= ph <= 7.5 else 70 if 5.5 <= ph <= 8.5 else 45
        soil_health_score = round(
            status_scores[nutrients["n"]["status"]] * 0.25
            + status_scores[nutrients["p"]["status"]] * 0.15
            + status_scores[nutrients["k"]["status"]] * 0.15
            + status_scores[nutrients["oc"]["status"]] * 0.30
            + ph_score * 0.15
        )
        soil_health_rating = "Good" if soil_health_score >= 75 else "Needs improvement" if soil_health_score < 55 else "Fair"

        return {
            "soil_health_score": soil_health_score,
            "soil_health_rating": soil_health_rating,
            "soil_health_score_note": "Estimated indicator from the submitted N, P, K, organic carbon and pH classes; use a lab Soil Health Card for official assessment.",
            "farm_details": {
                "crop": crop_info["name"],
                "farm_size_acres": farm_size_acres,
                "farm_size_ha": farm_size_ha,
                "soil_type": soil_type,
                "citation": crop_info["citation"],
                "base_rdf": f"{crop_info['rdf_n']}:{crop_info['rdf_p2o5']}:{crop_info['rdf_k2o']} N:P2O5:K2O kg/ha"
            },
            "soil_nutrient_status": nutrients,
            "net_nutrient_requirements_kg": {
                "nitrogen_n": net_n,
                "phosphorus_p2o5": net_p,
                "potassium_k2o": net_k
            },
            "formulations_comparison": [
                {
                    "id": "option_1_traditional",
                    "title": "Option A: Urea + DAP + MOP",
                    "subtitle": "Standard chemical combination most widely available in cooperative societies",
                    "badge": "Most Popular",
                    "fertilizers": [
                        {"name": "Neem Coated Urea (46% N)", "quantity_kg": urea_kg, "bags": urea_bags, "bag_size": "45 kg", "cost": round(urea_bags * 266.50, 2)},
                        {"name": "DAP (18-46-0)", "quantity_kg": dap_kg, "bags": dap_bags, "bag_size": "50 kg", "cost": round(dap_bags * 1350.00, 2)},
                        {"name": "MOP Potash (60% K2O)", "quantity_kg": mop_kg, "bags": mop_bags, "bag_size": "50 kg", "cost": round(mop_bags * 1700.00, 2)}
                    ],
                    "total_bags": urea_bags + dap_bags + mop_bags,
                    "estimated_cost_inr": cost_f1,
                    "cost_per_acre_inr": round(cost_f1 / farm_size_acres, 2)
                },
                {
                    "id": "option_2_complex",
                    "title": "Option B: Complex NPK (10:26:26) + Urea",
                    "subtitle": "Granular balanced blend ensuring even field distribution of all 3 macronutrients",
                    "badge": "Balanced Blend",
                    "fertilizers": [
                        {"name": "Complex NPK (10:26:26)", "quantity_kg": npk_10_26_kg, "bags": npk_bags, "bag_size": "50 kg", "cost": round(npk_bags * 1470.00, 2)},
                        {"name": "Neem Coated Urea (46% N)", "quantity_kg": f2_urea_kg, "bags": f2_urea_bags, "bag_size": "45 kg", "cost": round(f2_urea_bags * 266.50, 2)},
                        {"name": "MOP Potash (60% K2O)", "quantity_kg": f2_mop_kg, "bags": f2_mop_bags, "bag_size": "50 kg", "cost": round(f2_mop_bags * 1700.00, 2)}
                    ],
                    "total_bags": npk_bags + f2_urea_bags + f2_mop_bags,
                    "estimated_cost_inr": cost_f2,
                    "cost_per_acre_inr": round(cost_f2 / farm_size_acres, 2)
                },
                {
                    "id": "option_3_inm",
                    "title": "Option C: Integrated Nutrient Management (INM)",
                    "subtitle": "75% Chemical Fertilizer + Biofertilizers & FYM for maximum soil health and cost reduction",
                    "badge": "Recommended for Soil Health",
                    "fertilizers": [
                        {"name": "Urea (Reduced 75%)", "quantity_kg": inm_urea_kg, "bags": inm_urea_bags, "bag_size": "45 kg", "cost": round(inm_urea_bags * 266.50, 2)},
                        {"name": "DAP (Reduced 75%)", "quantity_kg": inm_dap_kg, "bags": inm_dap_bags, "bag_size": "50 kg", "cost": round(inm_dap_bags * 1350.00, 2)},
                        {"name": "MOP Potash (Reduced 75%)", "quantity_kg": inm_mop_kg, "bags": inm_mop_bags, "bag_size": "50 kg", "cost": round(inm_mop_bags * 1700.00, 2)},
                        {"name": "Biofertilizer Packets", "quantity_kg": f"{biofert_packets} pkts", "bags": biofert_packets, "bag_size": "250 g", "cost": bio_cost}
                    ],
                    "total_bags": inm_urea_bags + inm_dap_bags + inm_mop_bags,
                    "estimated_cost_inr": cost_f3,
                    "cost_per_acre_inr": round(cost_f3 / farm_size_acres, 2),
                    "chemical_savings_inr": chemical_savings_inr
                }
            ],
            "application_schedule": splits_result,
            "soil_amendments": soil_amendments,
            "organic_alternatives": organic_recommendations,
            "is_demo": True
        }

fertilizer_calculator = FertilizerCalculatorService()
