import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import benchmarks_collection, db
from motor.motor_asyncio import AsyncIOMotorClient

async def seed_benchmarks():
    print("--- Seeding Benchmarks ---")
    
    # Clear existing
    await benchmarks_collection.delete_many({})
    print("Existing benchmarks cleared.")

    data = [
        # CSE
        {"branch": "CSE", "year": "1st Year", "expected_prs": 35, "expected_skills": ["Python", "HTML"], "min_projects": 1, "min_github_score": 10},
        {"branch": "CSE", "year": "2nd Year", "expected_prs": 55, "expected_skills": ["Java", "DSA", "SQL"], "min_projects": 2, "min_github_score": 30},
        {"branch": "CSE", "year": "3rd Year", "expected_prs": 70, "expected_skills": ["React", "Node.js", "MongoDB"], "min_projects": 3, "min_github_score": 50},
        {"branch": "CSE", "year": "4th Year", "expected_prs": 80, "expected_skills": ["System Design", "Cloud", "DevOps"], "min_projects": 4, "min_github_score": 70},
        
        # IT (Slightly different)
        {"branch": "IT", "year": "1st Year", "expected_prs": 35, "expected_skills": ["Python", "Web Basics"], "min_projects": 1, "min_github_score": 10},
        {"branch": "IT", "year": "2nd Year", "expected_prs": 55, "expected_skills": ["Java", "DBMS", "Networking"], "min_projects": 2, "min_github_score": 30},
        {"branch": "IT", "year": "3rd Year", "expected_prs": 70, "expected_skills": ["Full Stack", "Cloud"], "min_projects": 3, "min_github_score": 50},
        {"branch": "IT", "year": "4th Year", "expected_prs": 80, "expected_skills": ["Microservices", "Security"], "min_projects": 4, "min_github_score": 70},

        # ECS (Electronics)
        {"branch": "ECS", "year": "1st Year", "expected_prs": 30, "expected_skills": ["C", "Basic Electronics"], "min_projects": 1, "min_github_score": 5},
        {"branch": "ECS", "year": "2nd Year", "expected_prs": 50, "expected_skills": ["C++", "Microcontrollers"], "min_projects": 2, "min_github_score": 20},
        {"branch": "ECS", "year": "3rd Year", "expected_prs": 65, "expected_skills": ["Embedded C", "IoT", "PCB Design"], "min_projects": 3, "min_github_score": 40},
        {"branch": "ECS", "year": "4th Year", "expected_prs": 75, "expected_skills": ["RTOS", "VLSI", "System Verilog"], "min_projects": 4, "min_github_score": 60},
    ]

    await benchmarks_collection.insert_many(data)
    print(f"✅ Inserted {len(data)} benchmarks with standardized Year/Branch format.")

if __name__ == "__main__":
    try:
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(seed_benchmarks())
    except Exception as e:
        print(f"Error: {e}")
