from fastapi import APIRouter
from ..core.database import students_col
from bson import ObjectId
from ..services.ai_advisor import generate_heatmap_summary, generate_training_plan
from typing import List, Dict

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats/branch-readiness")
async def get_branch_readiness():
    """
    Generates a heatmap of average PRS scores and student counts per branch.
    Includes ultra-fast Groq summary.
    """
    pipeline = [
        {
            "$group": {
                "_id": "$branch",
                "avg_prs": {"$avg": "$prs"},
                "total_students": {"$sum": 1},
                "green_tier_count": {
                    "$sum": {"$cond": [{"$gte": ["$prs", 75]}, 1, 0]}
                }
            }
        },
        {"$sort": {"avg_prs": -1}}
    ]
    
    heatmap_data = await students_col.aggregate(pipeline).to_list(length=100)
    
    # Fast AI Summary via Groq
    ai_summary = await generate_heatmap_summary(heatmap_data)
    
    return {
        "heatmap": heatmap_data,
        "ai_summary": ai_summary
    }

@router.post("/recommendations")
async def get_training_recommendations(heatmap_data: List[Dict]):
    """
    Uses Gemini (12 RPM limit) to suggest deep training interventions based on heatmap data.
    """
    return await generate_training_plan(heatmap_data)