import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from db import get_session
from models import User, Contact, UserRole, ContactType
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