from pydantic import BaseModel
from typing import List, Optional, Dict

class StudentDashboard(BaseModel):
    name: str
    branch: str
    year: int
    prs: float
    tier: str
    prs_breakdown: Dict[str, float]
    profile_completion: int
    github_analysis: Dict
    linkedin_analysis: Dict
    resume_analysis: Dict