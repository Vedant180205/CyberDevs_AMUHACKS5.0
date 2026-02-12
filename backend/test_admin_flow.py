
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def run_admin_test():
    print("🚀 Starting Admin Dashboard Verification Pipeline...")

    # 1. Login as Admin
    print("\n1️⃣ Logging in as Admin...")
    login_payload = {
        "email": "admin@campusiq.com",
        "password": "admin123"
    }
    
    try:
        login_resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        if login_resp.status_code == 200:
            token = login_resp.json().get("access_token")
            role = login_resp.json().get("role")
            print(f"✅ Login Successful. Role: {role}")
            
            if role != "admin":
                 print(f"❌ Role mismatch! Expected 'admin', got '{role}'")
                 return
        else:
            print(f"❌ Login Failed: {login_resp.status_code} - {login_resp.text}")
            return
    except Exception as e:
         print(f"❌ Connection Error: {e}")
         return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Skills Analytics
    print("\n2️⃣ Testing Skills Analytics (GET /admin/skills-analytics)...")
    try:
        skills_resp = requests.get(f"{BASE_URL}/admin/skills-analytics", headers=headers)
        if skills_resp.status_code == 200:
            data = skills_resp.json()
            print(f"✅ Skills Analytics Retrieved. Top Skills Count: {len(data.get('top_skills', []))}")
            # print(json.dumps(data, indent=2))
        else:
             print(f"❌ Skills Analytics Failed: {skills_resp.status_code} - {skills_resp.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 3. Test Dashboard Summary
    print("\n3️⃣ Testing Dashboard Summary (GET /admin/dashboard/summary)...")
    try:
        summary_resp = requests.get(f"{BASE_URL}/admin/dashboard/summary", headers=headers)
        if summary_resp.status_code == 200:
            data = summary_resp.json()
            print(f"✅ Summary Retrieved. Total Students: {data.get('total_students')}")
        else:
             print(f"❌ Summary Failed: {summary_resp.status_code} - {summary_resp.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 4. Test AI Recommendations
    print("\n4️⃣ Testing AI Recommendations (POST /admin/ai-recommendations)...")
    print("   (This calls Groq API, might take a few seconds...)")
    try:
        ai_resp = requests.post(f"{BASE_URL}/admin/ai-recommendations", headers=headers)
        if ai_resp.status_code == 200:
            data = ai_resp.json()
            
            if "error" in data:
                 print(f"⚠️ API Returned Error: {data['error']}")
            else:
                print(f"✅ AI Recommendations Generated!")
                print(f"   Summary: {data.get('analysis_summary')[:100]}...")
                print(f"   Recommendations Count: {len(data.get('recommendations', []))}")
        else:
             print(f"❌ AI Recommendations Failed: {ai_resp.status_code} - {ai_resp.text}")
    except Exception as e:
         print(f"❌ Error: {e}")

    print("\n🎉 Verification Pipeline Completed.")

if __name__ == "__main__":
    run_admin_test()
