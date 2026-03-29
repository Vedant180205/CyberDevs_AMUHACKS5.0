import asyncio
import json
from app.database import students_collection

async def main():
    students = await students_collection.find({}, {"password": 0}).to_list(10)
    for s in students:
        ra = s.get("resume_analysis", {})
        ga = s.get("github_analysis", {})
        print(f"--- Student {s.get('name', 'Unknown')} ---")
        if isinstance(ra, dict):
            print("RA KEYS:", list(ra.keys()))
            if "ats_score" in ra: print("ATS Score obj:", ra.get("ats_score"))
            if "missing_sections" in ra: print("Missing sections:", ra.get("missing_sections"))
        if isinstance(ga, dict):
            print("GA KEYS:", list(ga.keys()))

if __name__ == "__main__":
    asyncio.run(main())
