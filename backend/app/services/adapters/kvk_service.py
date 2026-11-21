import abc
import datetime
import random
from typing import Dict, Any, List, Optional
from app.models.support import (
    KvkCenter,
    KvkSearchResponse,
    CallbackRequest,
    CallbackResponse,
)

class BaseKvkService(abc.ABC):
    @abc.abstractmethod
    def search_kvk_centers(
        self,
        district: Optional[str] = None,
        state: Optional[str] = None
    ) -> KvkSearchResponse:
        pass

    @abc.abstractmethod
    def request_callback(self, req: CallbackRequest) -> CallbackResponse:
        pass


class KvkDirectoryMockAdapter(BaseKvkService):
    KVK_CENTERS: List[Dict[str, Any]] = [
        {
            "center_id": "kvk-ap-guntur",
            "name": "Krishi Vigyan Kendra, Lam Farm",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "address": "Regional Agricultural Research Station, Lam, Guntur - 522034",
            "head_scientist": "Dr. K. Srinivasa Rao (Principal Scientist)",
            "phone": "0863-2524017",
            "email": "kvk.guntur@angrau.ac.in",
            "specialization": "Crop Pathology, Commercial Spices (Chilli), Soil Fertility",
            "kvk_zone": "Zone X (ICAR-ATARI Hyderabad)",
        },
        {
            "center_id": "kvk-ts-khammam",
            "name": "Krishi Vigyan Kendra, Wyra",
            "district": "Khammam",
            "state": "Telangana",
            "address": "PJTSAU Agricultural Research Station, Wyra, Khammam - 507165",
            "head_scientist": "Dr. V. Chaitanya (Senior Scientist & Head)",
            "phone": "08749-251230",
            "email": "kvk.wyra@pjtsau.edu.in",
            "specialization": "Integrated Pest Management (IPM), Cotton, Pulses",
            "kvk_zone": "Zone X (ICAR-ATARI Hyderabad)",
        },
        {
            "center_id": "kvk-pb-ludhiana",
            "name": "Krishi Vigyan Kendra, Samrala",
            "district": "Ludhiana",
            "state": "Punjab",
            "address": "Punjab Agricultural University (PAU) Campus, Samrala, Ludhiana - 141114",
            "head_scientist": "Dr. Gurdeep Singh (Associate Director)",
            "phone": "01628-261597",
            "email": "kvk.samrala@pau.edu",
            "specialization": "Cereal Agronomy, Farm Mechanization, Direct Seeded Rice (DSR)",
            "kvk_zone": "Zone I (ICAR-ATARI Ludhiana)",
        },
        {
            "center_id": "kvk-mh-solapur",
            "name": "Krishi Vigyan Kendra, Kegaon",
            "district": "Solapur",
            "state": "Maharashtra",
            "address": "Near Old Pune Naka, Kegaon, Solapur - 413255",
            "head_scientist": "Dr. L. R. Tambade (Senior Scientist)",
            "phone": "0217-2744747",
            "email": "kvk.solapur@mpkv.ac.in",
            "specialization": "Dryland Horticulture (Pomegranate), Cotton, Soil Conservation",
            "kvk_zone": "Zone VIII (ICAR-ATARI Pune)",
        },
        {
            "center_id": "kvk-ka-davangere",
            "name": "ICAR-Taralabalu Krishi Vigyan Kendra",
            "district": "Davangere",
            "state": "Karnataka",
            "address": "Kadirammanahalli, Anagodu Post, Davangere - 577556",
            "head_scientist": "Dr. T. N. Devaraja (Head & Senior Scientist)",
            "phone": "08192-263462",
            "email": "dvgkvk@yahoo.com",
            "specialization": "Plant Health Clinic, Seed Production, Maize Nutrition",
            "kvk_zone": "Zone XI (ICAR-ATARI Bengaluru)",
        },
        {
            "center_id": "kvk-tn-madurai",
            "name": "Krishi Vigyan Kendra, Agricultural College",
            "district": "Madurai",
            "state": "Tamil Nadu",
            "address": "Tamil Nadu Agricultural University (TNAU) Campus, Madurai - 625104",
            "head_scientist": "Dr. P. Kumaravel (Professor & Head)",
            "phone": "0452-2422955",
            "email": "kvkmdu@tnau.ac.in",
            "specialization": "Organic Farming, Bio-fertilizer Production, Weed Science",
            "kvk_zone": "Zone X (ICAR-ATARI Hyderabad)",
        },
    ]

    def search_kvk_centers(
        self,
        district: Optional[str] = None,
        state: Optional[str] = None
    ) -> KvkSearchResponse:
        filtered = []
        for c in self.KVK_CENTERS:
            if district and district.lower() not in c["district"].lower():
                continue
            if state and state.lower() not in c["state"].lower():
                continue
            filtered.append(KvkCenter(**c))

        if not filtered:
            filtered = [KvkCenter(**c) for c in self.KVK_CENTERS]

        return KvkSearchResponse(
            centers=filtered,
            total=len(filtered),
            kisan_call_center_toll_free="1800-180-1551",
            operational_hours="6:00 AM to 10:00 PM (All 7 Days)",
            is_demo=True,
        )

    def request_callback(self, req: CallbackRequest) -> CallbackResponse:
        t_id = f"KVK-TKT-{random.randint(10000, 99999)}"
        return CallbackResponse(
            status="confirmed",
            ticket_id=t_id,
            message=(
                f"Namaste {req.farmer_name}! Your advisory consultation request for {req.crop} "
                f"has been queued at {req.district} Krishi Vigyan Kendra. An agricultural officer "
                f"speaking {req.preferred_language.upper()} will call {req.phone}."
            ),
            estimated_callback_time="Within 2 to 4 business hours",
            is_demo=True,
        )


def get_kvk_service() -> BaseKvkService:
    return KvkDirectoryMockAdapter()
