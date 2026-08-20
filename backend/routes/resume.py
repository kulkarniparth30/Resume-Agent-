from fastapi import APIRouter, File, UploadFile, HTTPException
from services.resume_parser import parse_resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        text = await parse_resume(file)
        return {"text": text, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
