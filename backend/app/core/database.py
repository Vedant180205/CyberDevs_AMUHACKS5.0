from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

# Collections
users_col = db["users"]
students_col = db["students"]
companies_col = db["companies"]
prs_snapshots_col = db["prs_snapshots"]
microtasks_col = db["microtasks"]