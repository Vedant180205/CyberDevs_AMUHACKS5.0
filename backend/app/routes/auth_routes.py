from fastapi import APIRouter, HTTPException
from app.database import students_collection
from app.models.student_model import StudentSignup, StudentLogin
from app.utils.password_hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter()


@router.post("/signup")
async def signup(student: StudentSignup):
    existing = await students_collection.find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    student_dict = student.dict()
    student_dict["password"] = hash_password(student.password)
    student_dict["prs_score"] = 0
    # skills, cgpa, linkedin, github come from model now
    
    # Store initial analysis structure
    student_dict["github_analysis"] = None
    
    await students_collection.insert_one(student_dict)
    
    # Auto-login after signup
    token = create_access_token({"email": student.email, "role": "student"})

    return {"message": "Student registered successfully", "access_token": token, "token_type": "bearer"}


@router.post("/login")
async def login(student: StudentLogin):
    user = await students_collection.find_one({"email": student.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(student.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    role = user.get("role", "student")
    token = create_access_token({"email": user["email"], "role": role})

    return {"access_token": token, "token_type": "bearer", "role": role}
