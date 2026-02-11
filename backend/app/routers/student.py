from fastapi import APIRouter, HTTPException, Depends, Form
import os
from bson import ObjectId, errors
from ..core.database import students_col, companies_col, prs_snapshots_col, microtasks_col
from ..services.prs_engine import calculate_prs
from ..dependencies import get_current_user
from fastapi import File, UploadFile
from ..services.resume_parser import extract_text_from_pdf
from ..services.ai_advisor import client, analyze_company_fit, generate_micro_tasks, analyze_resume_deep

router = APIRouter(prefix="/student", tags=["Student Portal"])

@router.get("/profile")
async def get_student_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the profile of the currently logged-in student.
    Uses the student_id from the user record.
    """
    student_id = current_user.get("student_id")
    if not student_id:
        raise HTTPException(status_code=404, detail="Student profile not linked to user")

    try:
        obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")

    student = await students_col.find_one({"_id": obj_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Run PRS Engine to refresh score live
    live_prs_data = calculate_prs(student)
    
    student["prs"] = live_prs_data["prs"]
    student["tier"] = live_prs_data["tier"]
    student["prs_breakdown"] = live_prs_data["breakdown"]

    # Serialize ObjectId
    student["_id"] = str(student["_id"])
    
    # Map 'name' to 'full_name' if needed by frontend, or ensure frontend expects 'name'.
    # The dashboard expects 'full_name', 'prs_score', 'branch', 'year'.
    # Our DB has 'name', 'prs', 'branch'. We need to map them.
    return {
        "full_name": student.get("name"),
        "prs_score": student.get("prs"),
        "branch": student.get("branch"),
        "year": student.get("year", "Final"), # Default to Final if missing
        "tier": student.get("tier"),
        "cgpa": student.get("cgpa")
    }

@router.post("/onboard")
async def onboard_student(
    student_data_json: str = Form(...),
    resume: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    import json
    try:
        student_data = json.loads(student_data_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in student_data")

    # Resume Processing
    resume_text = ""
    scraped_skills = []
    if resume:
        temp_path = f"temp_{resume.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await resume.read())
        
        try:
            resume_text = extract_text_from_pdf(temp_path)
            # Optional: Scrape skills from resume immediately or just save the text
            # For now, let's just save the text to the profile or process basic skills
            # calling local AI service might be slow, so maybe skip or do async?
            # Let's do a quick extraction if possible, else just save text.
            # prompt = f"Extract skills... {resume_text}" 
            # (Skipping AI call here to ensure speed, can be done in background or separate endpoint)
        except Exception as e:
            print(f"Resume parse error: {e}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    # Calculate PRS (Basic initial calculation)
    # We map frontend keys to PRS expected keys if needed, but we'll try to rely on 'student_data' being clean from frontend.
    
    student_doc = {
        "user_id": current_user["_id"], # Link to User Account
        "name": student_data.get("name"),
        "email": student_data.get("email"),
        "branch": student_data.get("branch"),
        "year": student_data.get("year"),
        "cgpa": float(student_data.get("cgpa", 0)),
        "skills": student_data.get("skills", []), 
        "linkedin": student_data.get("linkedin"),
        "github": student_data.get("github"),
        "portfolio": student_data.get("portfolio"),
        "major_projects": student_data.get("major_projects", []),
        "internships": student_data.get("internships"),
        "certifications": student_data.get("certifications"),
        "target_roles": student_data.get("target_roles", []),
        "target_companies": student_data.get("target_companies"),
        "resume_text": resume_text, # Save parsed text
        # PRS Fields
        "prs": 0, # Will be calculated
        "tier": "Pending",
        "prs_breakdown": {},
        "profile_completion": 100
    }

    # Calculate Object PRS
    live_prs = calculate_prs(student_doc)
    student_doc["prs"] = live_prs["prs"]
    student_doc["tier"] = live_prs["tier"]
    student_doc["prs_breakdown"] = live_prs["breakdown"]
    
    try:
        # 1. Insert into Students Collection
        result = await students_col.insert_one(student_doc)
        student_id = str(result.inserted_id)
        
        # 2. Insert Initial PRS Snapshot
        from datetime import datetime
        snapshot_doc = {
            "student_id": student_id,
            "prs_score": live_prs["prs"],
            "breakdown": live_prs["breakdown"],
            "tier": live_prs["tier"],
            "timestamp": datetime.utcnow()
        }
        await prs_snapshots_col.insert_one(snapshot_doc)

        # 3. Generate & Insert Micro-Tasks
        # We need a quick profile summary for the AI
        profile_summary = {
            "branch": student_doc.get("branch"),
            "year": student_doc.get("year"),
            "skills": student_doc.get("skills"),
            "missing_skills": [] # Logic to find missing skills could be added here
        }
        
        generated_tasks = await generate_micro_tasks(profile_summary)
        
        # Create microtask documents
        task_docs = []
        for task_desc in generated_tasks:
            task_docs.append({
                "student_id": student_id,
                "task": task_desc,
                "status": "pending",
                "assigned_date": datetime.utcnow(),
                "deadline": None # Could be set to 1 week later
            })
            
        if task_docs:
            await microtasks_col.insert_many(task_docs)
            
        # 4. Update User Link
        from ..core.database import users_col
        await users_col.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"student_id": student_id}}
        )

        return {"student_id": student_id, "message": "Onboarded successfully with PRS and Tasks initialized."}

    except Exception as e:
        # In a real app, we might want to rollback the student insertion if subsequent steps fail
        # For now, we just log and return error
        print(f"Onboarding Sync Error: {e}")
        raise HTTPException(status_code=500, detail="Onboarding failed during data synchronization.")

@router.get("/{student_id}")
async def get_student_dashboard(student_id: str):
    try:
        obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")

    student = await students_col.find_one({"_id": obj_id})
    if not student:
        raise HTTPException(status_code=404, detail=f"Student ID not found")

    live_prs_data = calculate_prs(student)
    student["prs"] = live_prs_data["prs"]
    student["tier"] = live_prs_data["tier"]
    student["prs_breakdown"] = live_prs_data["breakdown"]
    student["_id"] = str(student["_id"])
    
    return student

@router.get("/{student_id}/eligibility/{company_name}")
async def check_eligibility(student_id: str, company_name: str):
    try:
        obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")

    student = await students_col.find_one({"_id": obj_id})
    company = await companies_col.find_one({"name": company_name})

    if not student or not company:
        raise HTTPException(status_code=404, detail="Student or Company not found")

    cgpa_pass = student.get("cgpa", 0) >= company.get("min_cgpa", 0)
    branch_pass = student.get("branch") in company.get("eligible_branches", [])
    
    student_skills = set(student.get("skills", []))
    required_skills = set(company.get("required_skills", []))
    missing_skills = list(required_skills - student_skills)

    return {
        "company": company_name,
        "eligible": cgpa_pass and branch_pass,
        "status": {
            "cgpa": {"pass": cgpa_pass, "current": student.get("cgpa"), "required": company.get("min_cgpa")},
            "branch": {"pass": branch_pass, "current": student.get("branch")},
            "skills": {
                "match_percent": (len(student_skills.intersection(required_skills)) / len(required_skills) * 100) if required_skills else 100, 
                "missing": missing_skills
            }
        }
    }

@router.post("/{student_id}/upload-resume")
async def upload_and_scrape_resume(student_id: str, file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    resume_text = extract_text_from_pdf(temp_path)

    prompt = f"Extract a comma-separated list of technical skills from this resume text: {resume_text}"
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}]
    )
    
    scraped_skills = response.choices[0].message.content.split(",")
    os.remove(temp_path)

    return {
        "student_id": student_id,
        "scraped_skills": [s.strip() for s in scraped_skills]
    }

@router.post("/{student_id}/company-lens/{company_id}")
async def company_lens(student_id: str, company_id: str):
    try:
        s_obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")
        
    try:
        c_obj_id = ObjectId(company_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Company ID format")

    student = await students_col.find_one({"_id": s_obj_id})
    company = await companies_col.find_one({"_id": c_obj_id})

    if not student or not company:
        raise HTTPException(status_code=404, detail="Student or Company not found")

    analysis_result = await analyze_company_fit(student, company)
    
    return {
        "student": student.get("name"),
        "company": company.get("name"),
        "lens_analysis": analysis_result
    }

@router.post("/{student_id}/micro-tasks")
async def get_micro_tasks(student_id: str):
    try:
        s_obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")
    
    student = await students_col.find_one({"_id": s_obj_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    profile_summary = {
        "skills": student.get("skills", []),
        "prs_score": student.get("prs", 0),
        "branch": student.get("branch", ""),
        "tier": student.get("tier", "")
    }
    
    tasks = await generate_micro_tasks(profile_summary)
    
    return {
        "student_id": student_id,
        "tasks": tasks
    }

@router.get("/{student_id}/tasks")
async def get_existing_tasks(student_id: str):
    try:
        student_tasks = await microtasks_col.find({"student_id": student_id}).to_list(length=20)
        # Serialize ObjectId
        for t in student_tasks:
            t["_id"] = str(t["_id"])
        return student_tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{student_id}/tasks/{task_id}")
async def update_task_status(student_id: str, task_id: str, status_update: dict):
    try:
        t_id = ObjectId(task_id)
        new_status = status_update.get("status")
        if new_status not in ["pending", "completed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
            
        result = await microtasks_col.update_one(
            {"_id": t_id, "student_id": student_id},
            {"$set": {"status": new_status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Task not found or not modified")
            
        return {"message": "Task updated", "status": new_status}
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Task ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{student_id}/analyze-resume")
async def analyze_resume(student_id: str, file: UploadFile = File(...)):
    try:
        s_obj_id = ObjectId(student_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Student ID format")
        
    temp_path = f"ats_temp_{student_id}_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        resume_text = extract_text_from_pdf(temp_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    analysis_result = await analyze_resume_deep(resume_text)
    
    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {
        "student_id": student_id,
        "filename": file.filename,
        "ats_analysis": analysis_result
    }