from groq import Groq
from app.config import GROQ_API_KEY, GROQ_MODEL
import json

client = Groq(api_key=GROQ_API_KEY)


def analyze_github_with_groq(github_data: dict) -> dict:
    """
    Use Groq AI to analyze GitHub profile data and provide intelligent insights.
    
    Args:
        github_data: The GitHub analysis data from github_service
        
    Returns:
        dict with skill_level, strengths, improvements, quality_score, recommendations
    """
    
    # Extract key metrics
    username = github_data.get("username", "Unknown")
    public_repos = github_data.get("public_repos", 0)
    top_languages = github_data.get("top_languages", [])
    activity = github_data.get("activity_summary", {})
    project_types = github_data.get("project_type_distribution", {})
    github_score = github_data.get("github_score", 0)
    repo_analysis = github_data.get("repo_analysis", [])
    
    # Build comprehensive prompt
    prompt = f"""You are an expert technical recruiter and software engineering mentor. Analyze this developer's GitHub profile and provide detailed insights.

**Developer Profile:**
- Username: {username}
- Public Repositories: {public_repos}
- GitHub Activity Score: {github_score}/100
- Top Languages: {', '.join(top_languages[:6])}
- Active repos (last 90 days): {activity.get('active_repos_last_90_days', 0)}
- Recent commits (last 90 days): {activity.get('commits_last_90_days_estimated', 0)}

**Project Type Distribution:**
{json.dumps(project_types, indent=2)}

**Recent Projects Summary:**
{json.dumps(repo_analysis[:5], indent=2)}

Based on this data, provide a detailed analysis in JSON format with the following structure:

{{
  "skill_level": "Beginner|Intermediate|Advanced|Expert",
  "skill_level_reasoning": "Brief explanation of why this level was assigned",
  "strengths": [
    "Strength 1 with specific evidence",
    "Strength 2 with specific evidence", 
    "Strength 3 with specific evidence"
  ],
  "areas_for_improvement": [
    "Area 1 with actionable advice",
    "Area 2 with actionable advice",
    "Area 3 with actionable advice"
  ],
  "project_quality_score": 0-10,
  "project_quality_reasoning": "Assessment of project quality based on README, documentation, tech choices",
  "tech_stack_diversity": "Low|Medium|High",
  "tech_stack_summary": "Brief summary of technology breadth and depth",
  "placement_readiness": "Not Ready|Getting Ready|Ready|Highly Competitive",
  "placement_readiness_reasoning": "Why this readiness level was assigned",
  "recommended_next_steps": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "standout_projects": [
    "Project name and why it stands out"
  ],
  "overall_summary": "2-3 sentence summary of the developer's profile"
}}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object."""

    try:
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL,  # configurable model via env `GROQ_MODEL`
            temperature=0.3,  # Lower temperature for more consistent analysis
            max_tokens=2000,
        )
        
        # Extract response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Parse JSON response
        try:
            analysis = json.loads(response_text)
            return analysis
        except json.JSONDecodeError:
            # If response isn't valid JSON, try to extract JSON from markdown
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
                analysis = json.loads(json_str)
                return analysis
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
                analysis = json.loads(json_str)
                return analysis
            else:
                raise ValueError("Groq response is not valid JSON")
                
    except Exception as e:
        err_str = str(e)
        # Detect decommissioned model errors from provider and provide actionable guidance
        if "decommission" in err_str.lower() or "model_decommissioned" in err_str.lower() or "has been decommissioned" in err_str.lower():
            message = (
                f"Requested Groq model '{GROQ_MODEL}' appears to be decommissioned. "
                "Set the `GROQ_MODEL` environment variable to a supported model and restart the service. "
                "See https://console.groq.com/docs/deprecations for recommended replacements."
            )
            return {
                "skill_level": "Unknown",
                "skill_level_reasoning": message,
                "strengths": ["Unable to analyze at this time"],
                "areas_for_improvement": ["Please try again later"],
                "project_quality_score": 0,
                "project_quality_reasoning": "Analysis failed",
                "tech_stack_diversity": "Unknown",
                "tech_stack_summary": "Analysis failed",
                "placement_readiness": "Unknown",
                "placement_readiness_reasoning": "Analysis failed",
                "recommended_next_steps": ["Update GROQ_MODEL and retry"],
                "standout_projects": [],
                "overall_summary": message,
                "error": err_str,
            }

        # Generic fallback
        return {
            "skill_level": "Unknown",
            "skill_level_reasoning": f"Analysis failed: {err_str}",
            "strengths": ["Unable to analyze at this time"],
            "areas_for_improvement": ["Please try again later"],
            "project_quality_score": 0,
            "project_quality_reasoning": "Analysis failed",
            "tech_stack_diversity": "Unknown",
            "tech_stack_summary": "Analysis failed",
            "placement_readiness": "Unknown",
            "placement_readiness_reasoning": "Analysis failed",
            "recommended_next_steps": ["Try running the analysis again"],
            "standout_projects": [],
            "overall_summary": f"Unable to complete analysis: {err_str}",
            "error": err_str,
        }


