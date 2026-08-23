from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from services.supabase_service import save_analysis, fetch_user_analyses, delete_analysis, get_user_from_token

router = APIRouter()

class SaveAnalysisRequest(BaseModel):
    job_role: str
    jd_text: Optional[str] = ""
    resume_text: Optional[str] = ""
    analysis_result: Dict[str, Any]

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    return get_user_from_token(token)

@router.get("")
@router.get("/")
async def get_history(user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user.get("id") if user else None
    if not user_id:
        return []
    try:
        items = fetch_user_analyses(user_id)
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
@router.post("/")
async def create_history_entry(
    req: SaveAnalysisRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = user.get("id") if user else None
    try:
        saved = save_analysis(
            user_id=user_id,
            job_role=req.job_role,
            jd_text=req.jd_text,
            resume_text=req.resume_text,
            analysis_result=req.analysis_result
        )
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{analysis_id}")
@router.delete("/{analysis_id}/")
async def remove_history_entry(
    analysis_id: str,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = user.get("id") if user else None
    success = delete_analysis(analysis_id, user_id)
    return {"success": success}
