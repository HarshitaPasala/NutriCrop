import abc
import datetime
import math
import os
import csv
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.models.support import MandiRecord, MandiResponse

class BaseMandiService(abc.ABC):
    @abc.abstractmethod
    def get_prices(
        self,
        commodity: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        market_center: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
    ) -> MandiResponse:
        pass

    @abc.abstractmethod
    def get_crops_by_area(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        pass

    @abc.abstractmethod
    def get_markets(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        pass


class AgmarknetMockAdapter(BaseMandiService):
    """
    Adapter representing AGMARKNET APMC wholesale arrival rates,
    aligned with crops from Crop_Disease_Images and major Indian agricultural mandis.
    """

    MANDI_DATABASE: List[Dict[str, Any]] = [
        # Andhra Pradesh
        {
            "id": "mandi-ap-1",
            "commodity": "Chilli",
            "variety": "Guntur Teja (Dry Red)",
            "market_center": "Guntur APMC Yard",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "min_price_quintal": 18200.0,
            "max_price_quintal": 22400.0,
            "modal_price_quintal": 20800.0,
            "price_trend": "rising",
            "change_percent": 3.8,
        },
        {
            "id": "mandi-ap-2",
            "commodity": "Paddy (Rice)",
            "variety": "Common (BPT 5204 / Sona Masuri)",
            "market_center": "Tenali Market Yard",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "min_price_quintal": 2320.0,
            "max_price_quintal": 2480.0,
            "modal_price_quintal": 2420.0,
            "price_trend": "rising",
            "change_percent": 2.1,
        },
        {
            "id": "mandi-ap-3",
            "commodity": "Cotton",
            "variety": "Medium Staple",
            "market_center": "Guntur APMC Yard",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "min_price_quintal": 6900.0,
            "max_price_quintal": 7400.0,
            "modal_price_quintal": 7200.0,
            "price_trend": "stable",
            "change_percent": 0.8,
        },
        {
            "id": "mandi-ap-4",
            "commodity": "Paddy (Rice)",
            "variety": "Swarna (MTU 7029)",
            "market_center": "Gudivada APMC",
            "district": "Krishna",
            "state": "Andhra Pradesh",
            "min_price_quintal": 2280.0,
            "max_price_quintal": 2420.0,
            "modal_price_quintal": 2360.0,
            "price_trend": "stable",
            "change_percent": 0.5,
        },
        {
            "id": "mandi-ap-5",
            "commodity": "Tomato",
            "variety": "Hybrid Red",
            "market_center": "Madanapalle APMC",
            "district": "Chittoor",
            "state": "Andhra Pradesh",
            "min_price_quintal": 1400.0,
            "max_price_quintal": 2100.0,
            "modal_price_quintal": 1850.0,
            "price_trend": "rising",
            "change_percent": 5.4,
        },
        {
            "id": "mandi-ap-6",
            "commodity": "Cotton",
            "variety": "Bunny / Brahma",
            "market_center": "Adoni APMC Yard",
            "district": "Kurnool",
            "state": "Andhra Pradesh",
            "min_price_quintal": 6750.0,
            "max_price_quintal": 7350.0,
            "modal_price_quintal": 7100.0,
            "price_trend": "rising",
            "change_percent": 1.2,
        },
        {
            "id": "mandi-ap-7",
            "commodity": "Groundnut",
            "variety": "TMV-2 Pods",
            "market_center": "Dharmavaram APMC",
            "district": "Anantapur",
            "state": "Andhra Pradesh",
            "min_price_quintal": 6100.0,
            "max_price_quintal": 6800.0,
            "modal_price_quintal": 6450.0,
            "price_trend": "stable",
            "change_percent": 0.3,
        },

        # Bihar
        {
            "id": "mandi-br-1",
            "commodity": "Maize",
            "variety": "Yellow Hybrid",
            "market_center": "Kanti APMC Mandi",
            "district": "Muzaffarpur",
            "state": "Bihar",
            "min_price_quintal": 2050.0,
            "max_price_quintal": 2320.0,
            "modal_price_quintal": 2200.0,
            "price_trend": "rising",
            "change_percent": 2.4,
        },
        {
            "id": "mandi-br-2",
            "commodity": "Wheat",
            "variety": "HD 2967",
            "market_center": "Samastipur APMC",
            "district": "Samastipur",
            "state": "Bihar",
            "min_price_quintal": 2275.0,
            "max_price_quintal": 2480.0,
            "modal_price_quintal": 2390.0,
            "price_trend": "stable",
            "change_percent": 0.4,
        },
        {
            "id": "mandi-br-3",
            "commodity": "Paddy (Rice)",
            "variety": "Common Katarni",
            "market_center": "Fatuha Mandi",
            "district": "Patna",
            "state": "Bihar",
            "min_price_quintal": 2220.0,
            "max_price_quintal": 2400.0,
            "modal_price_quintal": 2340.0,
            "price_trend": "rising",
            "change_percent": 1.8,
        },
        {
            "id": "mandi-br-4",
            "commodity": "Potato",
            "variety": "Kufri Jyoti",
            "market_center": "Barauni Market",
            "district": "Begusarai",
            "state": "Bihar",
            "min_price_quintal": 1350.0,
            "max_price_quintal": 1750.0,
            "modal_price_quintal": 1580.0,
            "price_trend": "declining",
            "change_percent": -2.5,
        },
        {
            "id": "mandi-br-5",
            "commodity": "Mustard",
            "variety": "Pusa Bold (Rai)",
            "market_center": "Naugachia APMC",
            "district": "Bhagalpur",
            "state": "Bihar",
            "min_price_quintal": 5350.0,
            "max_price_quintal": 5850.0,
            "modal_price_quintal": 5600.0,
            "price_trend": "rising",
            "change_percent": 3.1,
        },

        # Gujarat
        {
            "id": "mandi-gj-1",
            "commodity": "Groundnut",
            "variety": "GG-20",
            "market_center": "Gondal APMC Yard",
            "district": "Rajkot",
            "state": "Gujarat",
            "min_price_quintal": 6200.0,
            "max_price_quintal": 7100.0,
            "modal_price_quintal": 6650.0,
            "price_trend": "rising",
            "change_percent": 2.2,
        },
        {
            "id": "mandi-gj-2",
            "commodity": "Cotton",
            "variety": "Shankar-6",
            "market_center": "Rajkot APMC",
            "district": "Rajkot",
            "state": "Gujarat",
            "min_price_quintal": 7100.0,
            "max_price_quintal": 7650.0,
            "modal_price_quintal": 7400.0,
            "price_trend": "rising",
            "change_percent": 1.5,
        },

        # Haryana
        {
            "id": "mandi-hr-1",
            "commodity": "Paddy (Rice)",
            "variety": "Basmati 1121",
            "market_center": "Karnal Grain Market",
            "district": "Karnal",
            "state": "Haryana",
            "min_price_quintal": 3650.0,
            "max_price_quintal": 4120.0,
            "modal_price_quintal": 3950.0,
            "price_trend": "stable",
            "change_percent": -0.2,
        },
        {
            "id": "mandi-hr-2",
            "commodity": "Wheat",
            "variety": "WH 1105",
            "market_center": "Karnal Grain Market",
            "district": "Karnal",
            "state": "Haryana",
            "min_price_quintal": 2280.0,
            "max_price_quintal": 2450.0,
            "modal_price_quintal": 2380.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-hr-3",
            "commodity": "Cotton",
            "variety": "American Cotton",
            "market_center": "Hisar Grain Market",
            "district": "Hisar",
            "state": "Haryana",
            "min_price_quintal": 6850.0,
            "max_price_quintal": 7350.0,
            "modal_price_quintal": 7150.0,
            "price_trend": "stable",
            "change_percent": 0.4,
        },

        # Karnataka
        {
            "id": "mandi-ka-1",
            "commodity": "Maize",
            "variety": "Yellow Hybrid",
            "market_center": "Davangere APMC",
            "district": "Davangere",
            "state": "Karnataka",
            "min_price_quintal": 1950.0,
            "max_price_quintal": 2240.0,
            "modal_price_quintal": 2150.0,
            "price_trend": "declining",
            "change_percent": -1.8,
        },
        {
            "id": "mandi-ka-2",
            "commodity": "Sugarcane",
            "variety": "Co 86032",
            "market_center": "Belagavi APMC",
            "district": "Belagavi",
            "state": "Karnataka",
            "min_price_quintal": 320.0,
            "max_price_quintal": 365.0,
            "modal_price_quintal": 345.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-ka-3",
            "commodity": "Chilli",
            "variety": "Byadagi Dabbi",
            "market_center": "Hubballi APMC",
            "district": "Dharwad",
            "state": "Karnataka",
            "min_price_quintal": 24000.0,
            "max_price_quintal": 31000.0,
            "modal_price_quintal": 28500.0,
            "price_trend": "rising",
            "change_percent": 4.5,
        },

        # Kerala
        {
            "id": "mandi-kl-1",
            "commodity": "Paddy (Rice)",
            "variety": "Matta (Jyothi)",
            "market_center": "Palakkad APMC",
            "district": "Palakkad",
            "state": "Kerala",
            "min_price_quintal": 2820.0,
            "max_price_quintal": 3150.0,
            "modal_price_quintal": 2980.0,
            "price_trend": "stable",
            "change_percent": 0.2,
        },

        # Madhya Pradesh
        {
            "id": "mandi-mp-1",
            "commodity": "Soybean",
            "variety": "JS 335 / Yellow",
            "market_center": "Indore APMC Market",
            "district": "Indore",
            "state": "Madhya Pradesh",
            "min_price_quintal": 4450.0,
            "max_price_quintal": 4950.0,
            "modal_price_quintal": 4720.0,
            "price_trend": "rising",
            "change_percent": 2.0,
        },
        {
            "id": "mandi-mp-2",
            "commodity": "Wheat",
            "variety": "Sharbati C-306",
            "market_center": "Ujjain Mandi",
            "district": "Ujjain",
            "state": "Madhya Pradesh",
            "min_price_quintal": 2800.0,
            "max_price_quintal": 3400.0,
            "modal_price_quintal": 3150.0,
            "price_trend": "rising",
            "change_percent": 3.2,
        },

        # Maharashtra
        {
            "id": "mandi-mh-1",
            "commodity": "Onion",
            "variety": "Red Nashik",
            "market_center": "Lasalgaon APMC",
            "district": "Nashik",
            "state": "Maharashtra",
            "min_price_quintal": 1800.0,
            "max_price_quintal": 2850.0,
            "modal_price_quintal": 2450.0,
            "price_trend": "declining",
            "change_percent": -4.2,
        },
        {
            "id": "mandi-mh-2",
            "commodity": "Tomato",
            "variety": "Hybrid Red",
            "market_center": "Pimpalgaon APMC",
            "district": "Nashik",
            "state": "Maharashtra",
            "min_price_quintal": 1350.0,
            "max_price_quintal": 2050.0,
            "modal_price_quintal": 1750.0,
            "price_trend": "rising",
            "change_percent": 3.4,
        },
        {
            "id": "mandi-mh-3",
            "commodity": "Cotton",
            "variety": "Medium Staple (Shankar-6)",
            "market_center": "Solapur APMC Yard",
            "district": "Solapur",
            "state": "Maharashtra",
            "min_price_quintal": 6800.0,
            "max_price_quintal": 7450.0,
            "modal_price_quintal": 7200.0,
            "price_trend": "rising",
            "change_percent": 1.9,
        },
        {
            "id": "mandi-mh-4",
            "commodity": "Cotton",
            "variety": "Long Staple",
            "market_center": "Katol APMC",
            "district": "Nagpur",
            "state": "Maharashtra",
            "min_price_quintal": 6950.0,
            "max_price_quintal": 7500.0,
            "modal_price_quintal": 7300.0,
            "price_trend": "stable",
            "change_percent": 0.6,
        },

        # Odisha
        {
            "id": "mandi-od-1",
            "commodity": "Paddy (Rice)",
            "variety": "Common Pooja",
            "market_center": "Attabira Regulated Market",
            "district": "Sambalpur",
            "state": "Odisha",
            "min_price_quintal": 2220.0,
            "max_price_quintal": 2380.0,
            "modal_price_quintal": 2320.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-od-2",
            "commodity": "Paddy (Rice)",
            "variety": "Swarna",
            "market_center": "Bargarh APMC",
            "district": "Bargarh",
            "state": "Odisha",
            "min_price_quintal": 2200.0,
            "max_price_quintal": 2360.0,
            "modal_price_quintal": 2300.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },

        # Punjab
        {
            "id": "mandi-pb-1",
            "commodity": "Wheat",
            "variety": "Sharbati (PBW 343 / HD 3086)",
            "market_center": "Ludhiana Mandi",
            "district": "Ludhiana",
            "state": "Punjab",
            "min_price_quintal": 2275.0,
            "max_price_quintal": 2450.0,
            "modal_price_quintal": 2380.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-pb-2",
            "commodity": "Paddy (Rice)",
            "variety": "PR 126",
            "market_center": "Ludhiana Mandi",
            "district": "Ludhiana",
            "state": "Punjab",
            "min_price_quintal": 2250.0,
            "max_price_quintal": 2420.0,
            "modal_price_quintal": 2350.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-pb-3",
            "commodity": "Wheat",
            "variety": "PBW 550",
            "market_center": "Amritsar Bhagtanwala Mandi",
            "district": "Amritsar",
            "state": "Punjab",
            "min_price_quintal": 2280.0,
            "max_price_quintal": 2460.0,
            "modal_price_quintal": 2390.0,
            "price_trend": "stable",
            "change_percent": 0.2,
        },
        {
            "id": "mandi-pb-4",
            "commodity": "Potato",
            "variety": "Kufri Pukhraj",
            "market_center": "Nakodar APMC",
            "district": "Jalandhar",
            "state": "Punjab",
            "min_price_quintal": 1250.0,
            "max_price_quintal": 1680.0,
            "modal_price_quintal": 1490.0,
            "price_trend": "declining",
            "change_percent": -1.5,
        },

        # Rajasthan
        {
            "id": "mandi-rj-1",
            "commodity": "Mustard",
            "variety": "Black Sarson (42% Oil)",
            "market_center": "Muhana Mandi Jaipur",
            "district": "Jaipur",
            "state": "Rajasthan",
            "min_price_quintal": 5400.0,
            "max_price_quintal": 5950.0,
            "modal_price_quintal": 5720.0,
            "price_trend": "rising",
            "change_percent": 1.8,
        },
        {
            "id": "mandi-rj-2",
            "commodity": "Soybean",
            "variety": "Yellow Soybean",
            "market_center": "Kota Bhamashah Mandi",
            "district": "Kota",
            "state": "Rajasthan",
            "min_price_quintal": 4500.0,
            "max_price_quintal": 4900.0,
            "modal_price_quintal": 4750.0,
            "price_trend": "stable",
            "change_percent": 0.5,
        },

        # Tamil Nadu
        {
            "id": "mandi-tn-1",
            "commodity": "Paddy (Rice)",
            "variety": "Ponni / CR 1009",
            "market_center": "Kumbakonam Market",
            "district": "Thanjavur",
            "state": "Tamil Nadu",
            "min_price_quintal": 2350.0,
            "max_price_quintal": 2550.0,
            "modal_price_quintal": 2480.0,
            "price_trend": "rising",
            "change_percent": 1.4,
        },
        {
            "id": "mandi-tn-2",
            "commodity": "Cotton",
            "variety": "MCU-5",
            "market_center": "Pollachi APMC",
            "district": "Coimbatore",
            "state": "Tamil Nadu",
            "min_price_quintal": 7200.0,
            "max_price_quintal": 7800.0,
            "modal_price_quintal": 7550.0,
            "price_trend": "rising",
            "change_percent": 2.1,
        },

        # Telangana
        {
            "id": "mandi-tg-1",
            "commodity": "Chilli",
            "variety": "Byadagi / Teja",
            "market_center": "Khammam Market Yard",
            "district": "Khammam",
            "state": "Telangana",
            "min_price_quintal": 17500.0,
            "max_price_quintal": 21000.0,
            "modal_price_quintal": 19600.0,
            "price_trend": "stable",
            "change_percent": 0.5,
        },
        {
            "id": "mandi-tg-2",
            "commodity": "Cotton",
            "variety": "Bunny Bt",
            "market_center": "Warangal Enumamula APMC",
            "district": "Warangal",
            "state": "Telangana",
            "min_price_quintal": 6900.0,
            "max_price_quintal": 7450.0,
            "modal_price_quintal": 7250.0,
            "price_trend": "rising",
            "change_percent": 1.3,
        },
        {
            "id": "mandi-tg-3",
            "commodity": "Paddy (Rice)",
            "variety": "Telangana Sona (RNR 15048)",
            "market_center": "Warangal Enumamula APMC",
            "district": "Warangal",
            "state": "Telangana",
            "min_price_quintal": 2400.0,
            "max_price_quintal": 2650.0,
            "modal_price_quintal": 2540.0,
            "price_trend": "rising",
            "change_percent": 2.2,
        },

        # Uttar Pradesh
        {
            "id": "mandi-up-1",
            "commodity": "Wheat",
            "variety": "PBW 343 / HD 2967",
            "market_center": "Varanasi Mandi Yard",
            "district": "Varanasi",
            "state": "Uttar Pradesh",
            "min_price_quintal": 2280.0,
            "max_price_quintal": 2450.0,
            "modal_price_quintal": 2375.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },
        {
            "id": "mandi-up-2",
            "commodity": "Mustard",
            "variety": "Varuna (Type 59)",
            "market_center": "Varanasi Mandi Yard",
            "district": "Varanasi",
            "state": "Uttar Pradesh",
            "min_price_quintal": 5300.0,
            "max_price_quintal": 5800.0,
            "modal_price_quintal": 5600.0,
            "price_trend": "rising",
            "change_percent": 1.6,
        },
        {
            "id": "mandi-up-3",
            "commodity": "Sugarcane",
            "variety": "Co 0238",
            "market_center": "Meerut APMC",
            "district": "Meerut",
            "state": "Uttar Pradesh",
            "min_price_quintal": 340.0,
            "max_price_quintal": 375.0,
            "modal_price_quintal": 360.0,
            "price_trend": "stable",
            "change_percent": 0.0,
        },

        # West Bengal
        {
            "id": "mandi-wb-1",
            "commodity": "Paddy (Rice)",
            "variety": "Minikit / Gobindobhog",
            "market_center": "Memari Market Yard",
            "district": "Burdwan",
            "state": "West Bengal",
            "min_price_quintal": 2380.0,
            "max_price_quintal": 2600.0,
            "modal_price_quintal": 2520.0,
            "price_trend": "rising",
            "change_percent": 1.9,
        },
        {
            "id": "mandi-wb-2",
            "commodity": "Potato",
            "variety": "Jyoti / Chandramukhi",
            "market_center": "Tarakeswar APMC",
            "district": "Hooghly",
            "state": "West Bengal",
            "min_price_quintal": 1300.0,
            "max_price_quintal": 1700.0,
            "modal_price_quintal": 1520.0,
            "price_trend": "declining",
            "change_percent": -3.1,
        },
    ]

    MARKET_COORDS = {
        "Guntur": (16.3067, 80.4365), "Krishna": (16.1800, 81.1300), "Kurnool": (15.8281, 78.0373),
        "Chittoor": (13.2172, 79.1003), "Anantapur": (14.6819, 77.6006), "West Godavari": (16.7107, 81.0952),
        "Patna": (25.5941, 85.1376), "Muzaffarpur": (26.1209, 85.3647), "Samastipur": (25.8630, 85.7811),
        "Begusarai": (25.4182, 86.1272), "Bhagalpur": (25.2425, 86.9842), "Rajkot": (22.3039, 70.8022),
        "Karnal": (29.6857, 76.9905), "Hisar": (29.1492, 75.7217), "Davangere": (14.4644, 75.9218),
        "Belagavi": (15.8497, 74.4977), "Dharwad": (15.4589, 75.0078), "Palakkad": (10.7867, 76.6548),
        "Indore": (22.7196, 75.8577), "Ujjain": (23.1765, 75.7885), "Nashik": (19.9975, 73.7898),
        "Solapur": (17.6599, 75.9064), "Nagpur": (21.1458, 79.0882), "Sambalpur": (21.4669, 83.9812),
        "Bargarh": (21.3340, 83.6214), "Ludhiana": (30.9010, 75.8572), "Amritsar": (31.6340, 74.8723),
        "Jalandhar": (31.3260, 75.5762), "Jaipur": (26.9124, 75.7873), "Kota": (25.2138, 75.8648),
        "Thanjavur": (10.7870, 79.1378), "Coimbatore": (11.0168, 76.9558), "Warangal": (17.9689, 79.5941),
        "Khammam": (17.2473, 80.1514), "Varanasi": (25.3176, 82.9739), "Meerut": (28.9845, 77.7064),
        "Burdwan": (23.2324, 87.8615), "Hooghly": (22.9080, 88.3968)
    }

    CROP_ALIASES = {
        "paddy": "Paddy (Rice)", "rice": "Paddy (Rice)", "paddy (rice)": "Paddy (Rice)",
        "mirchi": "Chilli", "chili": "Chilli", "chilli": "Chilli",
        "kapas": "Cotton", "cotton": "Cotton",
        "gehu": "Wheat", "wheat": "Wheat",
        "makka": "Maize", "makki": "Maize", "corn": "Maize", "maize": "Maize",
        "kanda": "Onion", "pyaz": "Onion", "onion": "Onion",
        "tamatar": "Tomato", "tomato": "Tomato",
        "aloo": "Potato", "potato": "Potato",
        "sarson": "Mustard", "rai": "Mustard", "mustard": "Mustard",
        "moongfali": "Groundnut", "peanut": "Groundnut", "groundnut": "Groundnut",
        "soyabean": "Soybean", "soybean": "Soybean",
        "arhar": "Pigeon Pea", "tur": "Pigeon Pea", "redgram": "Pigeon Pea",
        "ganna": "Sugarcane", "sugarcane": "Sugarcane",
    }

    def _normalize(self, text: Optional[str]) -> str:
        if not text:
            return ""
        return " ".join(text.lower().replace("-", " ").replace("(", " ").replace(")", " ").split())

    def _clean_text(self, text: Optional[str]) -> str:
        if not text:
            return ""
        norm = self._normalize(text)
        for suffix in ["district", "dist", "city", "town", "urban", "rural", "market", "mandi", "apmc"]:
            if norm.endswith(" " + suffix):
                norm = norm[:-len(suffix)-1].strip()
        return norm

    def get_crops_by_area(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        crops = set()
        st_clean = self._clean_text(state)
        dst_clean = self._clean_text(district)
        if dst_clean == "all":
            dst_clean = ""
        if st_clean == "all":
            st_clean = ""

        # 1. First inspect direct entries in MANDI_DATABASE for district
        if dst_clean:
            for item in self.MANDI_DATABASE:
                item_dst = self._clean_text(item["district"])
                item_mkt = self._clean_text(item["market_center"])
                if dst_clean in item_dst or item_dst in dst_clean or dst_clean in item_mkt:
                    crops.add(item["commodity"])

        # 2. Add state entries from MANDI_DATABASE
        if st_clean:
            for item in self.MANDI_DATABASE:
                item_st = self._clean_text(item["state"])
                if st_clean in item_st or item_st in st_clean:
                    crops.add(item["commodity"])

        # 3. Add from Crop_Disease_Images annotations if matching state
        if st_clean:
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
            csv_path = os.path.join(root_dir, "Crop_Disease_Images", "annotations.csv")
            if os.path.exists(csv_path):
                try:
                    with open(csv_path, "r", encoding="utf-8") as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            row_st = self._clean_text(row.get("state", ""))
                            if st_clean in row_st or row_st in st_clean:
                                raw_crop = row.get("crop", "").strip()
                                canonical = self.CROP_ALIASES.get(raw_crop.lower(), raw_crop)
                                if canonical:
                                    crops.add(canonical)
                except Exception:
                    pass

        # If nothing found, return standard primary crops
        if not crops:
            return ["Chilli", "Paddy (Rice)", "Wheat", "Cotton", "Maize", "Tomato", "Mustard", "Onion"]
        return sorted(list(crops))

    def get_markets(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        markets = set()
        st_clean = self._clean_text(state)
        dst_clean = self._clean_text(district)
        if dst_clean == "all":
            dst_clean = ""
        if st_clean == "all":
            st_clean = ""

        for item in self.MANDI_DATABASE:
            item_st = self._clean_text(item["state"])
            item_dst = self._clean_text(item["district"])
            item_mkt = self._clean_text(item["market_center"])

            if dst_clean and not (dst_clean in item_dst or item_dst in dst_clean or dst_clean in item_mkt):
                continue
            if st_clean and not (st_clean in item_st or item_st in st_clean):
                continue
            markets.add(item["market_center"])

        return sorted(list(markets))

    def get_prices(
        self,
        commodity: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        market_center: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
    ) -> MandiResponse:
        now = datetime.datetime.now(ZoneInfo("Asia/Kolkata"))
        today = now.date()
        today_str = today.strftime("%d %b %Y")

        raw_crop = (commodity or "").strip().lower()
        normalized_crop = self.CROP_ALIASES.get(raw_crop, commodity) if raw_crop and raw_crop != "all" else None

        dst_filter = self._clean_text(district) if district and district.lower() != "all" else None
        st_filter = self._clean_text(state) if state and state.lower() != "all" else None
        mkt_filter = self._clean_text(market_center) if market_center and market_center.lower() != "all" else None

        candidates = list(self.MANDI_DATABASE)

        # Filter by commodity if requested
        if normalized_crop:
            norm_c_clean = self._normalize(normalized_crop)
            candidates = [item for item in candidates if norm_c_clean in self._normalize(item["commodity"])]
            if dst_filter and not any(dst_filter in self._clean_text(item["district"]) or self._clean_text(item["district"]) in dst_filter for item in candidates):
                reference = next((item for item in self.MANDI_DATABASE if norm_c_clean in self._normalize(item["commodity"])), None)
                if reference:
                    coords = self.MARKET_COORDS.get(district or "", (latitude or 20.5937, longitude or 78.9629))
                    seed = sum(ord(ch) for ch in (district or "") + normalized_crop)
                    factor = 0.88 + (seed % 25) / 100
                    base = reference["modal_price_quintal"] * factor
                    candidates = [{
                        **reference,
                        "id": f"mock-{(district or 'nearby').lower()}-{self._normalize(normalized_crop).replace(' ', '-')}",
                        "market_center": f"{district or reference['district']} APMC Market",
                        "district": district or reference["district"],
                        "state": state or reference["state"],
                        "min_price_quintal": round(base * 0.91),
                        "max_price_quintal": round(base * 1.08),
                        "modal_price_quintal": round(base),
                        "_coords": coords,
                    }]

        # Filter candidates by district, state, and market_center
        filtered_items = []
        for item in candidates:
            item_dst = self._clean_text(item["district"])
            item_st = self._clean_text(item["state"])
            item_mkt = self._clean_text(item["market_center"])

            if dst_filter and not (dst_filter in item_dst or item_dst in dst_filter or dst_filter in item_mkt):
                continue
            if st_filter and not (st_filter in item_st or item_st in st_filter):
                continue
            if mkt_filter and not (mkt_filter in item_mkt or item_mkt in mkt_filter):
                continue

            # Calculate distance if coords available
            coords = item.get("_coords") or self.MARKET_COORDS.get(item["district"])
            distance = None
            if latitude is not None and longitude is not None and coords:
                lat1, lon1, lat2, lon2 = map(math.radians, (latitude, longitude, coords[0], coords[1]))
                a = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
                distance = round(6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)

            # Daily realistic jitter
            day_factor = 1 + (((today.toordinal() + sum(ord(c) for c in item["id"])) % 9) - 4) / 500
            modal = round(item["modal_price_quintal"] * day_factor / 10) * 10
            min_p = round(item["min_price_quintal"] * day_factor)
            max_p = round(item["max_price_quintal"] * day_factor)

            filtered_items.append(MandiRecord(
                id=item["id"],
                commodity=item["commodity"],
                variety=item["variety"],
                market_center=item["market_center"],
                district=item["district"],
                state=item["state"],
                min_price_quintal=min_p,
                max_price_quintal=max_p,
                modal_price_quintal=modal,
                arrival_date=today_str,
                price_trend=item["price_trend"],
                change_percent=item["change_percent"],
                distance_km=distance,
            ))

        # If district filter yielded no matches, fallback to state matches
        if not filtered_items and dst_filter and st_filter:
            for item in candidates:
                item_st = self._clean_text(item["state"])
                if st_filter in item_st or item_st in st_filter:
                    coords = item.get("_coords") or self.MARKET_COORDS.get(item["district"])
                    distance = None
                    if latitude is not None and longitude is not None and coords:
                        lat1, lon1, lat2, lon2 = map(math.radians, (latitude, longitude, coords[0], coords[1]))
                        a = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
                        distance = round(6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)

                    day_factor = 1 + (((today.toordinal() + sum(ord(c) for c in item["id"])) % 9) - 4) / 500
                    modal = round(item["modal_price_quintal"] * day_factor / 10) * 10
                    min_p = round(item["min_price_quintal"] * day_factor)
                    max_p = round(item["max_price_quintal"] * day_factor)

                    filtered_items.append(MandiRecord(
                        id=item["id"],
                        commodity=item["commodity"],
                        variety=item["variety"],
                        market_center=item["market_center"],
                        district=item["district"],
                        state=item["state"],
                        min_price_quintal=min_p,
                        max_price_quintal=max_p,
                        modal_price_quintal=modal,
                        arrival_date=today_str,
                        price_trend=item["price_trend"],
                        change_percent=item["change_percent"],
                        distance_km=distance,
                    ))

        # Filter by radius if requested
        if radius_km is not None and radius_km > 0:
            filtered_items = [r for r in filtered_items if r.distance_km is not None and r.distance_km <= radius_km]

        # Sort by distance first if available
        filtered_items.sort(key=lambda record: (record.distance_km is None, record.distance_km or 0))

        return MandiResponse(
            records=filtered_items,
            total_markets=len(filtered_items),
            last_updated=now.strftime("%d %b %Y, %I:%M %p"),
            is_demo=True,
        )


class LiveAgmarknetService(BaseMandiService):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_prices(
        self,
        commodity: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        market_center: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
    ) -> MandiResponse:
        raise NotImplementedError("Live AGMARKNET requires active data.gov.in API key.")

    def get_crops_by_area(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        return ["Chilli", "Paddy (Rice)", "Wheat", "Cotton", "Maize", "Tomato"]

    def get_markets(self, state: Optional[str] = None, district: Optional[str] = None) -> List[str]:
        return []


def get_mandi_service() -> BaseMandiService:
    if getattr(settings, "AGMARKNET_API_PROVIDER", "mock") != "mock" and getattr(settings, "AGMARKNET_API_KEY", None):
        return LiveAgmarknetService(settings.AGMARKNET_API_KEY)
    return AgmarknetMockAdapter()
