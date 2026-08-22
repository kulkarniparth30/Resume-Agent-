import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyse import router as analyse_router
from routes.resume import router as resume_router
from routes.ai import router as ai_router
from routes.roadmap import router as roadmap_router
from routes.learn_resources import router as learn_router
from routes.jobs import router as jobs_router
from routes.projects import router as projects_router
from routes.auth import router as auth_router
from routes.history import router as history_router

app = FastAPI(title="ResumeAgent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyse_router, prefix="/api/analyse")
app.include_router(resume_router, prefix="/api/resume")
app.include_router(ai_router, prefix="/api/ai")
app.include_router(roadmap_router, prefix="/api/roadmap")
app.include_router(learn_router, prefix="/api/learn")
app.include_router(jobs_router, prefix="/api/jobs")
app.include_router(projects_router, prefix="/api/projects")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(history_router, prefix="/api/history")

@app.on_event("startup")
async def startup_event():
    print("Starting ResumeAgent FastAPI server...")
    os.makedirs("uploads", exist_ok=True)
    print("Uploads directory is ready.")

@app.get("/")
def root():
    return {"message": "Welcome to the ResumeAgent API"}
