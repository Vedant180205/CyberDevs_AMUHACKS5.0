import asyncio
import json
from app.database import students_collection

async def main():
    students = await students_collection.find({}, {"password": 0}).to_list(100)
    
    if students:
        s = students[0]
        print("KEYS:", list(s.keys()))
        print("---- Resume Analysis ----")
        ra = s.get("resume_analysis")
        print(json.dumps(ra, default=str, indent=2) if isinstance(ra, dict) else ra)
        print("---- Github Analysis ----")
        ga = s.get("github_analysis")
        print(json.dumps(ga, default=str, indent=2) if isinstance(ga, dict) else ga)
        print("---- PRS Breakdown ----")
        pb = s.get("prs_breakdown")
        print(json.dumps(pb, default=str, indent=2) if isinstance(pb, dict) else pb)

if __name__ == "__main__":
    asyncio.run(main())
