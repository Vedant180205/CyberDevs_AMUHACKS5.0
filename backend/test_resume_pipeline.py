
import requests
import os

BASE_URL = "http://localhost:8000/api"
IMAGE_PATH = r"c:\Users\vedant\OneDrive\Desktop\campusIQ\CyberDevs_AMUHACKS5.0\frontend\public\college-student-hero.jpg"

def run_test():
    print("🚀 Starting Resume Analysis Verification Pipeline...")
    
    # 1. Signup New User
    signup_url = f"{BASE_URL}/auth/signup"
    user_data = {
        "name": "Resume Tester v4",
        "email": "resume_tester_v4@example.com",
        "password": "password123",
        "year": "Final Year",
        "branch": "CSE",
        "cgpa": 8.8,
        "skills": ["Python", "Machine Learning"]
    }
    
    print("\n1️⃣ Registering new user...")
    try:
        resp = requests.post(signup_url, json=user_data)
        if resp.status_code == 400 and "already registered" in resp.text:
            print("User already exists, logging in...")
            login_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
            if login_resp.status_code != 200:
                 print(f"Login failed: {login_resp.status_code} - {login_resp.text}")
                 return
            token = login_resp.json()["access_token"]
        elif resp.status_code == 200:
            token = resp.json()["access_token"]
            print("Signup successful!")
        else:
            print(f"Signup failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"Connection error: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Resume Image
    print("\n2️⃣ Uploading Resume Image for Analysis...")
    resume_url = f"{BASE_URL}/student/analyze/resume"
    
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Error: Test image not found at {IMAGE_PATH}")
        return

    files = {'file': ('resume.jpg', open(IMAGE_PATH, 'rb'), 'image/jpeg')}
    
    try:
        upload_resp = requests.post(resume_url, headers=headers, files=files)
        if upload_resp.status_code == 200:
            print("✅ Resume uploaded & analyzed successfully!")
            data = upload_resp.json()
            print(f"   ATS Score: {data.get('ats_score')}")
            import json
            print(f"   Full Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Upload failed: {upload_resp.status_code} - {upload_resp.text}")
            return
    except Exception as e:
        print(f"❌ Upload exception: {e}")
        return

    # 3. Verify Persistence (GET /me)
    print("\n3️⃣ Verifying Data Persistence (GET /me)...")
    me_url = f"{BASE_URL}/student/me"
    me_resp = requests.get(me_url, headers=headers)
    
    if me_resp.status_code == 200:
        me_data = me_resp.json()
        saved_ats = me_data.get("ats_score")
        saved_analysis = me_data.get("resume_analysis")
        
        if saved_ats is not None and saved_analysis:
            print(f"✅ Persistence Confirmed! ATS Score in DB: {saved_ats}")
        else:
            print("❌ Persistence Failed: data missing in profile.")
    else:
        print(f"❌ GET /me failed: {me_resp.status_code}")

    # 4. Calculate PRS (Check integration)
    print("\n4️⃣ Verifying PRS Calculation Integration...")
    prs_url = f"{BASE_URL}/student/calculate-prs"
    prs_resp = requests.post(prs_url, headers=headers)
    
    if prs_resp.status_code == 200:
        prs_data = prs_resp.json()
        breakdown = prs_data.get("prs_breakdown", {})
        ats_component = breakdown.get("resume_ats_score_20")
        
        if ats_component is not None:
            print(f"✅ PRS Integration Confirmed!")
            print(f"   Total PRS: {prs_data.get('prs_score')}")
            print(f"   ATS Component Score (out of 20): {ats_component}")
        else:
            print("❌ PRS Verification Failed: 'resume_ats_score_20' missing in breakdown.")
            print(f"   Breakdown: {breakdown}")
    else:
        print(f"❌ PRS Calculation failed: {prs_resp.status_code}")

    print("\n🎉 Verification Pipeline Completed.")

if __name__ == "__main__":
    run_test()
