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
    try:
        print(f"DEBUG: Login attempt for {student.email}")
        import time
        start = time.time()
        
        user = await students_collection.find_one({"email": student.email})
        print(f"DEBUG: DB Fetch took {time.time() - start:.4f}s")
        
        if not user:
            print("DEBUG: User not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(student.password, user["password"]):
            print("DEBUG: Password mismatch")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        print(f"DEBUG: Password verification took {time.time() - start:.4f}s")

        role = user.get("role", "student")
        token = create_access_token({"email": user["email"], "role": role})
        print(f"DEBUG: Token creation took {time.time() - start:.4f}s")

        return {"access_token": token, "token_type": "bearer", "role": role}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"LOGIN ERROR: {trace}")
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": f"Login Failed: {str(e)}", "trace": trace})
