import csv
from datetime import datetime, timezone
from io import StringIO

from bson import ObjectId
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from core.database import get_database
from services.file_service import extract_pdf_text, save_upload
from services.nlp_service import analyze_resume
from services.openai_service import generate_resume_suggestions


async def upload_resumes(files: list[UploadFile], user: dict) -> list[dict]:
    if not files:
        raise HTTPException(status_code=400, detail="At least one resume PDF is required.")

    db = get_database()
    uploaded: list[dict] = []
    for file in files:
        stored_path, original_name = await save_upload(file)
        resume_text = extract_pdf_text(stored_path)
        candidate_name = original_name.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
        document = {
            "user_id": user["id"],
            "candidate_name": candidate_name,
            "file_name": original_name,
            "stored_path": stored_path,
            "resume_text": resume_text,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.resumes.insert_one(document)
        uploaded.append({"id": str(result.inserted_id), "candidate_name": candidate_name, "file_name": original_name})
    return uploaded


async def analyze_candidates(
    user: dict,
    job_description: str,
    uploaded_files: list[UploadFile] | None = None,
    job_description_file: UploadFile | None = None,
) -> dict:
    db = get_database()

    if job_description_file is not None:
        path, _ = await save_upload(job_description_file)
        job_description = extract_pdf_text(path)

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="A job description is required.")

    resume_ids: list[str] = []
    if uploaded_files:
        uploaded = await upload_resumes(uploaded_files, user)
        resume_ids = [item["id"] for item in uploaded]

    query = {"user_id": user["id"]}
    if resume_ids:
        query["_id"] = {"$in": [ObjectId(resume_id) for resume_id in resume_ids]}

    resumes = await db.resumes.find(query).to_list(length=200)
    if not resumes:
        raise HTTPException(status_code=400, detail="Upload at least one resume before analysis.")

    session = {
        "user_id": user["id"],
        "job_description": job_description,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    session_result = await db.analysis_sessions.insert_one(session)
    session_id = str(session_result.inserted_id)

    analyzed_results: list[dict] = []
    for resume in resumes:
        analysis = analyze_resume(
            job_description=job_description,
            resume_text=resume["resume_text"],
            candidate_name=resume["candidate_name"],
            file_name=resume["file_name"],
        )
        suggestions = generate_resume_suggestions(
            job_description,
            analysis["matched_skills"],
            analysis["missing_skills"],
        )
        document = {
            "session_id": session_id,
            "user_id": user["id"],
            "resume_id": str(resume["_id"]),
            **analysis,
            "suggestions": suggestions,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        insert_result = await db.analysis_results.insert_one(document)
        document["id"] = str(insert_result.inserted_id)
        analyzed_results.append(document)

    analyzed_results.sort(key=lambda item: item["ats_score"], reverse=True)
    return {
        "session_id": session_id,
        "results": [
            {
                "id": item["id"],
                "candidate_name": item["candidate_name"],
                "file_name": item["file_name"],
                "score": item["score"],
                "ats_score": item["ats_score"],
                "matched_skills": item["matched_skills"],
                "missing_skills": item["missing_skills"],
                "experience_keywords": item["experience_keywords"],
                "created_at": item["created_at"],
            }
            for item in analyzed_results
        ],
    }


async def get_results(user: dict, top_only: bool = False, skill: str | None = None) -> list[dict]:
    db = get_database()
    results = await db.analysis_results.find({"user_id": user["id"]}).to_list(length=500)
    items: list[dict] = []
    for item in results:
        if skill and skill.lower() not in [value.lower() for value in item.get("matched_skills", [])]:
            continue
        items.append(
            {
                "id": str(item["_id"]),
                "candidate_name": item["candidate_name"],
                "file_name": item["file_name"],
                "score": item["score"],
                "ats_score": item["ats_score"],
                "matched_skills": item["matched_skills"],
                "missing_skills": item["missing_skills"],
                "experience_keywords": item["experience_keywords"],
                "created_at": item["created_at"],
            }
        )

    items.sort(key=lambda result: result["ats_score"], reverse=True)
    return items[:5] if top_only else items


async def get_candidate(user: dict, candidate_id: str) -> dict:
    db = get_database()
    item = await db.analysis_results.find_one({"_id": ObjectId(candidate_id), "user_id": user["id"]})
    if not item:
        raise HTTPException(status_code=404, detail="Candidate analysis not found.")

    return {
        "id": str(item["_id"]),
        "candidate_name": item["candidate_name"],
        "file_name": item["file_name"],
        "score": item["score"],
        "ats_score": item["ats_score"],
        "matched_skills": item["matched_skills"],
        "missing_skills": item["missing_skills"],
        "experience_keywords": item["experience_keywords"],
        "extracted_skills": item["extracted_skills"],
        "job_keywords": item["job_keywords"],
        "summary": item["summary"],
        "explanation": item["explanation"],
        "highlighted_resume_text": item["highlighted_resume_text"],
        "suggestions": item.get("suggestions", []),
        "metadata": item["metadata"],
        "created_at": item["created_at"],
    }


async def export_results(user: dict) -> StreamingResponse:
    results = await get_results(user)
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Candidate", "File", "Score", "ATS Score", "Matched Skills", "Missing Skills"])
    for item in results:
        writer.writerow(
            [
                item["candidate_name"],
                item["file_name"],
                item["score"],
                item["ats_score"],
                ", ".join(item["matched_skills"]),
                ", ".join(item["missing_skills"]),
            ]
        )
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=resume-screening-results.csv"},
    )
