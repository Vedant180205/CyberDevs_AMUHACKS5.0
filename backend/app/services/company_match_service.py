from typing import Dict, List


def match_student_with_companies(student: dict, companies: List[dict]) -> Dict:
    """
    Returns:
    {
        "student": {...basic info...},
        "matches": [
            {
              "company_name": "...",
              "role": "...",
              "tier": "...",
              "eligible": True/False,
              "missing_cgpa": True/False,
              "missing_skills": [...],
              "match_percent": int
            }
        ]
    }
    """

    student_branch = student.get("branch")
    student_cgpa = student.get("cgpa", 0)
    student_skills = set([s.lower() for s in student.get("skills", [])])

    results = []

    for company in companies:
        company_name = company.get("company_name")
        role = company.get("role")
        tier = company.get("tier")

        allowed_branches = [b.upper() for b in company.get("allowed_branches", [])]
        min_cgpa = company.get("min_cgpa", 0)

        required_skills = [s.lower() for s in company.get("required_skills", [])]
        preferred_skills = [s.lower() for s in company.get("preferred_skills", [])]

        # ---------------- Branch Check ----------------
        branch_allowed = student_branch in allowed_branches

        # ---------------- CGPA Check ----------------
        cgpa_ok = student_cgpa is not None and student_cgpa >= min_cgpa

        # ---------------- Skills Check ----------------
        missing_required_skills = []
        for skill in required_skills:
            if skill not in student_skills:
                missing_required_skills.append(skill)

        required_ok = len(missing_required_skills) == 0

        # ---------------- Eligibility ----------------
        eligible = branch_allowed and cgpa_ok and required_ok

        # ---------------- Match Percent ----------------
        total_skills = len(required_skills) + len(preferred_skills)
        matched_skills = 0

        for skill in required_skills:
            if skill in student_skills:
                matched_skills += 1

        for skill in preferred_skills:
            if skill in student_skills:
                matched_skills += 1

        if total_skills == 0:
            match_percent = 100
        else:
            match_percent = int((matched_skills / total_skills) * 100)

        results.append({
            "company_name": company_name,
            "role": role,
            "tier": tier,
            "eligible": eligible,
            "branch_allowed": branch_allowed,
            "cgpa_required": min_cgpa,
            "student_cgpa": student_cgpa,
            "cgpa_ok": cgpa_ok,
            "missing_required_skills": missing_required_skills,
            "match_percent": match_percent
        })

    # sort by match %
    results.sort(key=lambda x: x["match_percent"], reverse=True)

    return {
        "student": {
            "name": student.get("name"),
            "email": student.get("email"),
            "branch": student.get("branch"),
            "year": student.get("year"),
            "cgpa": student.get("cgpa"),
            "skills": student.get("skills", [])
        },
        "matches": results
    }
