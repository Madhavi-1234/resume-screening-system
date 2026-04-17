from typing import Any, List

from pydantic import BaseModel, Field


class ResumeListResponse(BaseModel):
    id: str
    candidate_name: str
    file_name: str
    score: float
    ats_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_keywords: List[str]
    created_at: str


class CandidateDetailResponse(BaseModel):
    id: str
    candidate_name: str
    file_name: str
    score: float
    ats_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_keywords: List[str]
    extracted_skills: List[str]
    job_keywords: List[str]
    summary: str
    explanation: str
    highlighted_resume_text: str
    suggestions: List[str] = Field(default_factory=list)
    metadata: dict[str, Any]
    created_at: str
