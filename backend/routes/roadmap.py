from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from services.roadmap_generator import generate_roadmap

router = APIRouter()

class RoadmapRequest(BaseModel):
    candidate_skills: List[str] = []
    skill_gaps: List[Any] = []
    job_role: str = "Software Developer"
    rank_score: int = 50

@router.post("/generate")
async def generate(req: RoadmapRequest):
    roadmap = await generate_roadmap(
        candidate_skills=req.candidate_skills,
        skill_gaps=req.skill_gaps,
        job_role=req.job_role,
        rank_score=req.rank_score
    )
    return roadmap
