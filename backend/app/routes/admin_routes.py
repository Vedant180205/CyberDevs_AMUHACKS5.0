from fastapi import APIRouter
from app.database import students_collection, companies_collection, benchmarks_collection, training_collection
from typing import Optional
from fastapi import APIRouter, Depends
from app.database import students_collection
from app.utils.auth_dependency import get_current_user
from app.services.groq_service import generate_batch_recommendations

router = APIRouter()

@router.get("/students/summary")
async def students_summary():
    students = await students_collection.find({}, {"password": 0}).to_list(1000)

    total = len(students)
    avg_prs = sum(s.get("prs_score", 0) for s in students) / total if total else 0

    return {
        "total_students": total,
        "average_prs": round(avg_prs, 2),
        "students": students
    }

@router.get("/companies")
async def get_companies():
    companies = await companies_collection.find({}).to_list(100)
    for c in companies:
        c["_id"] = str(c["_id"])
    return companies

@router.get("/benchmarks")
async def get_benchmarks():
    benchmarks = await benchmarks_collection.find({}).to_list(100)
    for b in benchmarks:
        b["_id"] = str(b["_id"])
    return benchmarks

@router.get("/training-recommendations")
async def get_training_recommendations():
    trainings = await training_collection.find({}).to_list(200)
    for t in trainings:
        t["_id"] = str(t["_id"])
    return trainings

@router.get("/dashboard/summary")
async def dashboard_summary(current_user=Depends(get_current_user)):

    pipeline = [
        {
            "$facet": {
                "total": [{"$count": "count"}],

                "avg_prs": [
                    {"$group": {"_id": None, "avg": {"$avg": "$prs_score"}}}
                ],

                "risk_counts": [
                    {
                        "$group": {
                            "_id": {
                                "$switch": {
                                    "branches": [
                                        {"case": {"$lt": ["$prs_score", 40]}, "then": "red"},
                                        {"case": {"$and": [
                                            {"$gte": ["$prs_score", 40]},
                                            {"$lte": ["$prs_score", 60]}
                                        ]}, "then": "yellow"},
                                        {"case": {"$gt": ["$prs_score", 60]}, "then": "green"}
                                    ],
                                    "default": "unknown"
                                }
                            },
                            "count": {"$sum": 1}
                        }
                    }
                ]
            }
        }
    ]

    result = await students_collection.aggregate(pipeline).to_list(length=1)
    result = result[0]

    total_students = result["total"][0]["count"] if result["total"] else 0
    avg_prs = round(result["avg_prs"][0]["avg"], 2) if result["avg_prs"] else 0

    red_count = 0
    yellow_count = 0
    green_count = 0

    for item in result["risk_counts"]:
        if item["_id"] == "red":
            red_count = item["count"]
        elif item["_id"] == "yellow":
            yellow_count = item["count"]
        elif item["_id"] == "green":
            green_count = item["count"]

    return {
        "total_students": total_students,
        "avg_prs": avg_prs,
        "red_count": red_count,
        "yellow_count": yellow_count,
        "green_count": green_count
    }

