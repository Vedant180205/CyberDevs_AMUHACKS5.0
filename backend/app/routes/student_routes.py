import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from datetime import datetime, timedelta, timezone

from app.database import students_collection
from app.utils.auth_dependency import get_current_user
from app.models.student_model import StudentUpdate
from app.services.github_service import analyze_github_profile

from app.services.prs_service import calculate_prs
from app.services.resume_service import process_resume_upload, analyze_resume_with_groq
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


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    email = user["email"]
    student = await students_collection.find_one({"email": email})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Ensure upload directory exists
    UPLOAD_DIR = "uploads/resumes/"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_path = os.path.join(UPLOAD_DIR, f"{student['_id']}_{file.filename}")
    
    # Save PDF
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Process Resume
    try:
        extraction_result = await process_resume_upload(file_path, str(student["_id"]))
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

    # Create Resume Document
    resume_data = {
        "file_name": file.filename,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "raw_text": extraction_result["raw_text"],
        "tables": extraction_result["tables"],
        "images_extracted": extraction_result["images_extracted"],
        "sections_found": [], # To be filled by AI later
        "resume_score": 0,
        "ats_score": 0,
        "missing_sections": [],
        "profile_resume_match_score": 0,
        "profile_mismatches": [],
        "suggestions": [],
        "last_analyzed_at": None,
        # Store contact info found via regex as validation metadata if needed
        "contact_info": extraction_result["contact_info"] 
    }

    # Update Student
    await students_collection.update_one(
        {"email": email},
        {"$set": {"resume": resume_data}}
    )

    return {
        "message": "Resume uploaded successfully",
        "file_name": file.filename,
        "raw_text_preview": extraction_result["raw_text"][:200] + "...",
        "images_extracted": extraction_result["images_extracted"],
        "tables_extracted": len(extraction_result["tables"])
    }


@router.post("/analyze-resume")
async def analyze_resume_endpoint(user=Depends(get_current_user)):
    email = user["email"]
    
    # Fetch Student
    student = await students_collection.find_one({"email": email})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    resume_data = student.get("resume")
    if not resume_data or not resume_data.get("raw_text"):
        raise HTTPException(status_code=400, detail="No resume found. Please upload one first.")

    # Call AI Service
    try:
        analysis_result = await analyze_resume_with_groq(student, resume_data["raw_text"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

    # Update Student Document
    update_data = {
        "resume.resume_score": analysis_result.get("resume_score", 0),
        "resume.ats_score": analysis_result.get("ats_score", 0),
        "resume.missing_sections": analysis_result.get("missing_sections", []),
        "resume.profile_mismatches": analysis_result.get("profile_mismatches", []),
        "resume.suggestions": analysis_result.get("improvement_suggestions", []),
        "resume.last_analyzed_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Store detected skills if any (optional, can merge with profile skills if wanted, but keeping separate for now)
    
    await students_collection.update_one(
        {"email": email},
        {"$set": update_data}
    )

    return {
        "message": "Resume analyzed successfully",
        "analysis": analysis_result
    }


@router.get("/resume-analysis")
async def get_resume_analysis(user=Depends(get_current_user)):
    email = user["email"]
    student = await students_collection.find_one({"email": email})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    resume_data = student.get("resume")
    if not resume_data:
        return {"message": "No resume data found", "analysis": None}

    return {
        "resume_score": resume_data.get("resume_score", 0),
        "ats_score": resume_data.get("ats_score", 0),
        "missing_sections": resume_data.get("missing_sections", []),
        "profile_mismatches": resume_data.get("profile_mismatches", []),
        "suggestions": resume_data.get("suggestions", []),
        "last_analyzed_at": resume_data.get("last_analyzed_at")
    }



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
        ai_analysis = await analyze_company_matches_with_groq(student, match_result["matches"])
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
        groq_analysis = await analyze_github_with_groq(github_analysis)
        
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


