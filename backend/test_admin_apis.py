import requests

BASE_URL = "http://127.0.0.1:8000"

# Step 1: Login
login_payload = {
    "email": "aditi.more1@campusiq.com",
    "password": "12345"
}

res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
token = res.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Test APIs
endpoints = [
    "/api/admin/dashboard/summary",
    "/api/admin/dashboard/heatmap",
    "/api/admin/risk-list?level=red",
    "/api/admin/training-recommendations"
]

for ep in endpoints:
    r = requests.get(f"{BASE_URL}{ep}", headers=headers)
    print("\n===================================")
    print("TESTING:", ep)
    print("STATUS:", r.status_code)
    print("RESPONSE:", r.json())
