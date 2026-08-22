from fastapi import APIRouter, HTTPException, Query
from services.job_search_service import search_jobs
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_jobs(
    role: str, 
    location: str = 'India', 
    skills: str = ''
):
    try:
        skills_list = [s.strip() for s in skills.split(',')] if skills else []
        jobs = await search_jobs(role, skills_list, location)
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
