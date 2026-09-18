import os

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import Base, engine
from . import models
from .deps import get_current_user, require_admin
from .routers.auth import router as auth_router
from .routers.parcels import router as parcels_router

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Courier & Logistics Management API",
    version="1.0.0"
)

frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).strip()

allowed_origins = [
    "http://localhost:5173",
    "https://courier-management-ashen.vercel.app",
]

if frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(parcels_router)


@app.get("/")
def root():
    return {
        "message": "Courier & Logistics Management API is running"
    }


@app.get("/protected")
def protected_route(current_user=Depends(get_current_user)):
    return {
        "message": "You can access this protected route",
        "user_id": current_user.id,
        "name": current_user.name,
        "role": current_user.role.value
    }


@app.get("/admin-test")
def admin_test(current_user=Depends(require_admin)):
    return {
        "message": "You have admin access",
        "user_id": current_user.id,
        "name": current_user.name,
        "role": current_user.role.value
    }