import io
import PyPDF2
import docx
from fastapi import UploadFile

async def parse_resume(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = await file.read()
    
    text = ""
    try:
        if filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif filename.endswith(".txt"):
            text = content.decode("utf-8")
        else:
            raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")
    except Exception as e:
        print(f"Error parsing file: {e}")
        raise e
        
    return text.strip()