def analyze_company_matches_with_groq(student: dict, company_matches: list) -> dict:
    """
    Use Groq AI to analyze student profile against company matches and provide detailed insights.
    
    Args:
        student: Student profile data
        company_matches: List of company match results from company_match_service
        
    Returns:
        dict with profile analysis, per-company insights, and recommendations
    """
    
    # Extract student data
    name = student.get("name", "Student")
    branch = student.get("branch", "Unknown")
    year = student.get("year", "Unknown")
    cgpa = student.get("cgpa", 0)
    skills = student.get("skills", [])
    github_analysis = student.get("github_analysis", {})
    prs_score = student.get("prs_score", 0)
    
    # Build comprehensive prompt
    prompt = f"""You are an expert career counselor and placement advisor. Analyze this student's profile against their company matches and provide detailed, actionable insights.

**Student Profile:**
- Name: {name}
- Branch: {branch}
- Year: {year}
- CGPA: {cgpa}
- Skills: {', '.join(skills)}
- PRS (Placement Readiness Score): {prs_score}/100
- GitHub Score: {github_analysis.get('github_score', 0)}/100
- Top Languages: {', '.join(github_analysis.get('top_languages', [])[:5])}
- Public Repos: {github_analysis.get('public_repos', 0)}
- Recent Activity (90d): {github_analysis.get('activity_summary', {}).get('commits_last_90_days_estimated', 0)} commits

**Company Matches:**
{json.dumps(company_matches, indent=2)}

Provide a detailed analysis in JSON format with this EXACT structure:

{{
  "profile_strengths": [
    "Specific strength with evidence from profile",
    "Another strength with evidence",
    "Third strength with evidence"
  ],
  "profile_weaknesses": [
    "Specific weakness with explanation",
    "Another weakness with explanation",
    "Third weakness with explanation"
  ],
  "overall_profile_summary": "2-3 sentences summarizing the student's placement readiness and key differentiators",
  "company_insights": [
    {{
      "company_name": "Exact company name from matches",
      "is_eligible": true/false,
      "match_reasoning": "Detailed explanation of why skills/tech stack match this company",
      "eligibility_explanation": "Clear explanation of eligibility status - if eligible, why they qualify; if not, specific missing requirements (CGPA/skills/branch)",
      "improvement_suggestions": [
        "Specific action to improve match/eligibility",
        "Another actionable suggestion"
      ]
    }}
  ],
  "top_priority_actions": [
    "Most important action for overall placement success",
    "Second priority action",
    "Third priority action"
  ],
  "recommended_companies_to_focus": [
    "Company name and brief reason why student should prioritize it"
  ]
}}

CRITICAL INSTRUCTIONS:
1. Be SPECIFIC - cite actual skills, CGPA values, branch requirements
2. For eligible companies, explain WHAT makes them a good match (skills overlap, tech stack alignment)
3. For ineligible companies, state EXACTLY what's missing (e.g., "CGPA 7.5 required, student has 6.8" or "Missing required skills: System Design, DSA")
4. Make suggestions ACTIONABLE (e.g., "Complete DSA course", "Work on 2 full-stack projects", not vague advice)
5. Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object."""

    try:
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL,
            temperature=0.4,  # Slightly higher for more creative insights
            max_tokens=3000,  # More tokens for comprehensive analysis
        )
        
        # Extract response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Parse JSON response
        try:
            analysis = json.loads(response_text)
            return analysis
        except json.JSONDecodeError:
            # Try to extract JSON from markdown
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
                analysis = json.loads(json_str)
                return analysis
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
                analysis = json.loads(json_str)
                return analysis
            else:
                raise ValueError("Groq response is not valid JSON")
                
    except Exception as e:
        err_str = str(e)
        # Return error structure
        return {
            "profile_strengths": ["Unable to analyze at this time"],
            "profile_weaknesses": ["Analysis failed - please try again"],
            "overall_profile_summary": f"Analysis failed: {err_str}",
            "company_insights": [],
            "top_priority_actions": ["Retry the analysis"],
            "recommended_companies_to_focus": [],
            "error": err_str
        }

