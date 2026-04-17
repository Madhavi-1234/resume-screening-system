# AI Resume Screening System

A production-style SaaS web app for screening resumes against a job description using FastAPI, MongoDB, JWT authentication, TF-IDF scoring, ATS-style ranking, and a modern React + Tailwind dashboard.

## Backend structure

- `backend/app.py` - FastAPI entrypoint
- `backend/routes/` - auth and analysis routes
- `backend/controllers/` - request orchestration
- `backend/services/` - NLP, auth, file, and optional OpenAI suggestion logic
- `backend/models/` - request and response schemas
- `backend/core/` - config, database, security helpers
- `backend/utils/` - text cleaning, keyword extraction, highlighting

## Frontend structure

- `frontend/src/components/` - reusable UI blocks
- `frontend/src/pages/` - auth and dashboard pages
- `frontend/src/hooks/` - auth and theme hooks
- `frontend/src/services/api.js` - API client
- `frontend/src/utils/` - formatting helpers

## Features

- JWT-based signup/login
- Multi-resume PDF upload
- JD text input and optional JD PDF upload
- TF-IDF similarity scoring
- ATS score indicator and rank ordering
- Matched and missing skills
- Candidate detail drawer with keyword highlighting
- Export results to CSV
- Dark mode toggle
- Optional OpenAI-powered resume suggestions

## Installation

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload --port 8000
```

### 2. MongoDB

Run MongoDB locally and keep the default URI from `backend/.env`, or update `MONGODB_URI`.

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Environment variables

### Backend

- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `OPENAI_API_KEY`
- `CORS_ORIGINS`
- `UPLOAD_DIR`

### Frontend

- `VITE_API_URL`

## API endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /upload-resume`
- `POST /analyze`
- `GET /results`
- `GET /candidate/{id}`
- `GET /results/export`
- `GET /health`
