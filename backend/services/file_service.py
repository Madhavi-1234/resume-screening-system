from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PyPDF2 import PdfReader

from core.config import settings


async def save_upload(file: UploadFile) -> tuple[str, str]:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail=f"{file.filename or 'File'} must be a PDF.")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    target_name = f"{uuid4()}-{file.filename}"
    target_path = upload_dir / target_name
    file_bytes = await file.read()
    target_path.write_bytes(file_bytes)
    return str(target_path), file.filename


def extract_pdf_text(path: str) -> str:
    reader = PdfReader(path)
    text_parts: list[str] = []
    for page in reader.pages:
        extracted = page.extract_text() or ""
        if extracted.strip():
            text_parts.append(extracted)

    text = "\n".join(text_parts).strip()
    if not text:
        raise HTTPException(status_code=400, detail="No readable text could be extracted from the PDF.")
    return text
