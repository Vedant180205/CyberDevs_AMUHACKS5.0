from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
import io
import csv

from app.utils.auth_dependency import get_current_user
from app.services.report_fsm import ReportGeneratorFSM
from app.database import students_collection

router = APIRouter()

@router.get("/report/branch")
async def generate_branch_report(
    branch: Optional[str] = Query(default="All", description="Branch name, e.g. CSE, IT, ECS"),
    current_user=Depends(get_current_user),
):
    """
    Generate and download a professional PDF report for a given branch.
    Powered by the ReportGenerator Finite State Machine engine.
    """
    # 1. Instantiate the FSM
    fsm_engine = ReportGeneratorFSM(branch)
    
    # 2. Run the generator FSM states (FETCH -> AI -> RENDER pdf buffer)
    pdf_buf = await fsm_engine.run()

    # 3. Stream the file back
    safe_branch = (branch or "All").replace(" ", "_")
    filename = f"CampusIQ_{safe_branch}_Report_{datetime.now().strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/report/csv")
async def generate_branch_csv(
    branch: Optional[str] = Query(default="All", description="Branch name, e.g. CSE, IT, ECS"),
    current_user=Depends(get_current_user),
):
    """
    Download a CSV data dump of the students matching the branch for raw Excel analysis.
    """
    query = {}
    if branch and branch != "All":
        query["branch"] = {"$regex": f"^{branch}$", "$options": "i"}
    
    students = await students_collection.find(query, {"password": 0}).to_list(10000)
    
    buf = io.StringIO()
    writer = csv.writer(buf)
    
    # Headers
    writer.writerow(["Name", "Email", "Branch", "Year", "CGPA", "Total PRS", "Resume ATS Score", "GitHub Score", "Skills Score"])
    
    for s in students:
        pb = s.get("prs_breakdown") or {}
        writer.writerow([
            s.get("full_name") or s.get("name", "N/A"),
            s.get("email", "N/A"),
            s.get("branch", "N/A"),
            s.get("year", "N/A"),
            s.get("cgpa", 0.0),
            s.get("prs_score", 0),
            pb.get("resume_ats_score_20", 0),
            pb.get("github_score_25", 0),
            pb.get("skills_score_15", 0)
        ])
    
    buf.seek(0)
    safe_branch = (branch or "All").replace(" ", "_")
    filename = f"CampusIQ_{safe_branch}_Data_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
