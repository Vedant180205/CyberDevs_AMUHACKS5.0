import requests
import json

url = "http://localhost:8000/api/auth/signup"

payload = {
  "name": "Test User 2",
  "email": "testuser_signup_verify_2@example.com",
  "password": "password123",
  "year": "Final Year",
  "branch": "CSE",
  "cgpa": 8.5,
  "skills": ["Python", "FastAPI"],
  "linkedin_url": "https://linkedin.com/in/testuser",
  "github_url": "https://github.com/testuser"
}

headers = {
  'Content-Type': 'application/json'
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Signup successful!")
        data = response.json()
        if "access_token" in data:
            token = data["access_token"]
            print("Access token received. Verifying profile data...")
            
            # Verify data persistence
            me_url = "http://localhost:8000/api/student/me"
            me_headers = {'Authorization': f'Bearer {token}'}
            me_response = requests.get(me_url, headers=me_headers)
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print("Profile data retrieved successfully:")
                print(f"Name: {me_data.get('name')}")
                print(f"CGPA: {me_data.get('cgpa')}")
                print(f"Skills: {me_data.get('skills')}")
                if me_data.get('cgpa') == 8.5 and "Python" in me_data.get('skills'):
                     print("VERIFICATION PASSED: Data matches payload.")
                else:
                     print("VERIFICATION FAILED: Data mismatch.")
            else:
                print(f"Failed to fetch profile: {me_response.status_code}")
        else:
            print("WARNING: No access token received.")
            
    elif response.status_code == 400 and "Email already registered" in response.text:
        print("User already exists (expected if re-running). Test considered pass for duplicate check.")
    else:
        print("Signup failed.")

except Exception as e:
    print(f"Error: {e}")
