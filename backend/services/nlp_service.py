from sklearn.feature_extraction.text import TfidfVectorizer

from utils.text import (
    extract_experience_keywords,
    extract_keywords,
    extract_skill_matches,
    highlight_keywords,
    normalize_text,
)


def analyze_resume(job_description: str, resume_text: str, candidate_name: str, file_name: str) -> dict:
    documents = [normalize_text(job_description), normalize_text(resume_text)]
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(documents)
    similarity = (tfidf_matrix[0] @ tfidf_matrix[1].T).toarray()[0][0]

    matched_skills, missing_skills, extracted_skills = extract_skill_matches(job_description, resume_text)
    experience_keywords = extract_experience_keywords(resume_text)
    job_keywords = extract_keywords(job_description, limit=12)

    skill_alignment = len(matched_skills) / max(len(matched_skills) + len(missing_skills), 1)
    ats_score = round(min(100, (similarity * 70 + skill_alignment * 30) * 100))
    score = round(similarity * 100, 2)

    if ats_score >= 80:
        summary = "Strong alignment with the role requirements."
    elif ats_score >= 60:
        summary = "Promising profile with a few notable gaps."
    else:
        summary = "Limited alignment with the job description."

    explanation = (
        f"{candidate_name} matches {len(matched_skills)} core requirements and is missing "
        f"{len(missing_skills)} expected skills. TF-IDF similarity captures overall language overlap, "
        "while the ATS score also weights direct skill coverage."
    )

    return {
        "candidate_name": candidate_name,
        "file_name": file_name,
        "resume_text": resume_text,
        "score": score,
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "experience_keywords": experience_keywords,
        "extracted_skills": extracted_skills,
        "job_keywords": job_keywords,
        "summary": summary,
        "explanation": explanation,
        "highlighted_resume_text": highlight_keywords(resume_text, matched_skills + missing_skills),
        "metadata": {
            "keyword_overlap_ratio": round(skill_alignment, 2),
            "vector_similarity": round(similarity, 4),
        },
    }
