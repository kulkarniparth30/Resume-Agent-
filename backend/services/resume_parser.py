import io
import json
import re
import PyPDF2
import docx
from fastapi import UploadFile
from .llm_service import call_llm

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

async def extract_structured_resume(resume_text: str) -> dict:
    prompt = f"""
Parse the following raw resume text into a clean structured JSON object for a resume builder editor.

Resume Text:
{resume_text}

Return EXACTLY this JSON structure:
{{
  "name": "Full Name",
  "location": "City, State / Country",
  "phone": "+1 234 567 8900",
  "email": "email@example.com",
  "links": [
    {{"label": "LinkedIn", "url": "https://..."}},
    {{"label": "GitHub", "url": "https://..."}}
  ],
  "summary": "Professional summary...",
  "experiences": [
    {{
      "id": 1,
      "title": "Software Engineer",
      "company": "Company Name",
      "duration": "Jan 2023 - Present",
      "techStack": "Python, React, AWS",
      "bullets": [
        "First accomplishment bullet point...",
        "Second bullet point with metrics..."
      ]
    }}
  ],
  "education": [
    {{
      "id": 1,
      "degree": "B.Tech Computer Science",
      "university": "University Name",
      "year": "2020 - 2024",
      "gpa": "8.5/10"
    }}
  ],
  "projects": [
    {{
      "id": 1,
      "name": "Project Name",
      "description": "Brief summary",
      "tech": "Python, FastAPI",
      "link": "github.com/...",
      "bullets": ["Key feature or outcome"]
    }}
  ],
  "skillCategories": [
    {{"id": 1, "category": "Languages", "skills": "Python, JavaScript, SQL"}},
    {{"id": 2, "category": "Frameworks", "skills": "FastAPI, React, Node.js"}},
    {{"id": 3, "category": "Tools & Cloud", "skills": "Docker, AWS, Git"}}
  ],
  "publications": [],
  "achievements": [],
  "certifications": []
}}
"""
    response_text = await call_llm(prompt=prompt, provider='gemini', json_mode=True)
    
    response_text = re.sub(r'^```json\s*', '', response_text.strip())
    response_text = re.sub(r'\s*```$', '', response_text.strip())
    
    try:
        data = json.loads(response_text)
        return data
    except Exception as e:
        print(f"Error parsing structured resume JSON: {e}")
        return {
            "name": "",
            "location": "",
            "phone": "",
            "email": "",
            "links": [],
            "summary": resume_text[:300] if resume_text else "",
            "experiences": [],
            "education": [],
            "projects": [],
            "skillCategories": [],
            "publications": [],
            "achievements": [],
            "certifications": []
        }
