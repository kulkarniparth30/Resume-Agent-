from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.project_service import get_project_guide

router = APIRouter()

class ProjectGuideRequest(BaseModel):
    name: str
    description: str
    skills: List[str]

@router.post("/guide")
async def generate_project_guide(request: ProjectGuideRequest):
    try:
        guide = await get_project_guide(
            name=request.name,
            description=request.description,
            skills=request.skills
        )
        return guide
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
