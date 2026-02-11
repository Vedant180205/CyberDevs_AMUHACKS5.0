def calculate_prs(student_data: dict) -> dict:
    """
    Calculates the Placement Readiness Score (PRS) based on weighted categories.
    Weights: GitHub (25%), LinkedIn (15%), Resume (10%), Aptitude (15%), 
             Coding (20%), Soft Skills (10%), Academic (5%)
    """
    # Extract scores from the student document
    github = student_data.get("github_analysis", {}).get("github_score", 0)
    linkedin = student_data.get("linkedin_analysis", {}).get("linkedin_score", 0)
    resume = student_data.get("resume_analysis", {}).get("ats_score", 0)
    
    # These might be from an 'assessments' sub-object in your seeded data
    aptitude = student_data.get("prs_breakdown", {}).get("aptitude", 0)
    coding = student_data.get("prs_breakdown", {}).get("coding", 0)
    softskills = student_data.get("prs_breakdown", {}).get("softskills", 0)
    academic = student_data.get("prs_breakdown", {}).get("academic", 0)

    # Weighted calculation
    total_score = (
        (github * 0.25) +
        (linkedin * 0.15) +
        (resume * 0.10) +
        (aptitude * 0.15) +
        (coding * 0.20) +
        (softskills * 0.10) +
        (academic * 0.05)
    )

    # Determine Tier
    if total_score >= 75:
        tier = "Green"
    elif total_score >= 50:
        tier = "Yellow"
    else:
        tier = "Red"

    return {
        "prs": round(total_score, 2),
        "tier": tier,
        "breakdown": {
            "github": github,
            "linkedin": linkedin,
            "resume": resume,
            "aptitude": aptitude,
            "coding": coding,
            "softskills": softskills,
            "academic": academic
        }
    }