@router.get("/dashboard/heatmap")
async def readiness_heatmap(current_user=Depends(get_current_user)):

    pipeline = [
        {
            "$group": {
                "_id": {"branch": "$branch", "year": "$year"},
                "avg_prs": {"$avg": "$prs_score"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "branch": "$_id.branch",
                "year": "$_id.year",
                "avg_prs": {"$round": ["$avg_prs", 2]},
                "count": 1
            }
        },
        {"$sort": {"branch": 1, "year": 1}}
    ]

    heatmap = await students_collection.aggregate(pipeline).to_list(length=1000)

    return {"heatmap": heatmap}

@router.get("/students/filter")
async def filter_students(
    branch: Optional[str] = None,
    year: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    query = {}

    if branch:
        query["branch"] = branch

    if year:
        query["year"] = year

    students = await students_collection.find(
        query,
        {
            "_id": 0,
            "full_name": 1,
            "email": 1,
            "branch": 1,
            "year": 1,
            "cgpa": 1,
            "skills": 1,
            "prs_score": 1,
            "github_analysis.github_score": 1
        }
    ).to_list(length=500)

    return {"count": len(students), "students": students}

@router.get("/risk-list")
async def risk_list(
    level: str = "red",
    current_user=Depends(get_current_user)
):
    if level == "red":
        query = {"prs_score": {"$lt": 40}}
    elif level == "yellow":
        query = {"prs_score": {"$gte": 40, "$lte": 60}}
    elif level == "green":
        query = {"prs_score": {"$gt": 60}}
    else:
        return {"error": "Invalid level. Use red/yellow/green"}

    students = await students_collection.find(
        query,
        {
            "_id": 0,
            "full_name": 1,
            "email": 1,
            "branch": 1,
            "year": 1,
            "cgpa": 1,
            "prs_score": 1,
            "prs_breakdown": 1
        }
    ).sort("prs_score", 1).to_list(length=200)

    return {"level": level, "count": len(students), "students": students}

@router.get("/training-recommendations")
async def training_recommendations(current_user=Depends(get_current_user)):

    pipeline = [
        {
            "$group": {
                "_id": {"branch": "$branch", "year": "$year"},
                "avg_prs": {"$avg": "$prs_score"},
                "avg_github": {"$avg": "$github_analysis.github_score"},
                "avg_cgpa": {"$avg": "$cgpa"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "branch": "$_id.branch",
                "year": "$_id.year",
                "avg_prs": {"$round": ["$avg_prs", 2]},
                "avg_github": {"$round": ["$avg_github", 2]},
                "avg_cgpa": {"$round": ["$avg_cgpa", 2]},
                "count": 1
            }
        }
    ]

    data = await students_collection.aggregate(pipeline).to_list(length=100)

    recommendations = []

    for row in data:
        branch = row["branch"]
        year = row["year"]

        if row["avg_github"] < 40:
            recommendations.append({
                "title": f"GitHub + Projects Bootcamp ({branch} {year})",
                "reason": f"Average GitHub score is low ({row['avg_github']})",
                "target_group": {"branch": branch, "year": year},
                "expected_impact": "+8 PRS (estimated)"
            })

        if row["avg_prs"] < 50:
            recommendations.append({
                "title": f"Aptitude + DSA Foundation Training ({branch} {year})",
                "reason": f"Average PRS is weak ({row['avg_prs']})",
                "target_group": {"branch": branch, "year": year},
                "expected_impact": "+10 PRS (estimated)"
            })

        if row["avg_cgpa"] < 6.5:
            recommendations.append({
                "title": f"Academic Improvement Mentorship ({branch} {year})",
                "reason": f"Average CGPA is low ({row['avg_cgpa']})",
                "target_group": {"branch": branch, "year": year},
                "expected_impact": "+5 PRS (estimated)"
            })

    return {
        "total_groups": len(data),
        "recommendations_count": len(recommendations),
        "recommendations": recommendations
    }

@router.get("/skills-analytics")
async def skills_analytics(current_user=Depends(get_current_user)):
    """
    Aggregates top skills by branch and year.
    """
    pipeline = [
        {"$unwind": "$skills"},
        {
            "$group": {
                "_id": {"skill": {"$toLower": "$skills"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]

    top_skills = await students_collection.aggregate(pipeline).to_list(length=20)
    
    # Format for frontend
    formatted_skills = [{"skill": item["_id"]["skill"], "count": item["count"]} for item in top_skills]
    
    return {"top_skills": formatted_skills}

@router.post("/ai-recommendations")
async def ai_recommendations(current_user=Depends(get_current_user)):
    """
    Generates AI-powered training recommendations based on aggregated batch data.
    """
    # 1. Aggregate batch statistics
    pipeline = [
        {
            "$group": {
                "_id": {"branch": "$branch", "year": "$year"},
                "avg_prs": {"$avg": "$prs_score"},
                "avg_github": {"$avg": "$github_analysis.github_score"},
                "avg_cgpa": {"$avg": "$cgpa"},
                "student_count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "target_group": {"$concat": ["$_id.year", " ", "$_id.branch"]},
                "avg_prs": {"$round": ["$avg_prs", 2]},
                "avg_github": {"$round": ["$avg_github", 2]},
                "avg_cgpa": {"$round": ["$avg_cgpa", 2]},
                "student_count": 1
            }
        }
    ]

    batch_stats = await students_collection.aggregate(pipeline).to_list(length=50)

    # 2. Call Groq Service
    recommendation_data = generate_batch_recommendations(batch_stats)

    return recommendation_data
