import re
import string
from collections import Counter

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
}

SKILL_KEYWORDS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "vite",
    "tailwind",
    "node",
    "express",
    "fastapi",
    "flask",
    "django",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "git",
    "github",
    "ci/cd",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "nlp",
    "machine learning",
    "data analysis",
    "rest",
    "graphql",
    "html",
    "css",
    "figma",
    "framer motion",
    "jwt",
    "oauth",
    "microservices",
    "selenium",
    "playwright",
    "pytest",
    "pandas",
    "numpy",
}

EXPERIENCE_TERMS = {
    "leadership",
    "architecture",
    "deployment",
    "scalability",
    "optimization",
    "analytics",
    "mentoring",
    "stakeholder",
    "delivery",
    "ownership",
    "design",
    "testing",
    "automation",
    "security",
    "monitoring",
    "integration",
}


def normalize_text(text: str) -> str:
    lowered = text.lower()
    no_punctuation = lowered.translate(str.maketrans("", "", string.punctuation))
    compact = re.sub(r"\s+", " ", no_punctuation).strip()
    return compact


def tokenize(text: str) -> list[str]:
    normalized = normalize_text(text)
    return [token for token in normalized.split() if token and token not in STOPWORDS]


def extract_keywords(text: str, limit: int = 20) -> list[str]:
    tokens = tokenize(text)
    counts = Counter(tokens)
    ranked = [token for token, _ in counts.most_common(limit * 3)]
    deduped: list[str] = []
    for token in ranked:
        if token not in deduped:
            deduped.append(token)
        if len(deduped) >= limit:
            break
    return deduped


def extract_skill_matches(job_description: str, resume_text: str) -> tuple[list[str], list[str], list[str]]:
    jd_text = normalize_text(job_description)
    resume_normalized = normalize_text(resume_text)

    job_skills = sorted({skill for skill in SKILL_KEYWORDS if skill in jd_text})
    resume_skills = sorted({skill for skill in SKILL_KEYWORDS if skill in resume_normalized})

    if not job_skills:
        job_skills = extract_keywords(job_description, limit=12)

    matched = [skill for skill in job_skills if skill in resume_normalized]
    missing = [skill for skill in job_skills if skill not in resume_normalized]
    return matched[:12], missing[:12], resume_skills[:20]


def extract_experience_keywords(text: str) -> list[str]:
    normalized = normalize_text(text)
    matched_terms = [term for term in EXPERIENCE_TERMS if term in normalized]
    if matched_terms:
        return sorted(matched_terms)
    return extract_keywords(text, limit=8)


def highlight_keywords(text: str, keywords: list[str]) -> str:
    highlighted = text
    for keyword in sorted(set(keywords), key=len, reverse=True):
        if not keyword.strip():
            continue
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        highlighted = pattern.sub(lambda match: f"<mark>{match.group(0)}</mark>", highlighted)
    return highlighted
