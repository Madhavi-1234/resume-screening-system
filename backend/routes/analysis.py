from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile

from controllers.analysis_controller import (
    analyze_candidates,
    export_results,
    get_candidate,
    get_results,
    upload_resumes,
)
from services.auth_service import CurrentUser

router = APIRouter()


@router.post("/upload-resume")
async def upload_resume(
    current_user: CurrentUser,
    files: Annotated[list[UploadFile], File(...)],
) -> dict:
    uploaded = await upload_resumes(files, current_user)
    return {"uploaded": uploaded}


@router.post("/analyze")
async def analyze(
    current_user: CurrentUser,
    job_description: str = Form(""),
    files: list[UploadFile] | None = File(default=None),
    job_description_file: UploadFile | None = File(default=None),
) -> dict:
    return await analyze_candidates(
        user=current_user,
        job_description=job_description,
        uploaded_files=files,
        job_description_file=job_description_file,
    )


@router.get("/results")
async def results(
    current_user: CurrentUser,
    top_only: bool = False,
    skill: str | None = None,
) -> list[dict]:
    return await get_results(current_user, top_only=top_only, skill=skill)


@router.get("/candidate/{candidate_id}")
async def candidate(current_user: CurrentUser, candidate_id: str) -> dict:
    return await get_candidate(current_user, candidate_id)


@router.get("/results/export")
async def export(current_user: CurrentUser):
    return await export_results(current_user)
