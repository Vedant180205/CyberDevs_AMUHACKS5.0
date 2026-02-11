from pydantic import BaseModel
from typing import List, Optional

class CompanyModel(BaseModel):
    company_name: str
    tier: str
    role: str
    allowed_branches: List[str]
    min_cgpa: float
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
