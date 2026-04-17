from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import close_mongo_connection, connect_to_mongo
from routes.analysis import router as analysis_router
from routes.auth import router as auth_router

app = FastAPI(
    title="AI Resume Screening System",
    version="1.0.0",
    description="SaaS-style resume screening API with JWT auth, NLP scoring, and candidate insights.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_mongo_connection()


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(analysis_router, tags=["analysis"])
