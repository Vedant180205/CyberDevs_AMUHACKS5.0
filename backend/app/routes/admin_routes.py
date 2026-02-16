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
                "avg_github": {"$avg": "$prs_breakdown.github_score_25"},
                "avg_resume": {"$avg": "$prs_breakdown.resume_ats_score_20"},
                "avg_skills": {"$avg": "$prs_breakdown.skills_score_15"},
                "avg_cgpa": {"$avg": "$prs_breakdown.cgpa_score_10"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "branch": "$_id.branch",
                "year": "$_id.year",
                "avg_prs": 1,
                "avg_github": 1,
                "avg_resume": 1,
                "avg_skills": 1,
                "avg_cgpa": 1,
                "count": 1
            }
        },
        {"$sort": {"branch": 1, "year": 1}}
    ]

    raw_data = await students_collection.aggregate(pipeline).to_list(length=1000)

    # Normalization mappings
    def normalize_year(y):
        y_str = str(y).strip().lower()
        if y_str in ['1', 'i', 'fy', 'fe', 'first year', '1st year']: return '1st Year'
        if y_str in ['2', 'ii', 'sy', 'se', 'second year', '2nd year']: return '2nd Year'
        if y_str in ['3', 'iii', 'ty', 'te', 'third year', '3rd year']: return '3rd Year'
        if y_str in ['4', 'iv', 'final', 'be', 'b.tech', 'final year', '4th year']: return '4th Year'
        return 'Unknown'

    def normalize_branch(b):
        b_str = str(b).strip().upper()
        if b_str in ['CS', 'COMPUTER SCIENCE', 'CSE']: return 'CSE'
        if b_str in ['IT', 'INFORMATION TECHNOLOGY']: return 'IT'
        if b_str in ['ECS', 'ELECTRONICS', 'ENTC']: return 'ECS' # Adjust as per college
        if b_str in ['MECH', 'MECHANICAL']: return 'MECH'
        if b_str in ['CIVIL']: return 'CIVIL'
        if b_str in ['AIDS', 'AI&DS']: return 'AI&DS'
        return b_str # Return as is if no match, or filter out later if needed

    # Re-aggregate in Python
    aggregated = {}
    
    for item in raw_data:
        # Skip invalid data
        if not item.get("branch") or not item.get("year"):
            continue
            
        n_branch = normalize_branch(item["branch"])
        n_year = normalize_year(item["year"])
        
        if n_year == 'Unknown': continue
        if n_branch in ['UNKNOWN', 'N/A', 'NA', 'NULL', 'NONE']: continue

    # Re-aggregate in Python
    aggregated = {}
    
    for item in raw_data:
        # Skip invalid data
        if not item.get("branch") or not item.get("year"):
            continue
            
        n_branch = normalize_branch(item["branch"])
        n_year = normalize_year(item["year"])
        
        if n_year == 'Unknown': continue
        if n_branch in ['UNKNOWN', 'N/A', 'NA', 'NULL', 'NONE']: continue

        key = (n_branch, n_year)
        
        if key not in aggregated:
            aggregated[key] = {
                "total_prs_sum": 0,
                "total_github": 0,
                "total_resume": 0,
                "total_skills": 0,
                "total_cgpa": 0,
                "total_count": 0
            }
        
        count = item.get("count", 1)
        aggregated[key]["total_count"] += count
        
        # Weighted totals for averages
        aggregated[key]["total_prs_sum"] += (item.get("avg_prs", 0) or 0) * count
        aggregated[key]["total_github"] += (item.get("avg_github", 0) or 0) * count
        aggregated[key]["total_resume"] += (item.get("avg_resume", 0) or 0) * count
        aggregated[key]["total_skills"] += (item.get("avg_skills", 0) or 0) * count
        aggregated[key]["total_cgpa"] += (item.get("avg_cgpa", 0) or 0) * count

    # Format result
    final_heatmap = []
    
    # Helper to normalize partial scores to 100 scale
    def normalize_score(val, max_val):
        if not max_val: return 0
        return round((val / max_val) * 100, 1)

    for (branch, year), data in aggregated.items():
        avg_prs = round(data["total_prs_sum"] / data["total_count"], 1)
        
        # Component averages (raw)
        raw_github = data["total_github"] / data["total_count"]
        raw_resume = data["total_resume"] / data["total_count"]
        raw_skills = data["total_skills"] / data["total_count"]
        raw_cgpa = data["total_cgpa"] / data["total_count"]

        # Normalize components to 100 scale for heatmap comparison
        # (GitHub max 25, Resume 20, Skills 15, CGPA 10) - based on prs_service.py
        norm_github = normalize_score(raw_github, 25)
        norm_resume = normalize_score(raw_resume, 20)
        norm_skills = normalize_score(raw_skills, 15)
        norm_cgpa = normalize_score(raw_cgpa, 10)

        final_heatmap.append({
            "branch": branch,
            "year": year,
            "count": data["total_count"],
            "avg_prs": avg_prs,
            "avg_github": norm_github,
            "avg_resume": norm_resume,
            "avg_skills": norm_skills,
            "avg_cgpa": norm_cgpa
        })

    # Sort for consistent display
    # Define sort order for years
    year_order = {'1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4}
    final_heatmap.sort(key=lambda x: (x['branch'], year_order.get(x['year'], 99)))

    return {"heatmap": final_heatmap}

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

@router.get("/batch-risks")
async def batch_risks(
    branch: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """
    Aggregates risk distribution (Red/Yellow/Green) by Branch and Year.
    Supports branch filtering.
    """
    # 1. Pipeline to get raw data
    match_stage = {}
    if branch and branch != "All":
         match_stage["branch"] = branch

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.append({
        "$group": {
            "_id": {"branch": "$branch", "year": "$year"},
            "avg_prs": {"$avg": "$prs_score"},
            "red": {
                "$sum": {"$cond": [{"$lt": ["$prs_score", 40]}, 1, 0]}
            },
            "yellow": {
                "$sum": {"$cond": [{"$and": [{"$gte": ["$prs_score", 40]}, {"$lte": ["$prs_score", 60]}]}, 1, 0]}
            },
            "green": {
                "$sum": {"$cond": [{"$gt": ["$prs_score", 60]}, 1, 0]}
            }
        }
    })

    raw_data = await students_collection.aggregate(pipeline).to_list(length=100)

    # 2. Normalize and Format in Python to handle "1st Year" vs "FY"
    # Helper reuse
    def normalize_year_str(y):
        y_str = str(y).strip().lower()
        if y_str in ['1', 'i', 'fy', 'fe', 'first year', '1st year']: return '1st Year'
        if y_str in ['2', 'ii', 'sy', 'se', 'second year', '2nd year']: return '2nd Year'
        if y_str in ['3', 'iii', 'ty', 'te', 'third year', '3rd year']: return '3rd Year'
        if y_str in ['4', 'iv', 'final', 'be', 'final year', '4th year']: return '4th Year'
        return 'Unknown'

    def normalize_branch_str(b):
        b_str = str(b).strip().upper()
        if b_str in ['CS', 'COMPUTER SCIENCE', 'CSE']: return 'CSE'
        if b_str in ['IT', 'INFORMATION TECHNOLOGY']: return 'IT'
        if b_str in ['EC', 'ENTC', 'ELECTRONICS', 'ECS']: return 'ECS'
        return b_str 

    processed = {}

    for item in raw_data:
        raw_b = item["_id"].get("branch", "Unknown")
        raw_y = item["_id"].get("year", "Unknown")

        n_b = normalize_branch_str(raw_b)
        n_y = normalize_year_str(raw_y)

        if n_b in ["Unknown", "N/A"] or n_y == "Unknown": continue

        # Filter by branch if requested (double check after normalization)
        if branch and branch != "All" and n_b != branch:
            continue

        key = (n_b, n_y)
        if key not in processed:
            processed[key] = {"red": 0, "yellow": 0, "green": 0, "total_prs": 0, "count": 0}

        processed[key]["red"] += item["red"]
        processed[key]["yellow"] += item["yellow"]
        processed[key]["green"] += item["green"]
        processed[key]["total_prs"] += (item["avg_prs"] or 0) * (item["red"] + item["yellow"] + item["green"])
        processed[key]["count"] += (item["red"] + item["yellow"] + item["green"])

    final_data = []
    
    # Sort order
    year_priority = {"1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4}

    for (b, y), val in processed.items():
        avg_prs = round(val["total_prs"] / val["count"], 1) if val["count"] > 0 else 0
        final_data.append({
            "batch": f"{y} {b}",
            "year": y,
            "branch": b,
            "total": val["count"],
            "avg_prs": avg_prs,
            "red": val["red"],
            "yellow": val["yellow"],
            "green": val["green"]
        })

    # Sort
    final_data.sort(key=lambda x: (x["branch"], year_priority.get(x["year"], 99)))

    return {"batch_risks": final_data}

@router.post("/ai-recommendations")
async def ai_recommendations(
    branch: Optional[str] = None,
    current_user=Depends(get_current_user)
):

    """
    Generates AI-powered training recommendations based on aggregated batch data.
    Also serves the 'Performance vs Benchmark' chart.
    """
    # 1. Pipeline
    match_stage = {}
    if branch and branch != "All":
        match_stage["branch"] = branch

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.append({
        "$group": {
            "_id": {"branch": "$branch", "year": "$year"},
            "avg_prs": {"$avg": "$prs_score"},
            "avg_github": {"$avg": "$github_analysis.github_score"},
            "avg_cgpa": {"$avg": "$cgpa"},
            "student_count": {"$sum": 1}
        }
    })

    raw_data = await students_collection.aggregate(pipeline).to_list(length=100)

    # 2. Normalize in Python
    # Helper reuse
    def normalize_year_str(y):
        y_str = str(y).strip().lower()
        if y_str in ['1', 'i', 'fy', 'fe', 'first year', '1st year']: return '1st Year'
        if y_str in ['2', 'ii', 'sy', 'se', 'second year', '2nd year']: return '2nd Year'
        if y_str in ['3', 'iii', 'ty', 'te', 'third year', '3rd year']: return '3rd Year'
        if y_str in ['4', 'iv', 'final', 'be', 'final year', '4th year']: return '4th Year'
        return 'Unknown'

    def normalize_branch_str(b):
        b_str = str(b).strip().upper()
        if b_str in ['CS', 'COMPUTER SCIENCE', 'CSE']: return 'CSE'
        if b_str in ['IT', 'INFORMATION TECHNOLOGY']: return 'IT'
        if b_str in ['EC', 'ENTC', 'ELECTRONICS', 'ECS']: return 'ECS'
        return b_str 

    processed = []
    year_priority = {"1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4}

    for item in raw_data:
        raw_b = item["_id"].get("branch", "Unknown")
        raw_y = item["_id"].get("year", "Unknown")

        n_b = normalize_branch_str(raw_b)
        n_y = normalize_year_str(raw_y)

        if n_b in ["Unknown", "N/A"] or n_y == "Unknown": continue
        
        # Double check filter
        if branch and branch != "All" and n_b != branch: continue

        processed.append({
            "target_group": f"{n_y} {n_b}",
            "year": n_y,
            "branch": n_b,
            "avg_prs": round(item["avg_prs"], 2),
            "avg_github": round(item["avg_github"] or 0, 2),
            "avg_cgpa": round(item["avg_cgpa"], 2),
            "student_count": item["student_count"]
        })

    # Sort
    processed.sort(key=lambda x: (x["branch"], year_priority.get(x["year"], 99)))



    # 3. Call Groq Service (only if needed/requested, but preserving existing flow)
    # The original endpoint returned recommendations + batch_stats.
    # We will just return the stats if it's primarily for the chart, 
    # but the frontend might expect specific format.
    # Re-using existing function if available, or just returning stats if the chart consumes 'recommendation_data'
    
    # Original code called generate_batch_recommendations(batch_stats).
    # We'll reproduce that structure but with normalized data.
    
    recommendation_data = await generate_batch_recommendations(processed)

    return recommendation_data

@router.get("/company-funnel")
async def company_funnel(company_id: Optional[str] = None, current_user=Depends(get_current_user)):
    """
    Returns funnel analysis for a specific company.
    Stages: Total Students -> Branch Eligible -> CGPA Eligible -> Skills Eligible -> Fully Eligible
    """
    from bson import ObjectId
    
    # 1. Fetch Company
    if company_id:
        company = await companies_collection.find_one({"_id": ObjectId(company_id)})
    else:
        # Default to first company if none selected
        company = await companies_collection.find_one({})
    
    if not company:
        return {"error": "No company found"}

    # 2. Extract Criteria
    allowed_branches = company.get("allowed_branches", [])
    min_cgpa = company.get("min_cgpa", 0)
    required_skills = company.get("required_skills", [])
    
    # 3. Build Aggregation Pipeline for Funnel
    # We want counts for each stage *cumulatively*
    
    # Stage 1: Total
    total_count = await students_collection.count_documents({})
    
    # Stage 2: Branch Eligible
    branch_query = {"branch": {"$in": allowed_branches}}
    branch_count = await students_collection.count_documents(branch_query)
    
    # Stage 3: Branch + CGPA Eligible
    cgpa_query = {**branch_query, "cgpa": {"$gte": min_cgpa}}
    cgpa_count = await students_collection.count_documents(cgpa_query)
    
    # Stage 4: Branch + CGPA + Skills Eligible (Fully Eligible)
    # Skills check: all required skills must be in student's skills list (Case Insensitive)
    if required_skills:
        # Construct $and query where each required skill matches case-insensitively
        skill_conditions = [
            {"skills": {"$regex": f"^{s}$", "$options": "i"}} 
            for s in required_skills
        ]
        skills_query = {**cgpa_query, "$and": skill_conditions}
    else:
        skills_query = {**cgpa_query, "skills": {"$exists": True}}

    full_eligible_count = await students_collection.count_documents(skills_query)
    
    funnel_data = [
        {"stage": "Total Students", "count": total_count, "fill": "#94a3b8"}, # Slate-400
        {"stage": "Branch Eligible", "count": branch_count, "fill": "#60a5fa"}, # Blue-400
        {"stage": "CGPA Cutoff", "count": cgpa_count, "fill": "#fbbf24"}, # Amber-400
        {"stage": "Skills Match (Fully Eligible)", "count": full_eligible_count, "fill": "#22c55e"} # Green-500
    ]
    
    return {
        "company_name": company.get("company_name"),
        "company_id": str(company.get("_id")),
        "role": company.get("role"),
        "min_cgpa": min_cgpa,
        "funnel": funnel_data
    }

@router.get("/analytics/gap-analysis")
async def get_gap_analysis(current_user=Depends(get_current_user)):
    # 1. Fetch Benchmarks
    benchmarks = await benchmarks_collection.find({}).to_list(100)
    benchmark_map = {(str(b.get("branch")), str(b.get("year"))): b.get("expected_prs", 60) for b in benchmarks}
    
    # 2. Aggregation Pipeline
    pipeline = [
        {
            "$group": {
                "_id": {"branch": "$branch", "year": "$year"},
                "avg_prs": {"$avg": "$prs_score"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id.branch": 1, "_id.year": 1}}
    ]
    
    raw_data = await students_collection.aggregate(pipeline).to_list(100)
    
    result = []
    
    # Helper reuse
    def normalize_year_str(y):
        y_str = str(y).strip().lower()
        if y_str in ['1', 'i', 'fy', 'fe', 'first year', '1st year']: return '1st Year'
        if y_str in ['2', 'ii', 'sy', 'se', 'second year', '2nd year']: return '2nd Year'
        if y_str in ['3', 'iii', 'ty', 'te', 'third year', '3rd year']: return '3rd Year'
        if y_str in ['4', 'iv', 'final', 'be', 'final year', '4th year']: return '4th Year'
        return 'Unknown'

    def normalize_branch_str(b):
        b_str = str(b).strip().upper()
        if b_str in ['CS', 'COMPUTER SCIENCE', 'CSE']: return 'CSE'
        if b_str in ['IT', 'INFORMATION TECHNOLOGY']: return 'IT'
        if b_str in ['EC', 'ENTC', 'ELECTRONICS', 'ECS']: return 'ECS'
        return b_str 

    for item in raw_data:
        raw_branch = item["_id"].get("branch", "Unknown")
        raw_year = item["_id"].get("year", "Unknown")
        
        # Normalize
        n_branch = normalize_branch_str(raw_branch)
        n_year = normalize_year_str(raw_year)
        
        if n_branch in ["Unknown", "N/A"] or n_year == "Unknown": continue
        
        key = (n_branch, n_year)
        target = benchmark_map.get(key, 60) # Default 60 if missing
        
        avg_prs = round(item["avg_prs"], 1)
        gap = round(avg_prs - target, 1)
        
        result.append({
            "branch": n_branch,
            "year": n_year,
            "actual_prs": avg_prs,
            "target_prs": target,
            "gap": gap,
            "status": "Above" if avg_prs >= target else "Below"
        })
        
    return {"gap_analysis": result}
