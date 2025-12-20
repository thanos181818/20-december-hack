import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.db import get_session
from backend.models import User, Contact, UserRole, ContactType
from dotenv import load_dotenv

# --- FIX: Load SECRET_KEY from environment variables ---
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("❌ SECRET_KEY is missing! Check your backend/.env file.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Helpers ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    statement = select(User).where(User.email == email)
    # --- FIX: Use session.execute and scalars().first() ---
    result = await session.execute(statement)
    user = result.scalars().first()
    if user is None: raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Registration Endpoint (Transactional) ---
@router.post("/register", status_code=201)
async def register(
    email: str, 
    password: str, 
    name: str, 
    # --- FIX 1: Add a 'role' parameter, defaulting to CUSTOMER ---
    role: UserRole = UserRole.CUSTOMER,
    session: AsyncSession = Depends(get_session)
):
    # 1. Check if user exists
    # --- FIX: Use session.execute and scalars().first() ---
    result = await session.execute(select(User).where(User.email == email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Atomic Transaction: Create Contact -> Create User
    try:
        # Create Contact entry first
        # --- FIX 2: Create a generic contact, not hardcoded to customer ---
        contact_type = ContactType.CUSTOMER if role == UserRole.CUSTOMER else ContactType.BOTH
        new_contact = Contact(name=name, email=email, contact_type=contact_type)
        session.add(new_contact)
        await session.flush() # Flush to get the ID for the foreign key
        
        # Create User linked to Contact
        hashed_pw = pwd_context.hash(password)
        new_user = User(
            email=email, 
            hashed_password=hashed_pw, 
            # --- FIX 3: Use the 'role' variable provided in the request ---
            role=role, 
            contact_id=new_contact.id
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        # --- FIX 4: Return the actual role that was created ---
        return {"status": "success", "user_id": new_user.id, "role": role.value}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Login Endpoint ---
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    # --- FIX: Use session.execute and scalars().first() ---
    result = await session.execute(statement)
    user = result.scalars().first()
    
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}


# --- Profile Endpoints ---
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get current user's profile information."""
    # Get the linked contact for additional info
    contact = None
    if current_user.contact_id:
        contact = await session.get(Contact, current_user.contact_id)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": contact.name if contact else current_user.email.split('@')[0],
        "phone": contact.phone if contact else None,
        "address": contact.address if contact else None,
        "role": current_user.role.value,
    }

@router.put("/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Update current user's profile information."""
    if not current_user.contact_id:
        raise HTTPException(status_code=400, detail="User has no linked contact profile")
    
    contact = await session.get(Contact, current_user.contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact profile not found")
    
    # Update fields if provided
    if profile_data.name is not None:
        contact.name = profile_data.name
    if profile_data.phone is not None:
        contact.phone = profile_data.phone
    if profile_data.address is not None:
        contact.address = profile_data.address
    
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    
    return {
        "status": "success",
        "message": "Profile updated successfully",
        "name": contact.name,
        "phone": contact.phone,
        "address": contact.address,
    }

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Change user's password."""
    # Verify current password
    if not pwd_context.verify(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    current_user.hashed_password = pwd_context.hash(password_data.new_password)
    session.add(current_user)
    await session.commit()
    
    return {"status": "success", "message": "Password changed successfully"}