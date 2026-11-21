import abc
import csv
import os
import json
import base64
import hashlib
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
ANNOTATIONS_CSV = os.path.join(ROOT_DIR, "Crop_Disease_Images", "annotations.csv")

def load_chemical_labels() -> Dict[str, Any]:
    path = os.path.join(DATA_DIR, "approved_chemical_labels.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)["labels"]
    return {}

class BaseVisionService(abc.ABC):
    @abc.abstractmethod
    def diagnose_crop_image(self, filename: str, image_bytes: Optional[bytes] = None, crop_hint: Optional[str] = None, force_confidence: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    def get_sample_leaves(self) -> List[Dict[str, Any]]:
        pass

class ExpertDatasetVisionService(BaseVisionService):
    def __init__(self):
        self.labels = load_chemical_labels()
        self.samples = self._load_curated_samples()

    def _load_curated_samples(self) -> List[Dict[str, Any]]:
        # Pre-indexed benchmark samples from Crop_Disease_Images
        return [
            {
                "id": "sample-chilli-thrips",
                "crop": "Chilli",
                "diagnosis": "Chilli Thrips (Scirtothrips dorsalis)",
                "confidence_score": 0.92,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00387.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00387.jpg",
                "sample_label": "Chilli - Thrips Infestation",
                "symptoms": "Upward curling ('boat-shaped') and severe deformation of tender leaves. Stunted shoot growth and bronzing on leaf undersides.",
                "cause": "Infestation by tiny rasping-sucking yellow thrips insects during dry warm spells.",
                "organic_treatments": [
                    { "name": "Neem Oil 10,000 ppm", "dosage": "3 ml per litre water", "method": "Foliar spray targeting underside of leaves every 7 days" },
                    { "name": "Blue & Yellow Sticky Traps", "dosage": "20–25 traps per acre", "method": "Erect at crop canopy height to monitor and trap adult flying thrips" },
                    { "name": "Lecanicillium lecanii (Verticillium)", "dosage": "5 g per litre water", "method": "Bio-insecticide spray during evening hours" }
                ],
                "verified_label_key": "thrips",
                "prevention": [
                    "Avoid continuous mono-cropping of solanaceous crops (Chilli, Tomato, Brinjal).",
                    "Maintain field borders with barrier crops like Maize or Sorghum to reduce wind-borne thrips migration.",
                    "Spray cold water jets to dislodge thrips colonies during early vegetative stage."
                ]
            },
            {
                "id": "sample-paddy-blast",
                "crop": "Paddy (Rice)",
                "diagnosis": "Paddy Leaf Blast (Magnaporthe oryzae)",
                "confidence_score": 0.94,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00181.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00181.jpg",
                "sample_label": "Paddy - Leaf Blast Fungal Spots",
                "symptoms": "Spindle-shaped or eye-shaped lesions with grayish-white centers and dark brown or reddish-brown borders along leaf blades.",
                "cause": "Fungal spore infection promoted by high humidity (>90%), cool night temperatures (18-20°C), and excessive chemical nitrogen fertilization.",
                "organic_treatments": [
                    { "name": "Pseudomonas fluorescens 0.5% WP", "dosage": "10 g per litre water", "method": "Prophylactic foliar spray at tillering stage" },
                    { "name": "Fermented Cow Dung-Urine Slurry (Jeevamrutha)", "dosage": "200 L per acre", "method": "Spray to enhance leaf surface microbial antagonism" }
                ],
                "verified_label_key": "blast",
                "prevention": [
                    "Avoid split doses of chemical urea during overcast conditions.",
                    "Ensure adequate silicon and potassium nutrition to thicken leaf epidermal silica cells.",
                    "Use blast-tolerant certified varieties like BPT 5204 or MTU 1010."
                ]
            },
            {
                "id": "sample-cotton-aphids",
                "crop": "Cotton",
                "diagnosis": "Cotton Aphids & Two-Spotted Spider Mites",
                "confidence_score": 0.89,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00505.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00505.jpg",
                "sample_label": "Cotton - Aphids & Mites",
                "symptoms": "Reddish-brown necrotic speckles coalescing into larger patches. Leaves turn brittle, cup downwards, and drop prematurely. Bolls remain undersized.",
                "cause": "Colonies of sap-sucking nymphs congregating along leaf veins during high temperature and dry humidity.",
                "organic_treatments": [
                    { "name": "Wettable Sulphur 80% WDG", "dosage": "2.5 g per litre water", "method": "Foliar application for natural mite suppression" },
                    { "name": "Dashaparni Kashayam", "dosage": "200 ml per 15 L pump", "method": "Traditional herbal botanical extract" },
                    { "name": "Predatory Ladybird Beetles (Coccinellids)", "dosage": "Natural conservation", "method": "Avoid broad-spectrum sprays to preserve natural aphid predators" }
                ],
                "verified_label_key": "aphids",
                "prevention": [
                    "Avoid excessive Nitrogen top-dressing which stimulates succulent vegetative growth favoured by aphids.",
                    "Install yellow sticky cards across field borders.",
                    "Monitor regularly and spray when more than 10 aphids are observed per leaf."
                ]
            },
            {
                "id": "sample-tomato-leafcurl",
                "crop": "Tomato",
                "diagnosis": "Tomato Leaf Curl Virus (ToLCV) via Whiteflies",
                "confidence_score": 0.91,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00849.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00849.jpg",
                "sample_label": "Tomato - Leaf Curl & Whiteflies",
                "symptoms": "Upward curling, puckering, thickening and chlorosis of young tomato leaves with severe plant stunting and flower drop.",
                "cause": "Begomovirus transmitted persistently by sap-sucking whitefly (Bemisia tabaci) insects.",
                "organic_treatments": [
                    { "name": "Yellow Sticky Polyethylene Sheets", "dosage": "30 traps per acre", "method": "Erect at crop canopy to catch whitefly vectors" },
                    { "name": "Neem Seed Kernel Extract (NSKE 5%)", "dosage": "50 g per litre water", "method": "Repellent foliar spray during early vegetative stage" }
                ],
                "verified_label_key": "leaf_curl_virus",
                "prevention": [
                    "Grow 2-3 border rows of Maize or Sorghum as a physical barrier to wind-blown whiteflies.",
                    "Roguing and immediate burning of early infected plants.",
                    "Mulching with silver or yellow reflective plastic sheets."
                ]
            },
            {
                "id": "sample-brinjal-borer",
                "crop": "Brinjal (Eggplant)",
                "diagnosis": "Shoot and Fruit Borer (Leucinodes orbonalis)",
                "confidence_score": 0.88,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00904.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00904.jpg",
                "sample_label": "Brinjal - Shoot & Fruit Borer",
                "symptoms": "Drooping and wilting of terminal growing shoots ('dead hearts'). Holes and circular exit tunnels filled with larval frass in developing fruits.",
                "cause": "Larvae of the shoot borer moth boring inside tender stems and fruits.",
                "organic_treatments": [
                    { "name": "Pheromone Traps (Lucilure)", "dosage": "12–15 traps per acre", "method": "Hang 30 cm above crop canopy to mass-trap male moths" },
                    { "name": "Bacillus thuringiensis (Bt) kurstaki", "dosage": "2 g per litre water", "method": "Apply at early egg-hatching stage" },
                    { "name": "Manual Clipping of Wilted Shoots", "dosage": "Weekly field inspection", "method": "Clip off wilting shoots with borer inside and destroy by burning/burying" }
                ],
                "verified_label_key": "pod_borer",
                "prevention": [
                    "Promptly collect and destroy all fallen and infested fruits.",
                    "Crop rotation with non-solanaceous legumes or cereals.",
                    "Release egg parasitoid Trichogramma chilonis @ 50,000/acre at weekly intervals."
                ]
            },
            {
                "id": "sample-wheat-nitrogen",
                "crop": "Wheat",
                "diagnosis": "Wheat Foliar Nitrogen Chlorosis & Mild Rust",
                "confidence_score": 0.87,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00034.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00034.jpg",
                "sample_label": "Wheat - Nitrogen Deficiency & Chlorosis",
                "symptoms": "Uniform pale yellowing starting from bottom older leaves upwards in an inverted V-shape. Restricted tillering and thin stems.",
                "cause": "Insufficient root-zone available nitrogen or excessive leaching following flood irrigation.",
                "organic_treatments": [
                    { "name": "Foliar 2% Urea Spray with Jaggery", "dosage": "20 g urea per litre water", "method": "Spray uniformly on dry leaves during late afternoon" },
                    { "name": "Vermicompost Top-Dressing", "dosage": "500 kg per acre", "method": "Broadcast before second crown root irrigation" }
                ],
                "verified_label_key": None,
                "prevention": [
                    "Apply nitrogen in 3 equal splits: basal, first irrigation (CRI), and boot stage.",
                    "Incorporate Azotobacter seed bio-inoculant at sowing time."
                ]
            },
            {
                "id": "sample-potato-calcium",
                "crop": "Potato",
                "diagnosis": "Calcium Deficiency (Nutrient Disorder)",
                "confidence_score": 0.85,
                "confidence_tier": "High",
                "image_path": "Crop_Disease_Images/images/00541.jpg",
                "thumb_url": "/api/v1/crop-doctor/sample-image/00541.jpg",
                "sample_label": "Potato - Calcium Deficiency",
                "symptoms": "Youngest terminal leaves remain small, distorted, and cupping upwards with scorched margins. Tuber internal brown spots / rust spots.",
                "cause": "Low soil calcium availability, acidic pH, or moisture stress impairing xylem transpirational calcium flow.",
                "organic_treatments": [
                    { "name": "Gypsum or Dolomite Soil Application", "dosage": "150–200 kg per acre", "method": "Apply at earthing-up stage around plant base" },
                    { "name": "Foliar Calcium Nitrate", "dosage": "4–5 g per litre water", "method": "Spray 2–3 times during active tuber initiation" },
                    { "name": "Regular Uniform Soil Moisture", "dosage": "Maintain 65–70% field capacity", "method": "Prevent dry spells that block calcium uptake" }
                ],
                "verified_label_key": None, # Non-chemical disorder
                "prevention": [
                    "Conduct Soil Health Card test before planting to verify base calcium saturation.",
                    "Maintain soil pH between 5.5 and 6.5.",
                    "Ensure adequate mulching to prevent soil temperature spikes in root zone."
                ]
            }
        ]

    def get_sample_leaves(self) -> List[Dict[str, Any]]:
        return self.samples

    def diagnose_crop_image(
        self,
        filename: str,
        image_bytes: Optional[bytes] = None,
        crop_hint: Optional[str] = None,
        force_confidence: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Diagnoses crop leaf image with confidence evaluation and strict safety rule enforcement.
        """
        # Determine confidence tier: 'high', 'medium', 'low', or 'none' (healthy/no disease)
        tier = (force_confidence or "high").lower()
        name_lower = (filename or "").lower()
        hint_lower = (crop_hint or "").lower()

        # Match against sample library by crop hint or filename
        sample_match = self.samples[0]
        for s in self.samples:
            s_crop = s["crop"].lower()
            if (hint_lower and (hint_lower in s_crop or s_crop in hint_lower)) or \
               (s_crop in name_lower or s["id"] in name_lower):
                sample_match = s
                break

        # The local expert dataset contains curated benchmark diagnoses.
        # Require crop context or confidence tier for triage when analyzing raw uploaded photos.
        if image_bytes and not crop_hint and not force_confidence:
            raise RuntimeError(
                "Custom photo analysis is not configured. Set VISION_MODEL_MODE=gemini and "
                "VISION_MODEL_API_KEY, or enable CROP_DOCTOR_MOCK=true for the bundled demo images."
            )

        if tier == "none" or "healthy" in name_lower or "normal" in name_lower:
            confidence_score = 0.96
            confidence_tier = "High"
            diagnosis_name = f"Healthy {sample_match['crop']} Leaf (No Disease Detected)"
            symptoms = "Leaf surface exhibits uniform green pigmentation, normal venation, and zero signs of chlorosis, necrosis, fungal sporulation, or pest rasping."
            cause = "Foliage in healthy vegetative condition. Balanced plant nutrition and absence of active pathogen infestation."
            verified_chemicals = []
            organic_treatments = [
                {
                    "name": "Preventive Jeevamrutha or Panchagavya Spray",
                    "dosage": "200 L per acre",
                    "method": "Foliar mist every 15 days to nurture protective beneficial microbes on leaf phyllosphere."
                },
                {
                    "name": "Neem Oil 1500 ppm (Preventive)",
                    "dosage": "2 ml per litre water",
                    "method": "Prophylactic spray to deter wandering insect pests."
                }
            ]
            prevention = [
                "Continue balanced N-P-K applications as advised by your Soil Health Card.",
                "Maintain uniform soil moisture without water stagnation.",
                "Perform routine weekly crop scouting."
            ]
        elif tier == "low":
            confidence_score = 0.42
            confidence_tier = "Low"
            diagnosis_name = f"Uncertain Symptoms on {sample_match['crop']} Leaf"
            symptoms = "Image resolution, lighting, or focus is insufficient to distinguish between fungal leaf spot and bacterial infection with certainty."
            cause = "Ambiguous visual pattern. Multiple overlapping stress factors or background noise may be present."
            # SAFETY RULE: Enforce dosage suppression on low confidence
            verified_chemicals = [
                {
                    "active_ingredient": "Consult an Agricultural Expert",
                    "trade_examples": "N/A",
                    "dosage_per_acre": "Consult a KVK / agri expert for dosage",
                    "concentration": "Consult a KVK / agri expert for dosage",
                    "application_method": "Do not apply chemical pesticides without physical leaf inspection by a specialist.",
                    "phi_days": None,
                    "toxicity_class": "N/A",
                    "ppe_required": "N/A",
                    "safety_warning": "CRITICAL: Never apply chemical fungicides or pesticides based on an uncertain AI diagnosis."
                }
            ]
            organic_treatments = sample_match["organic_treatments"]
            prevention = sample_match["prevention"]
        elif tier == "medium":
            confidence_score = 0.68
            confidence_tier = "Medium"
            diagnosis_name = f"Likely {sample_match['diagnosis']} (Tentative)"
            symptoms = sample_match["symptoms"]
            cause = sample_match["cause"]
            # Moderate confidence: show organic remedies and recommend clearer photo
            verified_chemicals = self._get_verified_chemicals(sample_match["verified_label_key"], is_medium_confidence=True)
            organic_treatments = sample_match["organic_treatments"]
            prevention = sample_match["prevention"]
        else:
            confidence_score = 0.92
            confidence_tier = "High"
            diagnosis_name = sample_match["diagnosis"]
            symptoms = sample_match["symptoms"]
            cause = sample_match["cause"]
            verified_chemicals = self._get_verified_chemicals(sample_match["verified_label_key"], is_medium_confidence=False)
            organic_treatments = sample_match["organic_treatments"]
            prevention = sample_match["prevention"]

        return {
            "diagnosis": diagnosis_name,
            "crop": sample_match["crop"],
            "confidence_score": confidence_score,
            "confidence_percentage": int(confidence_score * 100),
            "confidence_tier": confidence_tier,
            "symptoms": symptoms,
            "cause": cause,
            "organic_treatments": organic_treatments,
            "verified_chemical_treatments": verified_chemicals,
            "prevention": prevention,
            "safety_rule_enforced": True,
            "expert_help_available": True,
            "sample_matched": sample_match["id"],
            "is_demo": True,
            "ai_disclaimer": "AI recommendations are advisory and can occasionally be inaccurate. Always verify symptoms with your district KVK scientist or Agricultural Officer before purchasing chemicals."
        }

    def _get_verified_chemicals(self, label_key: Optional[str], is_medium_confidence: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves CIBRC approved label claims or suppresses dosage per safety rule.
        """
        if not label_key or label_key not in self.labels:
            return [
                {
                    "active_ingredient": "Nutritional Supplement / Bio-fertilizer",
                    "trade_examples": "Non-chemical intervention",
                    "dosage_per_acre": "Consult a KVK / agri expert for dosage",
                    "concentration": "Consult a KVK / agri expert for dosage",
                    "application_method": "This diagnosis is a physiological nutrient deficiency or lacks a verified CIBRC pesticide label claim.",
                    "phi_days": 0,
                    "toxicity_class": "Non-toxic (Nutritional)",
                    "ppe_required": "Standard agricultural handling",
                    "safety_warning": "No chemical pesticide required for physiological nutrient disorders."
                }
            ]

        label_data = self.labels[label_key]
        products = []
        for p in label_data["verified_products"]:
            products.append({
                "active_ingredient": p["active_ingredient"],
                "trade_examples": p["trade_examples"],
                "dosage_per_acre": p["dosage_per_acre"] if not is_medium_confidence else "Consult a KVK / agri expert for dosage (Tentative Diagnosis)",
                "concentration": p["concentration"] if not is_medium_confidence else "Consult a KVK / agri expert for dosage",
                "application_method": p["application_method"],
                "phi_days": p["phi_days"],
                "toxicity_class": p["toxicity_class"],
                "ppe_required": p["ppe_required"],
                "safety_warning": p.get("bee_warning", "Adhere strictly to label recommendations")
            })
        return products

class MockCropVisionService(BaseVisionService):
    """Deterministic demo service restricted to known, licensed fixture bytes."""

    FIXTURES = {
        "7988ffb5ac1de6f4a3cebec7a2b326123b1c090ef46890cea02097427e41cff6": "healthy-onion",
        "0e2afd02bea55c969de15c18db9bf05d5abc712d8571ad2bae528d60e8efeae9": "sample-tomato-leafcurl",
        "33cd0c2aea4938a14026b9f68b29eec5da9628debc81607ec3671b7a9526bf62": "sample-paddy-blast",
    }

    def __init__(self):
        self.expert = ExpertDatasetVisionService()

    def get_sample_leaves(self) -> List[Dict[str, Any]]:
        return self.expert.get_sample_leaves()

    def diagnose_crop_image(self, filename: str, image_bytes: Optional[bytes] = None, crop_hint: Optional[str] = None, force_confidence: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        digest = hashlib.sha256(image_bytes or b"").hexdigest()
        fixture = self.FIXTURES.get(digest)
        if not fixture:
            raise RuntimeError(
                "Mock mode only recognizes its bundled example photos. Configure Gemini with "
                "VISION_MODEL_API_KEY to analyze other images."
            )
        if fixture == "healthy-onion":
            return {
                "diagnosis": "Healthy Onion Leaf (No Disease Detected)", "crop": "Onion",
                "confidence_score": 0.96, "confidence_percentage": 96, "confidence_tier": "High",
                "severity": "none", "is_healthy": True,
                "symptoms": "The bundled healthy example shows no clear signs of disease.",
                "cause": "Bundled demo fixture labeled Healthy in the source dataset.",
                "organic_treatments": [], "verified_chemical_treatments": [],
                "prevention": ["Continue regular crop scouting.", "Use balanced nutrition and irrigation."],
                "safety_rule_enforced": True, "expert_help_available": True,
                "sample_matched": None, "is_demo": True,
                "ai_disclaimer": "Demo result from a fixed test photo; it is not an analysis of your uploaded crop.",
            }
        result = self.expert.diagnose_crop_image(
            filename=f"{fixture}.jpg",
            crop_hint=next((sample["crop"] for sample in self.expert.samples if sample["id"] == fixture), crop_hint),
            force_confidence=force_confidence, language=language
        )
        result["is_demo"] = True
        result["ai_disclaimer"] = "Demo result from a fixed test photo; it is not an analysis of your uploaded crop."
        return result


class CloudVisionService(BaseVisionService):
    """
    Production Cloud Vision / Fine-tuned image classification adapter.
    """
    def __init__(self, api_key: str, model_name: Optional[str] = None):
        self.api_key = api_key
        self.model_name = model_name or settings.VISION_MODEL_NAME

    def diagnose_crop_image(self, filename: str, image_bytes: Optional[bytes] = None, crop_hint: Optional[str] = None, force_confidence: Optional[str] = None, language: str = "en") -> Dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("Gemini vision is selected but VISION_MODEL_API_KEY is not configured")
        if not image_bytes:
            return ExpertDatasetVisionService().diagnose_crop_image(filename, crop_hint=crop_hint, force_confidence=force_confidence, language=language)
        mime_type = "image/png" if image_bytes.startswith(b"\x89PNG") else "image/webp" if image_bytes.startswith(b"RIFF") else "image/jpeg"
        prompt = f'''You are a cautious crop disease triage assistant for Indian farmers. Analyze the attached crop photo. Farmer selected crop: {crop_hint or "unknown"}. Respond in language code {language}. Return only JSON with keys crop, disease_name, local_name, confidence (0..1), severity (low|medium|high|unknown), symptoms_seen (array), cause, is_healthy (boolean), treatment (object with organic, low_cost_chemical, cultural arrays; each item has name, dose, method, estimated_cost_inr_per_acre), estimated_cost_per_acre (number or null), prevention (array), when_to_see_expert. If blurry, not a plant, or uncertain, set confidence below 0.5, disease_name to "Not sure", severity to "unknown", and recommend retaking or expert inspection. Do not invent a confirmed diagnosis or recommend banned/restricted pesticides. Prefer low-cost cultural and organic actions; chemical advice must be checked against currently approved labels with KVK.'''
        response = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent",
            headers={"x-goog-api-key": self.api_key, "Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": mime_type, "data": base64.b64encode(image_bytes).decode("ascii")}}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1}},
            timeout=30.0,
        )
        response.raise_for_status()
        payload = response.json()
        diagnosis = json.loads(payload["candidates"][0]["content"]["parts"][0]["text"])
        required = {"crop", "disease_name", "confidence", "severity", "symptoms_seen", "cause", "is_healthy", "treatment", "prevention"}
        if not isinstance(diagnosis, dict) or not required.issubset(diagnosis):
            raise ValueError("Vision provider returned incomplete diagnosis data")
        confidence = max(0.0, min(1.0, float(diagnosis["confidence"])))
        tier = "High" if confidence >= 0.8 else "Medium" if confidence >= 0.5 else "Low"
        treatment = diagnosis["treatment"] if isinstance(diagnosis["treatment"], dict) else {}
        def entries(group: str) -> List[Dict[str, Any]]:
            values = treatment.get(group, [])
            return [{**item, "dosage": item["dose"]} for item in values if isinstance(item, dict) and all(key in item for key in ("name", "dose", "method"))] if isinstance(values, list) else []
        uncertain = confidence < 0.5
        return {
            "diagnosis": "Not sure" if uncertain else str(diagnosis["disease_name"]), "local_name": str(diagnosis.get("local_name") or ""),
            "crop": str(diagnosis["crop"] or crop_hint or "Unknown"), "confidence_score": confidence,
            "confidence_percentage": round(confidence * 100), "confidence_tier": tier, "severity": "unknown" if uncertain else str(diagnosis["severity"]),
            "is_healthy": False if uncertain else bool(diagnosis["is_healthy"]), "symptoms": "; ".join(str(x) for x in diagnosis["symptoms_seen"] if isinstance(x, str)),
            "cause": "The photo could not be assessed with enough confidence for a cause." if uncertain else str(diagnosis["cause"]),
            "organic_treatments": [] if uncertain else entries("organic") + entries("cultural"),
            # Do not label generated suggestions as government-verified product claims.
            "verified_chemical_treatments": [], "prevention": ([
                "Retake the photo in bright, even light with the leaf filling most of the frame.",
                "Ask a local KVK expert to inspect the plant before taking action.",
                "Do not apply a pesticide based on this uncertain result.",
            ] if uncertain else diagnosis["prevention"] if isinstance(diagnosis["prevention"], list) else []),
            "estimated_cost_per_acre": diagnosis.get("estimated_cost_per_acre"),
            "when_to_see_expert": str(diagnosis.get("when_to_see_expert") or "Contact your local KVK or agriculture officer for confirmation."),
            "safety_rule_enforced": True, "expert_help_available": True, "is_demo": False,
            "chemical_review_required": True,
            "ai_disclaimer": "AI guidance is a first check. Confirm the diagnosis and pesticide labels with your local KVK or agriculture officer before use."
        }

    def get_sample_leaves(self) -> List[Dict[str, Any]]:
        return ExpertDatasetVisionService().get_sample_leaves()

def get_vision_service() -> BaseVisionService:
    if settings.VISION_MODEL_MODE in ("gemini", "cloud_vision"):
        return CloudVisionService(
            api_key=settings.VISION_MODEL_API_KEY or os.getenv("VISION_MODEL_API_KEY", ""),
            model_name=settings.VISION_MODEL_NAME,
        )
    if settings.CROP_DOCTOR_MOCK:
        return MockCropVisionService()
    return ExpertDatasetVisionService()
