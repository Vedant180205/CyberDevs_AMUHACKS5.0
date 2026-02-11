def calculate_prs(student: dict):
    """
    Returns:
    {
        "prs_score": int,
        "prs_level": str,
        "breakdown": {...}
    }
    """

    cgpa = student.get("cgpa")
    skills = student.get("skills", [])
    github_analysis = student.get("github_analysis", {})

    # ---------------- GitHub Score (0-25) ----------------
    github_score_raw = github_analysis.get("github_score", 0)  # 0-100
    github_score = int((github_score_raw / 100) * 25)

    # ---------------- Skills Score (0-15) ----------------
    skills_count = len(skills)

    if skills_count >= 12:
        skills_score = 15
    elif skills_count >= 8:
        skills_score = 12
    elif skills_count >= 5:
        skills_score = 9
    elif skills_count >= 3:
        skills_score = 6
    elif skills_count >= 1:
        skills_score = 3
    else:
        skills_score = 0

    # ---------------- CGPA Score (0-10) ----------------
    if cgpa is None:
        cgpa_score = 0
    elif cgpa >= 9.0:
        cgpa_score = 10
    elif cgpa >= 8.0:
        cgpa_score = 8
    elif cgpa >= 7.0:
        cgpa_score = 6
    elif cgpa >= 6.0:
        cgpa_score = 4
    else:
        cgpa_score = 2

    # ---------------- Activity Score (0-10) ----------------
    activity = github_analysis.get("activity_summary", {})
    commits_90 = activity.get("commits_last_90_days_estimated", 0)

    if commits_90 >= 80:
        activity_score = 10
    elif commits_90 >= 50:
        activity_score = 8
    elif commits_90 >= 25:
        activity_score = 6
    elif commits_90 >= 10:
        activity_score = 4
    elif commits_90 >= 1:
        activity_score = 2
    else:
        activity_score = 0

    # ---------------- Project Diversity Score (0-10) ----------------
    project_dist = github_analysis.get("project_type_distribution", {})
    diversity_count = len(project_dist.keys())

    if diversity_count >= 6:
        diversity_score = 10
    elif diversity_count >= 4:
        diversity_score = 8
    elif diversity_count >= 3:
        diversity_score = 6
    elif diversity_count >= 2:
        diversity_score = 4
    elif diversity_count >= 1:
        diversity_score = 2
    else:
        diversity_score = 0

    # ---------------- Language Diversity Score (0-10) ----------------
    top_langs = github_analysis.get("top_languages", [])
    lang_count = len(top_langs)

    if lang_count >= 6:
        language_score = 10
    elif lang_count >= 4:
        language_score = 8
    elif lang_count >= 3:
        language_score = 6
    elif lang_count >= 2:
        language_score = 4
    elif lang_count >= 1:
        language_score = 2
    else:
        language_score = 0

    # ---------------- Final PRS (out of 100) ----------------
    prs_total = (
        github_score +
        skills_score +
        cgpa_score +
        activity_score +
        diversity_score +
        language_score
    )

    # scale to 100 (because currently we total 25+15+10+10+10+10 = 80)
    prs_scaled = int((prs_total / 80) * 100)

    breakdown = {
        "github_score_25": github_score,
        "skills_score_15": skills_score,
        "cgpa_score_10": cgpa_score,
        "activity_score_10": activity_score,
        "project_diversity_score_10": diversity_score,
        "language_diversity_score_10": language_score,
        "raw_total_80": prs_total
    }

    # ---------------- PRS LEVEL ----------------
    if prs_scaled >= 80:
        prs_level = "Excellent"
    elif prs_scaled >= 60:
        prs_level = "Good"
    elif prs_scaled >= 40:
        prs_level = "Average"
    else:
        prs_level = "Poor"

    return {
        "prs_score": prs_scaled,
        "prs_level": prs_level,
        "breakdown": breakdown
    }
