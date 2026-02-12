from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta, timezone

from app.database import students_collection
from app.utils.auth_dependency import get_current_user
from app.models.student_model import StudentUpdate
from app.services.github_service import analyze_github_profile
from app.services.prs_service import calculate_prs
from app.database import companies_collection
from app.services.company_match_service import match_student_with_companies


router = APIRouter()


@router.get("/me")
async def get_my_profile(user=Depends(get_current_user)):
    email = user["email"]

    student = await students_collection.find_one({"email": email}, {"password": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student["_id"] = str(student["_id"])
    return student


@router.put("/update")
async def update_profile(update_data: StudentUpdate, user=Depends(get_current_user)):
    email = user["email"]

    existing = await students_collection.find_one({"email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")

    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}

    await students_collection.update_one(
        {"email": email},
        {"$set": update_dict}
    )

    return {"message": "Profile updated successfully"}


@router.post("/analyze/github")
async def analyze_my_github(user=Depends(get_current_user)):
    email = user["email"]

    student = await students_collection.find_one({"email": email})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # ✅ CACHE CHECK (24 hours)
    existing_analysis = student.get("github_analysis")
    if existing_analysis and existing_analysis.get("last_updated"):
        last_updated = datetime.fromisoformat(existing_analysis["last_updated"])
        if datetime.now(timezone.utc) - last_updated < timedelta(hours=24):
            return {
                "message": "GitHub analysis already cached (last 24 hours)",
                "github_analysis": existing_analysis
            }

    github_url = student.get("github_url")
    if not github_url:
        raise HTTPException(status_code=400, detail="GitHub URL not set in profile")

    try:
        analysis = analyze_github_profile(github_url)

        # ✅ add last_updated inside analysis
        analysis["last_updated"] = datetime.now(timezone.utc).isoformat()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    await students_collection.update_one(
        {"email": email},
        {"$set": {"github_analysis": analysis}}
    )

    return {"message": "GitHub analysis completed", "github_analysis": analysis}


@router.post("/calculate-prs")
async def calculate_student_prs(user=Depends(get_current_user)):
    email = user["email"]

    student = await students_collection.find_one({"email": email}, {"password": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    prs_result = calculate_prs(student)

    await students_collection.update_one(
        {"email": email},
        {"$set": {
            "prs_score": prs_result["prs_score"],
            "prs_level": prs_result["prs_level"],
            "prs_breakdown": prs_result["breakdown"]
        }}
    )

    return {
        "message": "PRS calculated successfully",
        "prs_score": prs_result["prs_score"],
        "prs_level": prs_result["prs_level"],
        "prs_breakdown": prs_result["breakdown"]
    }

@router.get("/company-match")
async def company_match(user=Depends(get_current_user)):
    email = user["email"]

    student = await students_collection.find_one({"email": email}, {"password": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    companies = await companies_collection.find({}).to_list(200)

    match_result = match_student_with_companies(student, companies)
    
    # Get AI analysis from Groq (no caching - fresh analysis every time)
    from app.services.groq_service import analyze_company_matches_with_groq
    
    try:
        ai_analysis = analyze_company_matches_with_groq(student, match_result["matches"])
    except Exception as e:
        # If AI analysis fails, still return matches but with error noted
        ai_analysis = {
            "profile_strengths": ["AI analysis unavailable"],
            "profile_weaknesses": [],
            "overall_profile_summary": f"AI analysis failed: {str(e)}",
            "company_insights": [],
            "top_priority_actions": [],
            "recommended_companies_to_focus": [],
            "error": str(e)
        }

    return {
        "message": "Company matching completed",
        "company_matches": match_result["matches"],
        "ai_analysis": ai_analysis
    }


@router.post("/analyze/github-detailed")
async def analyze_github_detailed(user=Depends(get_current_user)):
    email = user["email"]

    student = await students_collection.find_one({"email": email})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if GitHub analysis exists
    github_analysis = student.get("github_analysis")
    if not github_analysis:
        raise HTTPException(
            status_code=400, 
            detail="Please run basic GitHub analysis first before requesting detailed analysis"
        )

    # ✅ CHECK CACHE (24 hours)
    existing_groq_analysis = student.get("github_groq_analysis")
    if existing_groq_analysis and existing_groq_analysis.get("last_updated"):
        last_updated = datetime.fromisoformat(existing_groq_analysis["last_updated"])
        if datetime.now(timezone.utc) - last_updated < timedelta(hours=24):
            return {
                "message": "Detailed analysis already cached (last 24 hours)",
                "groq_analysis": existing_groq_analysis
            }

    # Import Groq service
    from app.services.groq_service import analyze_github_with_groq

    try:
        # Run Groq analysis
        groq_analysis = analyze_github_with_groq(github_analysis)
        
        # Add timestamp
        groq_analysis["last_updated"] = datetime.now(timezone.utc).isoformat()

        # Store in database
        await students_collection.update_one(
            {"email": email},
            {"$set": {"github_groq_analysis": groq_analysis}}
        )

        return {
            "message": "Detailed GitHub analysis completed",
            "groq_analysis": groq_analysis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq analysis failed: {str(e)}")

@router.delete("/analyze/github-detailed/cache")
async def clear_groq_cache(user=Depends(get_current_user)):
    """Clear cached Groq analysis to force fresh analysis"""
    email = user["email"]
    
    await students_collection.update_one(
        {"email": email},
        {"$unset": {"github_groq_analysis": ""}}
    )
    
    return {"message": "Groq analysis cache cleared successfully"}


