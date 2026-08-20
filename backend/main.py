import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyse import router as analyse_router
from routes.resume import router as resume_router
from routes.ai import router as ai_router
from routes.roadmap import router as roadmap_router

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

@app.on_event("startup")
async def startup_event():
    print("Starting ResumeAgent FastAPI server...")
    os.makedirs("uploads", exist_ok=True)
    print("Uploads directory is ready.")

@app.get("/")
def root():
    return {"message": "Welcome to the ResumeAgent API"}
