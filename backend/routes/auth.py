from fastapi import APIRouter

from models.auth import TokenResponse, UserCreate, UserLogin
from services.auth_service import login_user, register_user

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserCreate) -> dict:
    return await register_user(payload.model_dump())


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin) -> dict:
    return await login_user(payload.email, payload.password)
