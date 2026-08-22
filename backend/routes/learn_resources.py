from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.learn_service import get_learning_resources

router = APIRouter()

class LearnRequest(BaseModel):
    skill: str
    job_role: str
    user_level: Optional[str] = "intermediate"

@router.post("/resources")
async def fetch_resources(req: LearnRequest):
    try:
        resources = await get_learning_resources(req.skill, req.job_role, req.user_level)
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
