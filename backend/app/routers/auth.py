from fastapi import APIRouter, HTTPException, status
from ..core.security import verify_password, create_access_token, get_password_hash
from ..core.database import users_col
from ..models.user import UserLogin, UserCreate, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await users_col.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user["role"],
        "student_id": user.get("student_id")
    }

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    existing_user = await users_col.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "email": user_data.email,
        "password_hash": hashed_password,
        "role": user_data.role,
        "is_active": True
    }
    
    result = await users_col.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": new_user["email"], "role": new_user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user["role"],
        "student_id": str(result.inserted_id) # Using _id as student_id for now
    }