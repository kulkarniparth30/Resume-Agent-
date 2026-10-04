from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from services.job_search_service import search_jobs
from services.auto_apply_service import (
    generate_application_package,
    get_applications,
    update_application_status,
    delete_application
)
from chatbot.memory import get_profile

router = APIRouter()

class AutoApplyRequest(BaseModel):
    user_id: str
    job_title: str
    company: str
    job_url: str = ''
    job_skills: list = []

class StatusUpdateRequest(BaseModel):
    status: str

@router.get("")
@router.get("/")
async def get_jobs(
    role: str, 
    location: str = 'India', 
    skills: str = '',
    user_id: str = ''
):
    try:
        skills_list = [s.strip() for s in skills.split(',')] if skills else []
        jobs = await search_jobs(role, skills_list, location)
        
        if user_id:
            user_profile = get_profile(user_id)
            user_skills = user_profile.get("skills", []) if user_profile else []
            
            for job in jobs:
                job_skills = job.get("skills", [])
                if isinstance(job_skills, str):
                    job_skills = [s.strip() for s in job_skills.split(',')]
                
                matched = []
                missing = []
                
                for js in job_skills:
                    is_match = False
                    for us in user_skills:
                        if js.lower() in us.lower() or us.lower() in js.lower():
                            is_match = True
                            break
                    if is_match:
                        matched.append(js)
                    else:
                        missing.append(js)
                
                total = len(job_skills)
                job["match_percentage"] = int((len(matched) / total * 100)) if total > 0 else 0
                job["matched_skills"] = matched
                job["missing_skills"] = missing

        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto-apply")
async def auto_apply(request: AutoApplyRequest):
    try:
        result = await generate_application_package(
            user_id=request.user_id,
            job_title=request.job_title,
            company=request.company,
            job_url=request.job_url,
            job_skills=request.job_skills
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applications/{user_id}")
async def get_user_applications(user_id: str):
    try:
        apps = get_applications(user_id)
        return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/applications/{application_id}/status")
async def update_status(application_id: str, request: StatusUpdateRequest):
    try:
        result = update_application_status(int(application_id), request.status)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/applications/{application_id}")
async def delete_app(application_id: str):
    try:
        success = delete_application(int(application_id))
        return {"success": success, "id": application_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
