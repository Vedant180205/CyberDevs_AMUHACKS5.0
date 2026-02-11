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

    return {
        "message": "Company matching completed",
        "company_matches": match_result
    }
