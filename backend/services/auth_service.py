from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import Depends, Header, HTTPException, status

from core.database import get_database
from core.security import create_access_token, decode_token, get_password_hash, verify_password


async def register_user(payload: dict) -> dict:
    db = get_database()
    existing = await db.users.find_one({"email": payload["email"]})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = {
        "name": payload["name"],
        "email": payload["email"],
        "password_hash": get_password_hash(payload["password"]),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user)
    token = create_access_token(str(result.inserted_id))
    return {
        "access_token": token,
        "user": {"id": str(result.inserted_id), "name": user["name"], "email": user["email"]},
    }


async def login_user(email: str, password: str) -> dict:
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = create_access_token(str(user["_id"]))
    return {
        "access_token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    }


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization token is required.")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user_id = payload.get("sub")
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}


CurrentUser = Annotated[dict, Depends(get_current_user)]
