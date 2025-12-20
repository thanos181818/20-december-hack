import os
from pathlib import Path
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# --- 1. Load Environment Variables Robustly ---
# Get the path to the .env file in the current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# --- 2. Get Database URL ---
DATABASE_URL = os.getenv("DATABASE_URL")

# --- DEBUG PRINT ---
# This will show up in your terminal logs. 
# Check if it says 5433 or 5432.
print(f"\n[DB DEBUG] Connecting to: {DATABASE_URL}\n")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is missing! Check your backend/.env file.")

# --- 3. Create Engine ---
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(SQLModel.metadata.create_all)