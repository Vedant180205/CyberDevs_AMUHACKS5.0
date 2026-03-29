import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.password_hash import hash_password

async def reset():
    client = AsyncIOMotorClient('mongodb+srv://campusIQ_admin:ivILZGWhIi3Zj4Yw@campusiq-cluster.zgnjcxe.mongodb.net/')
    db = client['campusIQ']
    
    new_hash = hash_password("admin123")
    result = await db.students.update_one(
        {"email": "admin@campusiq.com"},
        {"$set": {"password": new_hash}}
    )
    
    if result.modified_count > 0:
        print("Password for admin@campusiq.com reset to 'admin123'")
    else:
        print("Could not update. Maybe already set or user not found.")

asyncio.run(reset())
