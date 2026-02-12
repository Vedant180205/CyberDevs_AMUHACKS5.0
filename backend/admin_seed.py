
import asyncio
from app.database import students_collection
from app.utils.password_hash import hash_password
from app.models.student_model import StudentSignup

async def seed_admin():
    print("🌱 Seeding Admin User...")
    
    admin_email = "admin@campusiq.com"
    admin_password = "admin123"
    
    existing_admin = await students_collection.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"⚠️ Admin user {admin_email} already exists. Updating password/role...")
        
        await students_collection.update_one(
            {"email": admin_email},
            {"$set": {"password": hash_password(admin_password), "role": "admin"}}
        )
        print("🔄 Admin password/role updated.")
        return

    admin_data = {
        "name": "Admin User",
        "email": admin_email,
        "password": hash_password(admin_password),
        "year": "N/A",
        "branch": "N/A",
        "cgpa": 0.0,
        "skills": [],
        "role": "admin", # Explicitly set role
        "prs_score": 0,
        "events": [],
        "github_analysis": None,
        "resume_analysis": None,
        "ats_score": 0
    }
    
    await students_collection.insert_one(admin_data)
    print(f"✅ Admin user {admin_email} created successfully!")

if __name__ == "__main__":
    asyncio.run(seed_admin())
