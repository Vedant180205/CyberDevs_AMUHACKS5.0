from ..core.database import companies_col

async def check_company_eligibility(student_data: dict, company_name: str):
    """
    Compares student profile against a specific company's requirements.
    """
    company = await companies_col.find_one({"name": company_name})
    if not company:
        return {"error": "Company not found"}

    # Eligibility Checks
    cgpa_eligible = student_data.get("cgpa", 0) >= company.get("min_cgpa", 0)
    branch_eligible = student_data.get("branch") in company.get("eligible_branches", [])
    
    # Skill Match (Simple keyword matching for prototype)
    student_skills = set(student_data.get("skills", []))
    required_skills = set(company.get("required_skills", []))
    matched_skills = student_skills.intersection(required_skills)
    
    match_percent = (len(matched_skills) / len(required_skills) * 100) if required_skills else 100

    return {
        "company": company_name,
        "eligible": cgpa_eligible and branch_eligible,
        "criteria": {
            "cgpa": {"required": company.get("min_cgpa"), "actual": student_data.get("cgpa"), "pass": cgpa_eligible},
            "branch": {"required": company.get("eligible_branches"), "actual": student_data.get("branch"), "pass": branch_eligible}
        },
        "skill_match_percent": round(match_percent, 2),
        "missing_skills": list(required_skills - student_skills)
    }