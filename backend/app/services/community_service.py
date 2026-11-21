import datetime
from typing import List, Optional
from app.core.state_store import read_state, write_state
from app.models.support import (
    CommunityPost,
    CommunityComment,
    PestAlertBulletin,
    PostCreateRequest,
)

PRESEEDED_POSTS: List[CommunityPost] = [
    CommunityPost(
        id="post-1",
        author_name="Ramesh Reddy",
        author_location="Tenali, Guntur (AP)",
        category="Crop Protection",
        title="Severe upward leaf curling in 40-day Chilli crop - What organic solution works best?",
        content="My chilli plants show upward cup-shaped leaves and stunted shoots. I sprayed garlic-chilli extract last week but thrips population is still visible under leaves. Should I spray Neem oil or spinosad?",
        crop="Chilli",
        tags=["Chilli", "Thrips", "LeafCurl", "Organic"],
        created_at="2 hours ago",
        upvotes=14,
        is_resolved=True,
        comments=[
            CommunityComment(
                id="comm-101",
                author_name="Dr. K. Srinivasa Rao",
                author_role="Verified Agronomist",
                content=(
                    "Namaste Ramesh garu. Upward leaf curling in chilli during dry weather is characteristic of Scirtothrips dorsalis. "
                    "First, install blue sticky traps @ 20-25 traps/acre at canopy height to trap adult thrips. "
                    "Spray Neem Oil (10,000 ppm) @ 3 ml/litre in late evening targeting lower leaf surfaces. "
                    "If infestation exceeds 5 thrips per leaf, you may rotate with registered Spinosad 45% SC @ 0.35 ml/L with a mandatory 3-day PHI."
                ),
                created_at="1 hour ago",
                upvotes=22,
            ),
            CommunityComment(
                id="comm-102",
                author_name="Venkat Rao",
                author_location="Guntur",
                author_role="Farmer",
                content="Neem oil with sticky traps worked well in my field last season. Avoid spraying high nitrogen urea which makes leaves more succulent.",
                created_at="35 mins ago",
                upvotes=6,
            ),
        ],
    ),
    CommunityPost(
        id="post-2",
        author_name="Sukhwinder Singh",
        author_location="Samrala, Ludhiana (PB)",
        category="Soil Health",
        title="Direct Seeded Rice (DSR) iron deficiency in light sandy soil",
        content="My 25-day old DSR crop is showing chlorosis (yellowing of younger leaves while veins remain green). Soil pH is 8.1. How should I apply ferrous sulphate?",
        crop="Rice",
        tags=["Wheat-Rice", "DSR", "Micronutrients", "IronChlorosis"],
        created_at="5 hours ago",
        upvotes=9,
        is_resolved=True,
        comments=[
            CommunityComment(
                id="comm-201",
                author_name="Dr. Gurdeep Singh",
                author_role="KVK Scientist",
                content=(
                    "In high pH sandy soils, iron gets fixed into insoluble ferric hydroxide. Soil application of ferrous sulphate is ineffective. "
                    "Apply foliar spray of 1.0% Ferrous Sulphate (FeSO4) @ 1 kg in 100 litres of water along with 1 kg Urea on a sunny morning. "
                    "Repeat spray after 7-10 days until green color restores."
                ),
                created_at="3 hours ago",
                upvotes=18,
            )
        ],
    ),
    CommunityPost(
        id="post-3",
        author_name="Tukaram Patil",
        author_location="Kegaon, Solapur (MH)",
        category="Market Advice",
        title="Cotton arrivals picking up at APMC - Is holding stock recommended?",
        content="Current modal price at Solapur APMC is ₹7,200/quintal for Shankar-6 medium staple. Should small farmers sell first picking now or wait for December?",
        crop="Cotton",
        tags=["Cotton", "MandiPrices", "MarketTrend"],
        created_at="Yesterday",
        upvotes=11,
        is_resolved=False,
        comments=[
            CommunityComment(
                id="comm-301",
                author_name="Mandi Price Analyst",
                author_role="Verified Agronomist",
                content="Mills are operating with low inventory and export demand for medium staple is steady. If you have moisture-proof dry storage (<8% moisture), holding 50% stock until peak ginning in December historically yields a ₹400-600/quintal premium.",
                created_at="Yesterday",
                upvotes=15,
            )
        ],
    ),
]

PRESEEDED_ALERTS: List[PestAlertBulletin] = [
    PestAlertBulletin(
        id="alert-1",
        pest_name="Fall Armyworm (Spodoptera frugiperda)",
        crop_affected="Maize (Corn)",
        district="Guntur",
        state="Andhra Pradesh",
        severity="high",
        advisory_summary="Early instar larvae observed scraping whorl leaves in Tenali and Mangalagiri mandals. Apply Metarhizium anisopliae @ 5g/L or release Trichogramma egg parasitoids.",
        reported_date="18 Nov 2026",
        verified_by="KVK Lam Farm Agricultural Scientists",
    ),
    PestAlertBulletin(
        id="alert-2",
        pest_name="Pink Bollworm (Pectinophora gossypiella)",
        crop_affected="Cotton",
        district="Solapur",
        state="Maharashtra",
        severity="medium",
        advisory_summary="Rosette flowers detected in 65-75 day old cotton fields. Erect 5 pheromone traps/acre and inspect dropped squares.",
        reported_date="16 Nov 2026",
        verified_by="MPKV Solapur Entomology Division",
    ),
]

class CommunityService:
    posts = list(PRESEEDED_POSTS)
    alerts = list(PRESEEDED_ALERTS)
    _hydrated = False

    @classmethod
    def _hydrate(cls) -> None:
        if cls._hydrated:
            return
        saved = read_state("community.posts")
        if saved is not None:
            cls.posts = [CommunityPost.model_validate(item) for item in saved]
        cls._hydrated = True

    @classmethod
    def _persist(cls) -> None:
        write_state("community.posts", [item.model_dump() for item in cls.posts])

    @classmethod
    def get_posts(cls, category: Optional[str] = None, crop: Optional[str] = None) -> List[CommunityPost]:
        cls._hydrate()
        filtered = []
        for p in cls.posts:
            if category and category.lower() != "all" and p.category.lower() != category.lower():
                continue
            if crop and crop.lower() != "all" and (not p.crop or p.crop.lower() != crop.lower()):
                continue
            filtered.append(p)
        return filtered

    @classmethod
    def get_pest_alerts(cls, district: Optional[str] = None) -> List[PestAlertBulletin]:
        if not district:
            return cls.alerts
        filtered = [a for a in cls.alerts if district.lower() in a.district.lower()]
        return filtered or cls.alerts

    @classmethod
    def create_post(cls, req: PostCreateRequest) -> CommunityPost:
        cls._hydrate()
        new_post = CommunityPost(
            id=f"post-{len(cls.posts) + 1}",
            author_name=req.author_name,
            author_location=req.author_location,
            category=req.category,
            title=req.title,
            content=req.content,
            crop=req.crop,
            tags=[req.category, req.crop or "Farming"],
            created_at="Just now",
            upvotes=1,
            comments=[],
            is_resolved=False,
        )
        cls.posts.insert(0, new_post)
        cls._persist()
        return new_post

    @classmethod
    def upvote_post(cls, post_id: str) -> Optional[CommunityPost]:
        cls._hydrate()
        for p in cls.posts:
            if p.id == post_id:
                p.upvotes += 1
                cls._persist()
                return p
        return None
