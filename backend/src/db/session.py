import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Fallback string for local docker development environments
# production configurations leverage secure environment files (.env)
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/swap_v1_db"
)

# 1. Establish core database hardware connection engine parameters
# Pool size prevents over-allocation; max_overflow manages sudden high traffic spikes
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True, # Validates connection live status before running queries
    echo=False          # Toggle to True if you need to debug raw SQL logs in terminal
)

# 2. Bind thread-isolated session factory worker pipeline
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency injection provider context.
    Yields clean isolated atomic transaction lines per network API hit.
    Guarantees structural teardown safety locks close upon conclusion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # Instantly recycles resources back into the central engine pool
