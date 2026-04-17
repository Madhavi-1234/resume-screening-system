from core.config import settings

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None


def generate_resume_suggestions(job_description: str, matched_skills: list[str], missing_skills: list[str]) -> list[str]:
    if not settings.openai_api_key or OpenAI is None:
        return []

    prompt = (
        "You are a recruiter assistant. Provide 3 concise resume improvement suggestions. "
        "Base them only on the job description and skill gaps.\n\n"
        f"Job description:\n{job_description}\n\n"
        f"Matched skills: {', '.join(matched_skills) or 'None'}\n"
        f"Missing skills: {', '.join(missing_skills) or 'None'}"
    )

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            max_output_tokens=180,
        )
        content = response.output_text.strip()
        return [line.lstrip("- ").strip() for line in content.splitlines() if line.strip()][:3]
    except Exception:
        return []
