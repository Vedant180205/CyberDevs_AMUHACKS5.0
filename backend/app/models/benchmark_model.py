from pydantic import BaseModel
from typing import List

class BenchmarkModel(BaseModel):
    branch: str
    year: str
    expected_prs: int
    expected_skills: List[str]
    min_projects: int
    min_github_score: int
