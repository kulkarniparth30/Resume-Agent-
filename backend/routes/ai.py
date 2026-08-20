from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.ai_enhancer import enhance_section, enhance_bullet

router = APIRouter()

class EnhanceRequest(BaseModel):
    section_type: str
    content: str
    jd_context: Optional[str] = ''
    job_role: Optional[str] = ''

class BulletRequest(BaseModel):
    bullet: str
    context: Optional[str] = ''

@router.post("/enhance")
async def enhance(req: EnhanceRequest):
    enhanced = await enhance_section(
        section_type=req.section_type,
        content=req.content,
        jd_context=req.jd_context,
        job_role=req.job_role
    )
    return {"enhanced": enhanced}

@router.post("/enhance-bullet")
async def enhance_bullet_route(req: BulletRequest):
    enhanced = await enhance_bullet(
        bullet=req.bullet,
        context=req.context
    )
    return {"enhanced": enhanced}
