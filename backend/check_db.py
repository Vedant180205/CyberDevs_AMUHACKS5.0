import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb+srv://campusIQ_admin:ivILZGWhIi3Zj4Yw@campusiq-cluster.zgnjcxe.mongodb.net/')
    db = client['campusIQ']
    admin = await db.students.find_one({'role': 'admin'})
    if admin:
        print(f"Admin found: {admin['email']}")
    else:
        print("No admin found in db.students")
        
    admin_coll = await db.admins.find_one({})
    if admin_coll:
        print(f"Admin found in admins collection: {admin_coll}")
    else:
        print("No admin found in db.admins")

asyncio.run(main())
