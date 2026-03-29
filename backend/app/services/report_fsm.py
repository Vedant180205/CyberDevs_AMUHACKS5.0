import io
import json
from enum import Enum
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether
)

from app.database import benchmarks_collection, students_collection
from app.services.groq_service import generate_dynamic_report_summary_with_groq

# ─────────────────────────── Coral / Blue Theme ────────────────────────────
PRIMARY        = colors.HexColor("#061C47")   # deep navy
ACCENT         = colors.HexColor("#F57A66")   # coral red
LIGHT_BLUE     = colors.HexColor("#6396CB")   # cornflower blue
SECONDARY_BLUE = colors.HexColor("#5966A0")   # dusty indigo
PALE_PINK      = colors.HexColor("#FBEAE8")   # pale pink/coral
WHITE          = colors.white
BODY_TEXT      = colors.HexColor("#333333")
BORDER         = colors.HexColor("#DDDDDD")

PAGE_W, PAGE_H = A4
MARGIN = 1.4 * cm


class ReportState(str, Enum):
    INIT = "INIT"
    FETCH_DATA = "FETCH_DATA"
    ANALYZE_WITH_GROQ = "ANALYZE_WITH_GROQ"
    RENDER_PDF = "RENDER_PDF"
    COMPLETE = "COMPLETE"


