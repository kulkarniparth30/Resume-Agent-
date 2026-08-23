from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.analyser import analyse_resume, rank_multiple_resumes

router = APIRouter()

class AnalyseRequest(BaseModel):
    resume_text: str
    jd_text: Optional[str] = ''
    job_role: Optional[str] = ''
    manual_skills: Optional[List[str]] = []

class RankMultipleRequest(BaseModel):
    resumes: List[Dict[str, str]]
    jd_text: str
    job_role: str

@router.post("")
@router.post("/")
async def analyse(req: AnalyseRequest):
    result = await analyse_resume(
        resume_text=req.resume_text,
        jd_text=req.jd_text,
        job_role=req.job_role,
        manual_skills=req.manual_skills
    )
    return result

@router.post("/rank-multiple")
@router.post("/rank-multiple/")
async def rank_multiple(req: RankMultipleRequest):
    results = await rank_multiple_resumes(
        resumes=req.resumes,
        jd_text=req.jd_text,
        job_role=req.job_role
    )
    return results
