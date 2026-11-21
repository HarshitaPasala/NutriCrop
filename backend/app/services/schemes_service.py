from typing import List, Optional
from app.models.support import GovtScheme, SchemeListResponse

SCHEMES_DIRECTORY: List[dict] = [
    {
        "id": "pm-kisan",
        "title": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "category": "Central",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "financial_benefit": "₹6,000 per year directly transferred to bank account in 3 equal installments of ₹2,000 every 4 months.",
        "eligibility_criteria": [
            "All landholding farmer families with cultivable land in their name",
            "Small and marginal farmers across all Indian states and UTs",
            "Institutional landholders and high-income tax payers are excluded",
        ],
        "required_documents": [
            "Aadhaar Card linked with mobile number",
            "Land ownership record (RoR / 1-B / Patta passbook)",
            "Active bank account details with Aadhaar NPCI seeding",
        ],
        "official_portal_url": "https://pmkisan.gov.in",
        "helpline": "155261 / 011-24300606",
    },
    {
        "id": "pmfby",
        "title": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
        "category": "Central",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "financial_benefit": "Comprehensive crop insurance coverage against non-preventable natural risks (drought, flood, unseasonal hail, pest epidemic).",
        "eligibility_criteria": [
            "Farmers growing notified crops in notified insurance units",
            "Available for both loanee (KCC) and non-loanee farmers",
            "Affordable farmer premium: 2% for Kharif crops, 1.5% for Rabi, 5% for commercial/horticultural crops",
        ],
        "required_documents": [
            "Sowing certificate / self-declaration of crop sown",
            "Land record document (Patta / Khatauni / Tenancy agreement)",
            "Bank passbook copy",
        ],
        "official_portal_url": "https://pmfby.gov.in",
        "helpline": "1800-180-1551 (Kisan Call Centre)",
    },
    {
        "id": "soil-health-card",
        "title": "National Soil Health Card Scheme",
        "category": "Central",
        "ministry": "Department of Agriculture & Cooperation, GoI",
        "financial_benefit": "Free cycle-wise soil testing report every 2 years with crop-specific dosage recommendations for 12 macro and micronutrients.",
        "eligibility_criteria": [
            "All agricultural landholders in rural India",
            "Soil samples collected by local Agriculture Extension Officers (AEO)",
        ],
        "required_documents": [
            "Basic farmer contact information",
            "Survey / Khasra number of the farm plot",
        ],
        "official_portal_url": "https://soilhealth.dac.gov.in",
        "helpline": "Contact your nearest KVK or Block Agriculture Office",
    },
    {
        "id": "smam-mechanization",
        "title": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "category": "Central",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "financial_benefit": "40% to 50% government subsidy for purchasing farm implements (power tillers, tractor attachments, drone sprayers, rotavators).",
        "eligibility_criteria": [
            "Individual farmers, Farmer Producer Organizations (FPOs), and Self-Help Groups (SHGs)",
            "Special preference and higher subsidy percentage for women and SC/ST farmers",
        ],
        "required_documents": [
            "Aadhaar identification card",
            "Bank passbook",
            "Quotation from authorized agricultural machinery dealer",
        ],
        "official_portal_url": "https://agrimachinery.nic.in",
        "helpline": "State Agriculture Engineering Directorate",
    },
    {
        "id": "pkvy-organic",
        "title": "Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)",
        "category": "Central",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "financial_benefit": "Financial assistance of ₹50,000 per hectare for 3 years, including ₹31,000/ha direct incentive for bio-fertilizers, neem cake, and bio-pesticides.",
        "eligibility_criteria": [
            "Farmers forming farmer clusters (minimum 20 hectares or 50 farmers per cluster)",
            "Commitment to chemical-free Participatory Guarantee System (PGS-India) certification",
        ],
        "required_documents": [
            "Cluster registration resolution",
            "Farmer land documents and photo ID",
        ],
        "official_portal_url": "https://pgsindia-ncof.gov.in",
        "helpline": "District Agriculture Officer (Organic Cell)",
    },
]

class SchemesService:
    @staticmethod
    def get_schemes(category: Optional[str] = None) -> SchemeListResponse:
        filtered = []
        for s in SCHEMES_DIRECTORY:
            if category and category.lower() != "all" and s["category"].lower() != category.lower():
                continue
            filtered.append(GovtScheme(**s))

        return SchemeListResponse(
            schemes=filtered,
            total=len(filtered),
            privacy_notice=(
                "NutriCrop does not store or process sensitive identity documents like Aadhaar cards or bank account numbers. "
                "Direct links to official .gov.in portals and nearest CSC centers are provided for safe application."
            ),
            is_demo=True,
        )
