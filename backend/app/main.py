from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, student, admin  # Add 'admin' here

app = FastAPI(title="CampusIQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(admin.router)  # Add this line

@app.get("/")
async def root():
    return {"message": "CampusIQ API is online", "status": "ready"}