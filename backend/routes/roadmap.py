from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.roadmap_generator import generate_roadmap
from services.roadmap_service import (
    save_roadmap_record,
    get_saved_roadmaps,
    delete_saved_roadmap
)

router = APIRouter()

class RoadmapRequest(BaseModel):
    user_id: Optional[str] = "default_user"
    candidate_skills: List[str] = []
    skill_gaps: List[Any] = []
    job_role: str = "Software Developer"
    rank_score: int = 50

class SaveRoadmapRequest(BaseModel):
    user_id: str = "default_user"
    role: str
    roadmap_data: List[Dict[str, Any]]
    rank_score: int = 50
    timeline: Optional[str] = ""
    title: Optional[str] = ""

@router.post("/generate")
@router.post("/generate/")
async def generate(req: RoadmapRequest):
    try:
        roadmap = await generate_roadmap(
            candidate_skills=req.candidate_skills,
            skill_gaps=req.skill_gaps,
            job_role=req.job_role,
            rank_score=req.rank_score
        )
        
        # Auto-save roadmap if user_id is provided
        saved_entry = None
        if req.user_id:
            saved_entry = save_roadmap_record(
                user_id=req.user_id,
                role=req.job_role,
                roadmap_data=roadmap,
                rank_score=req.rank_score
            )
            
        return {
            "roadmap": roadmap,
            "saved_id": saved_entry["id"] if saved_entry else None,
            "role": req.job_role
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/saved/{user_id}")
async def list_saved_roadmaps(user_id: str):
    try:
        roadmaps = get_saved_roadmaps(user_id)
        return roadmaps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save")
async def save_roadmap_endpoint(req: SaveRoadmapRequest):
    try:
        saved = save_roadmap_record(
            user_id=req.user_id,
            role=req.role,
            roadmap_data=req.roadmap_data,
            rank_score=req.rank_score,
            timeline=req.timeline or "",
            title=req.title or ""
        )
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/saved/{roadmap_id}")
async def delete_roadmap_endpoint(roadmap_id: int, user_id: Optional[str] = Query(None)):
    try:
        success = delete_saved_roadmap(roadmap_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Roadmap not found or already deleted")
        return {"success": True, "deleted_id": roadmap_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
