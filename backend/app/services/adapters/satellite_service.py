import abc
import math
import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.models.satellite import (
    GeoCoordinate,
    SatelliteObservation,
    NdviSummary,
    FieldHealthResponse,
)

class BaseSatelliteService(abc.ABC):
    @abc.abstractmethod
    def get_demo_plots(self) -> List[Dict[str, Any]]:
        pass

    @abc.abstractmethod
    def analyze_plot_ndvi(
        self,
        coordinates: List[GeoCoordinate],
        plot_name: str,
        crop: str,
        sowing_date: Optional[str] = None
    ) -> FieldHealthResponse:
        pass


class CopernicusSentinel2MockAdapter(BaseSatelliteService):
    """
    Simulates ESA Copernicus Sentinel-2 Level-2A (Bottom of Atmosphere) multispectral reflectance.
    Band 8 (NIR: 842 nm) and Band 4 (Red: 665 nm) are combined into NDVI.
    """

    DEMO_PLOTS = [
        {
            "id": "plot-guntur-chilli",
            "name": "Sri Rama Chilli Field (Plot 2A)",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "crop": "Chilli",
            "sowing_date": "2026-09-15",
            "area_acres": 2.45,
            "centroid": [16.2435, 80.6402],
            "coordinates": [
                {"lat": 16.2445, "lng": 80.6390},
                {"lat": 16.2448, "lng": 80.6415},
                {"lat": 16.2425, "lng": 80.6418},
                {"lat": 16.2422, "lng": 80.6392},
            ],
            "mean_ndvi": 0.68,
        },
        {
            "id": "plot-ludhiana-wheat",
            "name": "Kisan Seva Wheat Farm (Plot 1)",
            "district": "Ludhiana",
            "state": "Punjab",
            "crop": "Wheat",
            "sowing_date": "2026-10-25",
            "area_acres": 4.10,
            "centroid": [30.9010, 75.8572],
            "coordinates": [
                {"lat": 30.9025, "lng": 75.8550},
                {"lat": 30.9030, "lng": 75.8590},
                {"lat": 30.8995, "lng": 75.8595},
                {"lat": 30.8990, "lng": 75.8555},
            ],
            "mean_ndvi": 0.76,
        },
        {
            "id": "plot-solapur-cotton",
            "name": "Balaji Cotton Field",
            "district": "Solapur",
            "state": "Maharashtra",
            "crop": "Cotton",
            "sowing_date": "2026-07-20",
            "area_acres": 3.20,
            "centroid": [17.6599, 75.9064],
            "coordinates": [
                {"lat": 17.6610, "lng": 75.9045},
                {"lat": 17.6615, "lng": 75.9085},
                {"lat": 17.6585, "lng": 75.9088},
                {"lat": 17.6580, "lng": 75.9050},
            ],
            "mean_ndvi": 0.52,
        },
        {
            "id": "plot-nashik-vineyard",
            "name": "Godavari Green Vineyard & Onion",
            "district": "Nashik",
            "state": "Maharashtra",
            "crop": "Tomato",
            "sowing_date": "2026-08-10",
            "area_acres": 2.80,
            "centroid": [19.9975, 73.7898],
            "coordinates": [
                {"lat": 19.9990, "lng": 73.7880},
                {"lat": 19.9992, "lng": 73.7915},
                {"lat": 19.9960, "lng": 73.7918},
                {"lat": 19.9958, "lng": 73.7882},
            ],
            "mean_ndvi": 0.72,
        },
        {
            "id": "plot-thanjavur-paddy",
            "name": "Cauvery Delta Sona Masuri Paddy",
            "district": "Thanjavur",
            "state": "Tamil Nadu",
            "crop": "Paddy (Rice)",
            "sowing_date": "2026-09-01",
            "area_acres": 3.75,
            "centroid": [10.7870, 79.1378],
            "coordinates": [
                {"lat": 10.7885, "lng": 79.1360},
                {"lat": 10.7888, "lng": 79.1395},
                {"lat": 10.7855, "lng": 79.1398},
                {"lat": 10.7852, "lng": 79.1362},
            ],
            "mean_ndvi": 0.82,
        },
        {
            "id": "plot-warangal-chilli",
            "name": "Kakatiya Red Chilli Estate",
            "district": "Warangal",
            "state": "Telangana",
            "crop": "Chilli",
            "sowing_date": "2026-09-10",
            "area_acres": 2.20,
            "centroid": [17.9689, 79.5941],
            "coordinates": [
                {"lat": 17.9702, "lng": 79.5925},
                {"lat": 17.9705, "lng": 79.5955},
                {"lat": 17.9672, "lng": 79.5958},
                {"lat": 17.9670, "lng": 79.5928},
            ],
            "mean_ndvi": 0.65,
        },
    ]

    def get_demo_plots(self) -> List[Dict[str, Any]]:
        return self.DEMO_PLOTS

    def _estimate_area_acres(self, coords: List[GeoCoordinate]) -> float:
        if len(coords) < 3:
            return 2.5
        # Shoelace formula on equirectangular projection
        lat_dist_m = 111139.0
        mean_lat = sum(c.lat for c in coords) / len(coords)
        lng_dist_m = 111139.0 * math.cos(math.radians(mean_lat))

        points = [(c.lat * lat_dist_m, c.lng * lng_dist_m) for c in coords]
        area_m2 = 0.0
        n = len(points)
        for i in range(n):
            j = (i + 1) % n
            area_m2 += points[i][0] * points[j][1]
            area_m2 -= points[j][0] * points[i][1]
        area_m2 = abs(area_m2) / 2.0
        acres = area_m2 / 4046.86
        return round(max(0.2, min(acres, 100.0)), 2)

    def analyze_plot_ndvi(
        self,
        coordinates: List[GeoCoordinate],
        plot_name: str,
        crop: str,
        sowing_date: Optional[str] = None
    ) -> FieldHealthResponse:
        coords_list = [[c.lat, c.lng] for c in coordinates]
        if not coords_list:
            coords_list = [[16.2445, 80.6390], [16.2448, 80.6415], [16.2425, 80.6418], [16.2422, 80.6392]]
            coordinates = [GeoCoordinate(lat=c[0], lng=c[1]) for c in coords_list]

        centroid = [
            sum(c.lat for c in coordinates) / len(coordinates),
            sum(c.lng for c in coordinates) / len(coordinates)
        ]
        area = self._estimate_area_acres(coordinates)

        # Realistic NDVI baseline by crop and regional climate
        crop_lower = (crop or "Chilli").lower()
        if "paddy" in crop_lower or "rice" in crop_lower:
            base_ndvi = 0.82
            healthy_pct = 84.0
            moderate_pct = 12.0
            stressed_pct = 4.0
            min_ndvi = 0.35
            max_ndvi = 0.89
            status = "Dense Canopy / High Biomass Vegetative Stage"
            advice = (
                f"{healthy_pct:.0f}% of your paddy field displays vigorous chlorophyll activity (NDVI > 0.70). "
                "Maintain 3-5 cm standing water layer during panicle initiation; check localized border ridges."
            )
        elif "wheat" in crop_lower:
            base_ndvi = 0.76
            healthy_pct = 78.0
            moderate_pct = 17.0
            stressed_pct = 5.0
            min_ndvi = 0.30
            max_ndvi = 0.86
            status = "Vigorous Tillering / High Canopy Density"
            advice = (
                f"{healthy_pct:.0f}% of the wheat canopy shows strong vegetative biomass. "
                "Crown root initiation (CRI) irrigation completed successfully; monitor for yellow rust signs along shaded edges."
            )
        elif "cotton" in crop_lower:
            base_ndvi = 0.54
            healthy_pct = 58.0
            moderate_pct = 28.0
            stressed_pct = 14.0
            min_ndvi = 0.22
            max_ndvi = 0.72
            status = "Moderate Canopy / Active Boll Development"
            advice = (
                f"{healthy_pct:.0f}% vegetative canopy vigor. {stressed_pct:.0f}% of field area shows canopy thinning; "
                "inspect those rows for leafhopper/sucking pest stress or localized drip emitter clogging."
            )
        elif "tomato" in crop_lower or "vegetable" in crop_lower:
            base_ndvi = 0.72
            healthy_pct = 74.0
            moderate_pct = 20.0
            stressed_pct = 6.0
            min_ndvi = 0.25
            max_ndvi = 0.83
            status = "Vigorous Vegetative & Early Flowering Canopy"
            advice = (
                f"{healthy_pct:.0f}% healthy green foliage. Ensure uniform staking and balanced calcium-potassium feeding "
                "to prevent blossom end rot in developing fruits."
            )
        elif "sugarcane" in crop_lower:
            base_ndvi = 0.79
            healthy_pct = 81.0
            moderate_pct = 14.0
            stressed_pct = 5.0
            min_ndvi = 0.32
            max_ndvi = 0.88
            status = "Dense Grand Growth Stage Canopy"
            advice = (
                f"{healthy_pct:.0f}% prime vegetative canopy. Excellent solar radiation interception; "
                "continue trash mulching between cane rows to conserve moisture."
            )
        else: # Chilli and others
            base_ndvi = 0.68
            healthy_pct = 70.0
            moderate_pct = 23.0
            stressed_pct = 7.0
            min_ndvi = 0.28
            max_ndvi = 0.84
            status = "Vigorous / Healthy Vegetative Canopy"
            advice = (
                f"{healthy_pct:.0f}% of your field shows strong vegetative growth (NDVI > 0.60). "
                f"A small section ({stressed_pct:.0f}%) along borders shows lower biomass; "
                "inspect for uniform drip pressure and early thrips curl symptoms."
            )

        # Micro-variation based on coordinates so distinct parcels have slightly distinct signatures
        coord_hash = (math.sin(centroid[0] * 100) + math.cos(centroid[1] * 100)) * 0.02
        base_ndvi = round(min(0.92, max(0.20, base_ndvi + coord_hash)), 2)

        today = datetime.date.today()
        d_today = today.strftime("%d %b %Y")
        d_15d = (today - datetime.timedelta(days=15)).strftime("%d %b %Y")
        d_30d = (today - datetime.timedelta(days=30)).strftime("%d %b %Y")
        d_60d = (today - datetime.timedelta(days=60)).strftime("%d %b %Y")

        current_obs = SatelliteObservation(
            date=d_today,
            ndvi_score=base_ndvi,
            cloud_cover_percent=4.2,
            is_cloud_obscured=False,
            observation_label=f"Current Scene ({status.split('/')[0].strip()})",
            resolution_meters=10,
        )

        history = [
            current_obs,
            SatelliteObservation(
                date=d_15d,
                ndvi_score=round(max(0.18, base_ndvi - 0.07), 2),
                cloud_cover_percent=6.5,
                is_cloud_obscured=False,
                observation_label="Clear Pass (Vegetative Growth)",
                resolution_meters=10,
            ),
            SatelliteObservation(
                date=d_30d,
                ndvi_score=round(max(0.15, base_ndvi - 0.22), 2),
                cloud_cover_percent=34.0,
                is_cloud_obscured=True,
                observation_label="Partially Cloud Obscured Pass",
                resolution_meters=10,
            ),
            SatelliteObservation(
                date=d_60d,
                ndvi_score=round(max(0.12, base_ndvi - 0.38), 2),
                cloud_cover_percent=2.1,
                is_cloud_obscured=False,
                observation_label="Early Vegetative / Post-Transplant",
                resolution_meters=10,
            ),
        ]

        ndvi_summary = NdviSummary(
            mean_ndvi=base_ndvi,
            min_ndvi=min_ndvi,
            max_ndvi=max_ndvi,
            health_score_percent=int(base_ndvi * 100),
            healthy_canopy_percent=healthy_pct,
            moderate_canopy_percent=moderate_pct,
            stressed_or_bare_percent=stressed_pct,
            canopy_status=status,
            management_advice=advice,
        )

        return FieldHealthResponse(
            plot_id=f"plot-{int(abs(centroid[0]*1000))}",
            plot_name=plot_name or f"{crop} Parcel",
            crop=crop or "Chilli",
            area_acres=area,
            boundary_coordinates=coords_list,
            centroid=centroid,
            current_observation=current_obs,
            historical_observations=history,
            ndvi_summary=ndvi_summary,
            satellite_source="Copernicus Sentinel-2 (B8 NIR / B4 Red)",
            is_demo=True,
        )


class LiveCopernicusSentinel2Service(BaseSatelliteService):
    """
    Live ESA Copernicus Data Space Ecosystem API adapter.
    Requires COPERNICUS_API_KEY / OAuth token configured in .env.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_demo_plots(self) -> List[Dict[str, Any]]:
        return CopernicusSentinel2MockAdapter().get_demo_plots()

    def analyze_plot_ndvi(
        self,
        coordinates: List[GeoCoordinate],
        plot_name: str,
        crop: str,
        sowing_date: Optional[str] = None
    ) -> FieldHealthResponse:
        raise NotImplementedError("Live Copernicus API requires valid active OData credentials.")


def get_satellite_service() -> BaseSatelliteService:
    if getattr(settings, "COPERNICUS_API_PROVIDER", "mock") != "mock" and getattr(settings, "COPERNICUS_API_KEY", None):
        return LiveCopernicusSentinel2Service(settings.COPERNICUS_API_KEY)
    return CopernicusSentinel2MockAdapter()