class ReportGeneratorFSM:
    def __init__(self, branch: str):
        self.branch = branch
        self.state = ReportState.INIT
        
        self.students = []
        self.gap_data = []
        self.comp_buckets = {}
        self.risk_dist_by_year = {}
        self.ai_summary_data = {}
        self.pdf_buffer = None
        self.stats = {}

        # Part 2: Detailed Phase Rosters
        self.top_10_skills = [] # (skill, count)
        self.top_3_skills = []
        self.roster_missing_skills = []
        self.roster_missing_sections = []
        self.roster_inactive_github = []
        self.roster_low_cgpa = []

        # Part 3: Granular Student Alignment
        self.skill_smes = {} # Map skill -> list of (name, prs)
        self.gap_leaders = [] # Top 5 PRS
        self.gap_laggards = [] # Bottom 5 PRS
        self.technical_elites = [] # Students with high GH + Resume scores

    async def run(self) -> io.BytesIO:
        while self.state != ReportState.COMPLETE:
            if self.state == ReportState.INIT:
                await self._state_init()
            elif self.state == ReportState.FETCH_DATA:
                await self._state_fetch_data()
            elif self.state == ReportState.ANALYZE_WITH_GROQ:
                await self._state_analyze_with_groq()
            elif self.state == ReportState.RENDER_PDF:
                await self._state_render_pdf()
        return self.pdf_buffer

    async def _state_init(self):
        self.branch_label = self.branch if self.branch and self.branch != "All" else "All Branches"
        self.state = ReportState.FETCH_DATA

    async def _state_fetch_data(self):
        query = {}
        if self.branch and self.branch != "All":
            query["branch"] = {"$regex": f"^{self.branch}$", "$options": "i"}
        self.students = await students_collection.find(query, {"password": 0}).to_list(10000)

        total = len(self.students)
        
        # Sort by PRS immediately for easier Top Performers
        self.students.sort(key=lambda x: x.get("prs_score", 0), reverse=True)

        self.stats = {
            "total": total,
            "avg_prs": round(sum(s.get("prs_score", 0) for s in self.students) / total, 1) if total else 0,
            "red": sum(1 for s in self.students if s.get("prs_score", 0) < 40),
            "yellow": sum(1 for s in self.students if 40 <= s.get("prs_score", 0) <= 60),
            "green": sum(1 for s in self.students if s.get("prs_score", 0) > 60),
        }

        benchmarks = await benchmarks_collection.find({}).to_list(100)
        bmap = {(self._normalize_branch(b.get("branch", "")), self._normalize_year(b.get("year", ""))): b.get("expected_prs", 60) for b in benchmarks}
        
        all_skill_freq = {}
        
        for s in self.students:
            prs = s.get("prs_score", 0)
            ny = self._normalize_year(s.get("year", ""))
            gh = s.get("github_analysis") or {}
            ra = s.get("resume_analysis") or {}
            pb = s.get("prs_breakdown") or {}
            cgpa = s.get("cgpa", 0.0)

            # Risk Dist By Year
            if ny not in self.risk_dist_by_year:
                self.risk_dist_by_year[ny] = {"total": 0, "prs_sum": 0, "red": 0, "yellow": 0, "green": 0}
            self.risk_dist_by_year[ny]["total"] += 1
            self.risk_dist_by_year[ny]["prs_sum"] += prs
            if prs < 40: self.risk_dist_by_year[ny]["red"] += 1
            elif prs <= 60: self.risk_dist_by_year[ny]["yellow"] += 1
            else: self.risk_dist_by_year[ny]["green"] += 1

            # Component Score grouping
            if ny not in self.comp_buckets:
                self.comp_buckets[ny] = {"github": [], "resume": [], "skills": [], "cgpa": [], "count": 0}
            self.comp_buckets[ny]["github"].append(pb.get("github_score_25", 0))
            self.comp_buckets[ny]["resume"].append(pb.get("resume_ats_score_20", 0))
            self.comp_buckets[ny]["skills"].append(pb.get("skills_score_15", 0))
            self.comp_buckets[ny]["cgpa"].append(cgpa)
            self.comp_buckets[ny]["count"] += 1

            # Skill Counter
            sk_list = ra.get("skills", []) if isinstance(ra, dict) else []
            for sk in sk_list:
                sk = sk.strip().title()
                all_skill_freq[sk] = all_skill_freq.get(sk, 0) + 1

        # Finalize Comp Buckets & Gap
        for ny, data in self.comp_buckets.items():
            cnt = data["count"]
            t_prs = self.risk_dist_by_year[ny]["prs_sum"]
            avg_prs = round(t_prs / cnt, 1) if cnt else 0
            tgt = bmap.get((self._normalize_branch(self.branch), ny), 60)
            
            gap_val = round(avg_prs - tgt, 1)
            self.gap_data.append({
                "year": ny, "count": cnt, "actual": avg_prs, "target": tgt, 
                "gap": gap_val, "status": "Above" if gap_val >= 0 else "Below"
            })

            data["github"] = round(sum(data["github"]) / cnt, 1) if cnt else 0
            data["resume"] = round(sum(data["resume"]) / cnt, 1) if cnt else 0
            data["skills"] = round(sum(data["skills"]) / cnt, 1) if cnt else 0
            data["cgpa"] = round(sum(data["cgpa"]) / cnt, 2) if cnt else 0

        self.gap_data.sort(key=lambda x: str(x["year"]))

        # Top Skills Extraction
        self.top_10_skills = sorted(all_skill_freq.items(), key=lambda x: x[1], reverse=True)[:15] # Grab Top 15 for table
        self.top_3_skills = [x[0] for x in self.top_10_skills[:3]]
        
        # Skill SMEs Calculation (Top 5 skills only)
        top_5_keys = [x[0] for x in self.top_10_skills[:5]]
        for sk_key in top_5_keys:
            sme_list = []
            for s in self.students:
                ra = s.get("resume_analysis") or {}
                sk_found = [sk.strip().title() for sk in (ra.get("skills", []) if isinstance(ra, dict) else [])]
                if sk_key in sk_found:
                    sme_list.append((s.get("full_name") or s.get("name", "—"), s.get("prs_score", 0)))
            sme_list.sort(key=lambda x: x[1], reverse=True)
            self.skill_smes[sk_key] = sme_list[:5]

        # Gap Drivers (Leaders & Laggards)
        self.gap_leaders = [(s.get("full_name") or s.get("name", "—"), s.get("prs_score", 0), s.get("email", "")) for s in self.students[:5]]
        all_bottom = sorted(self.students, key=lambda x: x.get("prs_score", 0))
        self.gap_laggards = [(s.get("full_name") or s.get("name", "—"), s.get("prs_score", 0), s.get("email", "")) for s in all_bottom[:5]]

        # SECOND PASS: Deficiency Rosters
        for s in self.students:
            ny = self._normalize_year(s.get("year", ""))
            gh = s.get("github_analysis") or {}
            ra = s.get("resume_analysis") or {}
            pb = s.get("prs_breakdown") or {}
            cgpa = s.get("cgpa", 0.0)

            name = s.get("full_name") or s.get("name", "—")
            email = s.get("email", "—")
            branch_yr = f"{ny}"

            user_skills = [sk.strip().title() for sk in (ra.get("skills", []) if isinstance(ra, dict) else [])]
            missing_sk = [sk for sk in self.top_3_skills if sk not in user_skills]
            if missing_sk:
                self.roster_missing_skills.append((name, email, branch_yr, ", ".join(missing_sk)))

            missing_sec = ra.get("missing_sections", []) if isinstance(ra, dict) else []
            if missing_sec:
                self.roster_missing_sections.append((name, email, branch_yr, ", ".join(missing_sec[:3])))

            if gh.get("total_repos", 0) == 0 and pb.get("github_score_25", 0) == 0:
                self.roster_inactive_github.append((name, email, branch_yr, "0 Commits / Null"))

            if 0 < cgpa < 6.0:
                self.roster_low_cgpa.append((name, email, branch_yr, f"{cgpa}"))

            # Technical Elites (High GH + High Resume)
            gh_s = pb.get("github_score_25", 0)
            res_s = pb.get("resume_ats_score_20", 0)
            if gh_s >= 15 and res_s >= 14: # High performance in these specifics
                self.technical_elites.append((name, email, branch_yr, f"GH:{gh_s} | ATS:{res_s}"))

        self.roster_missing_skills.sort(key=lambda x: x[0][:20])
        self.roster_missing_sections.sort(key=lambda x: x[0][:20])
        self.roster_inactive_github.sort(key=lambda x: x[0][:20])
        self.roster_low_cgpa.sort(key=lambda x: x[0][:20])

        self.state = ReportState.ANALYZE_WITH_GROQ

    async def _state_analyze_with_groq(self):
        sk_payload = [sk[0] for sk in self.top_10_skills]
        self.ai_summary_data = await generate_dynamic_report_summary_with_groq(
            self.branch_label, 
            self.stats, 
            self.gap_data, 
            {"components": self.comp_buckets, "top_skills": sk_payload}
        )
        self.state = ReportState.RENDER_PDF

    async def _state_render_pdf(self):
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=A4,
            leftMargin=MARGIN, rightMargin=MARGIN,
            topMargin=0 * cm, bottomMargin=1 * cm,
            title=f"CampusIQ – {self.branch} Raw Metric Report",
        )
        st = self._styles()
        story = []
        generated_at = datetime.now().strftime("%d %B %Y, %I:%M %p")

        # ── HEADER ───────────────────────────────────────────────
        header_data = [[
            Paragraph("Placement Readiness<br/>Executive Matrix", st["cover_title"]),
            Paragraph("<b>CampusIQ</b>", st["logo_style"])
        ]]
        header_table = Table(header_data, colWidths=[12.2*cm, 6.0*cm])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), PRIMARY),
            ('ALIGN', (1,0), (1,0), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 30),
            ('BOTTOMPADDING', (0,0), (-1,-1), 30),
            ('LEFTPADDING', (0,0), (0,0), 10),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.4*cm))

        story.append(Paragraph(f"CampusIQ — {self.branch_label} Branch Report | Generated: {generated_at} | Confidential", st["sub_heading"]))
        story.append(Spacer(1, 0.4*cm))

        # 1. Executive Summary
        story.append(Paragraph("1. Executive Summary", st["table_title"]))
        ex_data = [
            [Paragraph("Total Students", st["table_header"]), Paragraph("Avg PRS Score", st["table_header"]), 
             Paragraph("At Risk", st["table_header"]), Paragraph("Moderate", st["table_header"]), Paragraph("Strong", st["table_header"])],
            [Paragraph(str(self.stats["total"]), st["table_cell_bold"]), Paragraph(str(self.stats["avg_prs"]), st["table_cell_bold"]),
             Paragraph(str(self.stats["red"]), st["table_cell"]), Paragraph(str(self.stats["yellow"]), st["table_cell"]), 
             Paragraph(str(self.stats["green"]), st["table_cell"])]
        ]
        t = Table(ex_data, colWidths=[3.6*cm]*5, repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # 2. PRS Risk Distribution by Year
        story.append(Paragraph("2. PRS Risk Distribution by Year", st["table_title"]))
        rdy_data = [[Paragraph(h, st["table_header"]) for h in ["Year", "Total", "Avg PRS", "At Risk", "Moderate", "Strong"]]]
        for yr in sorted(self.risk_dist_by_year.keys()):
            d = self.risk_dist_by_year[yr]
            rdy_data.append([
                Paragraph(yr, st["table_cell_bold"]),
                Paragraph(str(d["total"]), st["table_cell"]),
                Paragraph(str(round(d["prs_sum"]/d["total"], 1)) if d["total"] else "0", st["table_cell"]),
                Paragraph(str(d["red"]), st["table_cell"]),
                Paragraph(str(d["yellow"]), st["table_cell"]),
                Paragraph(str(d["green"]), st["table_cell"]),
            ])
        t = Table(rdy_data, colWidths=[3.0*cm]*6, repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # 3. Average Component Scores by Year
        story.append(Paragraph("3. Average Component Scores by Year", st["table_title"]))
        comp_data = [[Paragraph(h, st["table_header"]) for h in ["Year", "GitHub Score", "Resume/ATS", "Skills Score", "Avg CGPA"]]]
        for yr in sorted(self.comp_buckets.keys()):
            d = self.comp_buckets[yr]
            comp_data.append([
                Paragraph(yr, st["table_cell_bold"]), Paragraph(str(d["github"]), st["table_cell"]),
                Paragraph(str(d["resume"]), st["table_cell"]), Paragraph(str(d["skills"]), st["table_cell"]), 
                Paragraph(str(d["cgpa"]), st["table_cell"])
            ])
        t = Table(comp_data, colWidths=[3.6*cm]*5, repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # 4. Top Skills in Branch
        story.append(Paragraph("4. Top Skills in Branch", st["table_title"]))
        skill_data = [[Paragraph("Skill", st["table_header"]), Paragraph("# Students", st["table_header"])]]
        for sk, count in self.top_10_skills:
            skill_data.append([Paragraph(sk, st["table_cell_bold"]), Paragraph(str(count), st["table_cell"])])
        t = Table(skill_data, colWidths=[13*cm, 5*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # 5. Gap Analysis vs Benchmark
        story.append(Paragraph("5. Gap Analysis vs Benchmark", st["table_title"]))
        gap_table = [[Paragraph(h, st["table_header"]) for h in ["Year", "Students", "Actual PRS", "Target PRS", "Gap", "Status"]]]
        for g in self.gap_data:
            gap_str = ("+" if g['gap'] >= 0 else "") + str(g['gap'])
            gap_table.append([
                Paragraph(g["year"], st["table_cell_bold"]), Paragraph(str(g["count"]), st["table_cell"]),
                Paragraph(str(g["actual"]), st["table_cell"]), Paragraph(str(g["target"]), st["table_cell"]),
                Paragraph(gap_str, st["table_cell"]), Paragraph(g["status"], st["table_cell"])
            ])
        t = Table(gap_table, colWidths=[3.0*cm]*6, repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        
        story.append(PageBreak())

        # 6. At-Risk Students
        story.append(Paragraph("6. At-Risk Students (PRS < 40)", st["table_title"]))
        at_risk = [s for s in self.students if s.get("prs_score", 0) < 40]
        # Sort by PRS ascending explicitly!
        at_risk.sort(key=lambda x: x.get("prs_score", 0))
        risk_t = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "Year", "CGPA", "PRS"]]]
        for s in at_risk:
            risk_t.append([
                Paragraph(s.get("full_name") or s.get("name", "—"), st["table_cell_bold"]),
                Paragraph(s.get("email", "—"), st["table_cell"]),
                Paragraph(self._normalize_year(s.get("year", "")), st["table_cell"]),
                Paragraph(str(s.get("cgpa", 0)), st["table_cell"]),
                Paragraph(str(s.get("prs_score", 0)), st["table_cell"])
            ])
        t = Table(risk_t, colWidths=[4*cm, 6*cm, 3*cm, 2.5*cm, 2.5*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # 7. Moderate-Risk Students
        story.append(Paragraph("7. Moderate-Risk Students (PRS 40–60)", st["table_title"]))
        mod_risk = [s for s in self.students if 40 <= s.get("prs_score", 0) <= 60]
        # Sort ascending for moderate as well
        mod_risk.sort(key=lambda x: x.get("prs_score", 0))
        mod_t = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "Year", "CGPA", "PRS"]]]
        for s in mod_risk:
            mod_t.append([
                Paragraph(s.get("full_name") or s.get("name", "—"), st["table_cell_bold"]),
                Paragraph(s.get("email", "—"), st["table_cell"]),
                Paragraph(self._normalize_year(s.get("year", "")), st["table_cell"]),
                Paragraph(str(s.get("cgpa", 0)), st["table_cell"]),
                Paragraph(str(s.get("prs_score", 0)), st["table_cell"])
            ])
        t = Table(mod_t, colWidths=[4*cm, 6*cm, 3*cm, 2.5*cm, 2.5*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        
        story.append(PageBreak())

        # 8. Top Performers
        story.append(Paragraph("8. Top Performers (PRS > 60)", st["table_title"]))
        top = [s for s in self.students if s.get("prs_score", 0) > 60]
        # Sort DESCENDING for top
        top.sort(key=lambda x: x.get("prs_score", 0), reverse=True)
        top_t = [[Paragraph(h, st["table_header"]) for h in ["Rank", "Name", "Email", "Year", "CGPA", "PRS"]]]
        for i, s in enumerate(top):
            top_t.append([
                Paragraph(str(i+1), st["table_cell_bold"]),
                Paragraph(s.get("full_name") or s.get("name", "—"), st["table_cell"]),
                Paragraph(s.get("email", "—"), st["table_cell"]),
                Paragraph(self._normalize_year(s.get("year", "")), st["table_cell"]),
                Paragraph(str(s.get("cgpa", 0)), st["table_cell"]),
                Paragraph(str(s.get("prs_score", 0)), st["table_cell"])
            ])
        t = Table(top_t, colWidths=[1.5*cm, 3.5*cm, 6*cm, 2.5*cm, 2.5*cm, 2.0*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        
        story.append(PageBreak())

        # 9. Detailed Deficiency Rosters
        story.append(Paragraph("9. Student Deficiency Rosters (Missing Crucial Factors)", st["table_title"]))
        
        story += self._roster_block("A. Missing Top 3 Generic Skills", self.roster_missing_skills, st)
        story += self._roster_block("B. Missing Essential ATS Sections", self.roster_missing_sections, st)
        story += self._roster_block("C. Completely Inactive on GitHub", self.roster_inactive_github, st)
        story += self._roster_block("D. Academic Flag (CGPA < 6.0)", self.roster_low_cgpa, st)

        story.append(PageBreak())

        # 10. Granular Student Alignment (Industry SMEs & Gap Leaders)
        story.append(Paragraph("10. Granular Student Alignment (Industry SMEs & Gap Leaders)", st["table_title"]))
        
        # SME List
        story.append(Paragraph("<b>A. Subject Matter Experts (Top 5 Students per Top Skill)</b>", st["sub_heading"]))
        sme_data = [[Paragraph("Target Skill", st["table_header"]), Paragraph("Top SME Names & PRS Scores", st["table_header"])]]
        for sk, smes in self.skill_smes.items():
            formatted_smes = ", ".join([f"{n} ({p})" for n, p in smes])
            sme_data.append([Paragraph(sk, st["table_cell_bold"]), Paragraph(formatted_smes, st["table_cell"])])
        t = Table(sme_data, colWidths=[4*cm, 14*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.4*cm))

        # Gap Leaders & Laggards
        story.append(Paragraph("<b>B. Benchmark Gap Drivers (Top Contributors vs Drag Factors)</b>", st["sub_heading"]))
        story.append(Paragraph("<i>Top 5 Leaders (Dragging Average UP):</i>", st["body"]))
        lead_t = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "PRS"]]]
        for n, p, e in self.gap_leaders:
            lead_t.append([Paragraph(n, st["table_cell_bold"]), Paragraph(e, st["table_cell"]), Paragraph(str(p), st["table_cell"])])
        t = Table(lead_t, colWidths=[6*cm, 9*cm, 3*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.3*cm))

        story.append(Paragraph("<i>Top 5 Laggards (Immediate Boost Candidates):</i>", st["body"]))
        lag_t = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "PRS"]]]
        for n, p, e in self.gap_laggards:
            lag_t.append([Paragraph(n, st["table_cell_bold"]), Paragraph(e, st["table_cell"]), Paragraph(str(p), st["table_cell"])])
        t = Table(lag_t, colWidths=[6*cm, 9*cm, 3*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.4*cm))

        # Technical Elites
        story.append(Paragraph("<b>C. Branch Technical Elites (High GitHub + Resume Score)</b>", st["sub_heading"]))
        elite_t = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "Cohort", "Tech Strength Index"]]]
        for row in self.technical_elites:
            elite_t.append([Paragraph(row[0], st["table_cell_bold"]), Paragraph(row[1], st["table_cell"]), Paragraph(row[2], st["table_cell"]), Paragraph(row[3], st["table_cell"])])
        t = Table(elite_t, colWidths=[4.2*cm, 6.4*cm, 2.5*cm, 4.9*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)

        story.append(PageBreak())

        # 11. AI-Driven Strategic Assessment
        story.append(Paragraph("10. AI-Driven Strategic Assessment & Training", st["table_title"]))
        
        # Executive Summary
        ai_summary = self.ai_summary_data.get("executive_summary", "")
        if ai_summary:
            story.append(Paragraph("<b>Executive Strategy:</b>", st["sub_heading"]))
            story.append(Paragraph(ai_summary, st["body"]))
            story.append(Spacer(1, 0.4*cm))

        # Recommended Roles
        roles = self.ai_summary_data.get("recommended_roles", [])
        if roles:
            story.append(Paragraph("<b>Primary Industry Targets:</b> " + ", ".join(roles), st["body"]))
            story.append(Spacer(1, 0.4*cm))

        # ── Targeted Interventions (Workshop Schedules) ───────────────────
        story.append(Paragraph("<b>Highly Recommended Training Interventions:</b>", st["sub_heading"]))
        interventions = self.ai_summary_data.get("targeted_interventions", [])
        if interventions:
            int_t = [[Paragraph(h, st["table_header"]) for h in ["Year", "Training Programme", "Rationale", "Expected Impact"]]]
            for ac in interventions:
                int_t.append([
                    Paragraph(ac.get("year", ""), st["table_cell_bold"]),
                    Paragraph(ac.get("training_programme", ""), st["table_cell"]),
                    Paragraph(ac.get("rationale", ""), st["table_cell"]),
                    Paragraph(ac.get("expected_impact", ""), st["table_cell"])
                ])
            t = Table(int_t, colWidths=[2.5*cm, 4.0*cm, 8.5*cm, 3.0*cm], repeatRows=1)
            t.setStyle(self._table_style())
            story.append(t)
            story.append(Spacer(1, 0.5*cm))
        else:
            story.append(Paragraph("No structured interventions generated.", st["body"]))

        # Strengths & Weaknesses
        strengths = self.ai_summary_data.get("primary_strengths", [])
        weaknesses = self.ai_summary_data.get("primary_weaknesses", [])
        if strengths or weaknesses:
            story.append(Paragraph("<b>Key Drivers & Systemic Weaknesses:</b>", st["sub_heading"]))
            sw_data = [[Paragraph("Primary Drivers (Strengths)", st["table_header"]), Paragraph("Systemic Weaknesses", st["table_header"])]]
            max_len = max(len(strengths), len(weaknesses))
            strengths += [""] * (max_len - len(strengths))
            weaknesses += [""] * (max_len - len(weaknesses))
            for s, w in zip(strengths, weaknesses):
                sw_data.append([
                    Paragraph(f"<bullet>&bull;</bullet> {s}" if s else "", st["table_cell"]),
                    Paragraph(f"<bullet>&bull;</bullet> {w}" if w else "", st["table_cell"])
                ])
            t = Table(sw_data, colWidths=[8.7*cm, 8.7*cm], repeatRows=1)
            t.setStyle(self._table_style())
            story.append(t)
            story.append(Spacer(1, 0.5*cm))

        # Market Readiness Text
        market_analysis = self.ai_summary_data.get("market_readiness_analysis", "")
        if market_analysis:
            story.append(Paragraph("<b>Industry Alignment & Market Readiness:</b>", st["sub_heading"]))
            story.append(Paragraph(market_analysis, st["body"]))
            story.append(Spacer(1, 0.5*cm))

        # Role Suitability Matrix
        r_matrix = self.ai_summary_data.get("role_suitability_matrix", [])
        if r_matrix:
            story.append(Paragraph("<b>Role Suitability Matrix (Branch-Wide Prediction):</b>", st["sub_heading"]))
            rm_data = [[Paragraph(h, st["table_header"]) for h in ["Predicted Role", "Suitability", "Key Requirement", "Critical Gap"]]]
            for rm in r_matrix:
                rm_data.append([
                    Paragraph(rm.get("role", ""), st["table_cell_bold"]),
                    Paragraph(str(rm.get("suitability_score", "")) + "%", st["table_cell"]),
                    Paragraph(rm.get("key_requirement", ""), st["table_cell"]),
                    Paragraph(rm.get("gap_found", ""), st["table_cell"])
                ])
            t = Table(rm_data, colWidths=[4.0*cm, 2.5*cm, 5.5*cm, 5.4*cm], repeatRows=1)
            t.setStyle(self._table_style())
            story.append(t)
            story.append(Spacer(1, 0.5*cm))

        # TPO Strategic Roadmap
        roadmap = self.ai_summary_data.get("immediate_tpo_roadmap", [])
        if roadmap:
            story.append(Paragraph("<b>Strategic TPO Action Roadmap (3-Month Vision):</b>", st["sub_heading"]))
            rd_data = [[Paragraph(h, st["table_header"]) for h in ["Timeline", "Actionable Intervention", "Final Goal"]]]
            for rd in roadmap:
                rd_data.append([
                    Paragraph(rd.get("month", ""), st["table_cell_bold"]),
                    Paragraph(rd.get("action", ""), st["table_cell"]),
                    Paragraph(rd.get("goal", ""), st["table_cell"])
                ])
            t = Table(rd_data, colWidths=[3.0*cm, 8.4*cm, 6.0*cm], repeatRows=1)
            t.setStyle(self._table_style())
            story.append(t)

        doc.build(story)
        buf.seek(0)
        self.pdf_buffer = buf
        self.state = ReportState.COMPLETE

    # ════════════════ Helper Methods ════════════════
    def _roster_block(self, sub_title, data_list, st):
        """Helper to dynamically generate multi-page ReportLab Tables safely."""
        story = [Paragraph(sub_title, st["sub_heading"])]
        if not data_list:
            story.append(Paragraph("All students pass this metric cleanly. 🎉", st["body"]))
            story.append(Spacer(1, 0.4*cm))
            return story

        table_data = [[Paragraph(h, st["table_header"]) for h in ["Name", "Email", "Year", "Missing Deficit"]]]
        for row in data_list:
            table_data.append([
                Paragraph(row[0], st["table_cell_bold"]), Paragraph(row[1], st["table_cell"]),
                Paragraph(row[2], st["table_cell"]), Paragraph(row[3], st["table_cell"])
            ])
        t = Table(table_data, colWidths=[4.2*cm, 6.4*cm, 2.5*cm, 4.9*cm], repeatRows=1)
        t.setStyle(self._table_style())
        story.append(t)
        story.append(Spacer(1, 0.4*cm))
        return story

    def _styles(self):
        base = getSampleStyleSheet()
        return {
            "cover_title": ParagraphStyle(
                "cover_title", fontName="Helvetica-Bold", fontSize=26, textColor=WHITE, leading=30
            ),
            "logo_style": ParagraphStyle(
                "logo_style", fontName="Helvetica-Bold", fontSize=28, textColor=WHITE, alignment=TA_RIGHT
            ),
            "meta_left": ParagraphStyle("meta_left", fontName="Helvetica-Bold", fontSize=11, textColor=PRIMARY),
            "meta_right": ParagraphStyle("meta_right", fontName="Helvetica", fontSize=10, textColor=PRIMARY, alignment=TA_RIGHT),
            "table_title": ParagraphStyle("table_title", fontName="Helvetica-Bold", fontSize=13, textColor=PRIMARY, spaceAfter=8, spaceBefore=10),
            "sub_heading": ParagraphStyle("sub_heading", fontName="Helvetica-Bold", fontSize=11, textColor=PRIMARY, spaceAfter=6, spaceBefore=4),
            "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9, textColor=BODY_TEXT, spaceAfter=3, leading=14),
            "table_cell": ParagraphStyle("table_cell", fontName="Helvetica", fontSize=9, textColor=BODY_TEXT, leading=12),
            "table_cell_bold": ParagraphStyle("table_cell_bold", fontName="Helvetica-Bold", fontSize=9, textColor=PRIMARY, leading=12),
            "table_header": ParagraphStyle("table_header", fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, leading=12),
            "footer": ParagraphStyle("footer", fontName="Helvetica", fontSize=8, textColor=BODY_TEXT, alignment=TA_CENTER),
        }

    def _table_style(self):
        return TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BLUE),
            ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE_PINK]),
            ("GRID",       (0, 0), (-1, -1), 0.5, BORDER),
            ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])

    def _normalize_year(self, y):
        y = str(y).strip().lower()
        if y in ["1", "i", "fy", "fe", "first year", "1st year"]: return "1st Year"
        if y in ["2", "ii", "sy", "se", "second year", "2nd year"]: return "2nd Year"
        if y in ["3", "iii", "ty", "te", "third year", "3rd year"]: return "3rd Year"
        if y in ["4", "iv", "final", "be", "b.tech", "final year", "4th year"]: return "4th Year"
        return y.title()

    def _normalize_branch(self, b):
        b = str(b).strip().upper()
        if b in ["CS", "COMPUTER SCIENCE", "CSE"]: return "CSE"
        if b in ["IT", "INFORMATION TECHNOLOGY"]: return "IT"
        return b
