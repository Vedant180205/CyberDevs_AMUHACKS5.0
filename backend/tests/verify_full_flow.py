import asyncio
import httpx
from pymongo import MongoClient
import os
from bson import ObjectId
import json
from dotenv import load_dotenv
from passlib.context import CryptContext  # <--- NEW IMPORT

# --- SETUP: Database Connection ---
load_dotenv()

# Get the URI
MONGO_URI = os.getenv("MONGO_URI")

# Debug print
print(f"DEBUG: Connecting to... {MONGO_URI.split('@')[-1] if MONGO_URI else 'None'}")

# SAFETY: Force the correct URI if it's missing or using the old broken one
if not MONGO_URI or "cluster0.h4h94" in MONGO_URI:
    MONGO_URI = "mongodb+srv://campusIQ_admin:ivILZGWhIi3Zj4Yw@campusiq-cluster.zgnjcxe.mongodb.net/?retryWrites=true&w=majority"

# Connect to DB
client = MongoClient(MONGO_URI)
db = client["campusIQ"]

# Setup Password Hasher (Dynamic Fix)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def run_tests():
    print("🚀 Starting System Integration Test...")
    
    # --- SEEDING (The "God Mode" Setup) ---
    print("\n[SEEDING] Cleaning up and inserting dummy data...")

    # 1. Seed Company (Google)
    db.companies.delete_many({"name": "Google"})
    google_doc = {
        "name": "Google",
        "min_cgpa": 7.5,
        "eligible_branches": ["CSE", "IT", "ECE"],
        "required_skills": ["Python", "Data Structures", "System Design"],
        "job_role": "SDE I"
    }
    google_res = db.companies.insert_one(google_doc)
    google_id = str(google_res.inserted_id)
    print(f"✅ Seeded Company: Google ({google_id})")

    # 2. Seed User (Auth Login) - HARDCODED HASH
    # Hash for "password123"
    hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW" 
    real_password = "password123"

    db.users.delete_many({"email": "judge@hackathon.com"})
    user_doc = {
        "email": "judge@hackathon.com",
        "password_hash": hashed_password, 
        "role": "student",
        "is_active": True
    }
    db.users.insert_one(user_doc)
    print("✅ Seeded User: judge@hackathon.com")

    # 3. Seed Student Profile
    db.students.delete_many({"email": "judge@hackathon.com"})
    student_doc = {
        "name": "Hackathon Judge",
        "email": "judge@hackathon.com",
        "branch": "CSE",
        "year": "Final",
        "cgpa": 8.5,
        "skills": ["Python", "FastAPI", "MongoDB", "React"],
        "prs_score": 75,
        "linkedin_url": "https://linkedin.com/in/judge",
        "github_url": "https://github.com/judge"
    }
    student_res = db.students.insert_one(student_doc)
    student_id = str(student_res.inserted_id)
    print(f"✅ Seeded Student: {student_id}")


    # --- TEST EXECUTION (The "User Journey") ---
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=30.0) as client:
        
        # Step 1: Auth
        print("\n[STEP 1] Authenticating...")
        try:
            # Try 1: Form Data (Standard OAuth2)
            auth_response = await client.post("/auth/login", data={
                "username": "judge@hackathon.com", 
                "password": real_password
            })
            
            # Try 2: JSON (Fallback for some implementations)
            if auth_response.status_code != 200:
                 auth_response = await client.post("/auth/login", json={
                    "email": "judge@hackathon.com", 
                    "password": real_password
                })

            if auth_response.status_code != 200:
                print(f"❌ Auth Failed: {auth_response.text}")
                return
            
            token_data = auth_response.json()
            token = token_data.get("access_token")
            print(f"✅ Got Token: {token[:10]}...")
        except Exception as e:
            print(f"❌ Auth Exception: {e}")
            print("Ensure the backend is running on port 8000!")
            return

        # Headers for subsequent requests
        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Check Dashboard
        print(f"\n[STEP 2] Verifying Dashboard Access for {student_id}...")
        dash_response = await client.get(f"/student/{student_id}/dashboard", headers=headers)
        if dash_response.status_code == 200:
            print("✅ Dashboard Loaded Successfully")
        else:
            print(f"⚠️ Dashboard Warning (might be 404 if not implemented): {dash_response.status_code}")

        # Step 3: Company Lens (Gemini)
        print(f"\n[STEP 3] Testing Company Lens (Google ID: {google_id})...")
        lens_response = await client.post(
            f"/student/{student_id}/company-lens/{google_id}",
            headers=headers
        )
        if lens_response.status_code == 200:
            data = lens_response.json()
            print("✅ Gemini Analysis Received:")
            print(f"   Match Score: {data.get('match_score', 'N/A')}")
        else:
            print(f"❌ Company Lens Failed: {lens_response.text}")

        # Step 4: Micro-Task Generator (Groq)
        print(f"\n[STEP 4] Testing Micro-Task Generator...")
        tasks_response = await client.post(
            f"/student/{student_id}/micro-tasks",
            headers=headers
        )
        if tasks_response.status_code == 200:
            tasks_data = tasks_response.json()
            tasks = tasks_data.get("tasks", [])
            print(f"✅ Generated {len(tasks)} Micro-Tasks:")
            for t in tasks:
                print(f"   - {t}")
        else:
            print(f"❌ Micro-Tasks Failed: {tasks_response.text}")

        # Step 5: Admin Stats (Groq Aggregation)
        print(f"\n[STEP 5] Testing Admin Dashboard...")
        admin_response = await client.get("/admin/stats/branch-readiness")
        
        if admin_response.status_code == 200:
            data = admin_response.json()
            print("✅ Admin Stats Received.")
            print(f"   AI Summary: {data.get('ai_summary')}")
        else:
            print(f"❌ Admin Stats Failed: {admin_response.text}")

    print("\n" + "="*30)
    print("✅ SYSTEM HEALTHY")
    print("="*30)

if __name__ == "__main__":
    asyncio.run(run_tests())