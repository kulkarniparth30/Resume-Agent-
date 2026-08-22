from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.resume_parser import parse_resume, extract_structured_resume

router = APIRouter()

class ParseStructuredRequest(BaseModel):
    resume_text: str

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        text = await parse_resume(file)
        return {"text": text, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/parse-structured")
async def parse_structured(req: ParseStructuredRequest):
    try:
        data = await extract_structured_resume(req.resume_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
