from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict


class StudentSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    year: str
    branch: str
    cgpa: float
    skills: List[str]
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class StudentProfile(BaseModel):
    name: str
    email: EmailStr
    year: str
    branch: str

    cgpa: Optional[float] = None
    skills: List[str] = []

    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

    prs_score: int = 0
    prs_breakdown: Optional[Dict] = None

    github_analysis: Optional[Dict] = None
    resume_analysis: Optional[Dict] = None
    ats_score: int = 0


class StudentUpdate(BaseModel):
    cgpa: Optional[float] = None
    skills: Optional[List[str]] = []

    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    
    resume_analysis: Optional[Dict] = None
    ats_score: Optional[int] = None
