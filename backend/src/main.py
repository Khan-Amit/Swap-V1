from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the core database models and engine pool
from backend.src.db import models
from backend.src.db.session import engine

# Import the tactical sector API routers
from backend.src.api.v1.funding import router as funding_router
from backend.src.api.v1.fx import router as fx_router
from backend.src.api.v1.qr import router as qr_router

# 1. Automate database schema generation on the hardware layer
# In production, engineers migrate schemas using tools like Alembic
models.Base.metadata.create_all(bind=engine)

# 2. Initialize the central Starship Application Core
app = FastAPI(
    title="SWAP-V1 // TRANSWARP ENGINE CORE",
    description="Sub-space multi-currency P2P banking ledger matrix connecting SEPA and PromptPay sectors.",
    version="1.0.0"
)

# 3. Configure Sector Security Overlays (CORS Defenses)
# Allows your mobile app interface to safely transmit telemetry packets to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust to explicit mobile device URLs in production environments
    allow_credentials=True,
    allow_methods=["*"], # Authorizes standard GET, POST, OPTIONS requests
    allow_headers=["*"],
)

# 4. Dock sub-space tactical routing pipes into the main bridge console
app.include_router(funding_router)
app.include_router(fx_router)
app.include_router(qr_router)


@app.get("/", tags=["Main Bridge Command Matrix"])
def read_bridge_status():
    """
    Returns the high-level health parameters of the running Transwarp Engine.
    """
    return {
        "system_id": "SWAP-V1",
        "warp_core_status": "ONLINE",
        "subspace_array": "STABILIZED",
        "active_corridors": ["EUROPE_SEPA_S01", "THAILAND_PROMPTPAY_DQUAD"],
        "stardate_telemetry": "2026.161"
    }
