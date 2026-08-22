import json
import re
import httpx
from .llm_service import call_llm

async def search_jobs(role: str, skills: list = None, location: str = 'India') -> list:
    url = f"https://remotive.com/api/remote-jobs?search={role}&limit=20"
    jobs = []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("jobs"):
                    for job in data["jobs"]:
                        jobs.append({
                            "title": job.get("title", ""),
                            "company": job.get("company_name", ""),
                            "location": job.get("candidate_required_location", location),
                            "salary": job.get("salary", "Not specified"),
                            "experience": "Not specified",
                            "posted": job.get("publication_date", ""),
                            "url": job.get("url", ""),
                            "source": "Remotive",
                            "skills": [tag for tag in job.get("tags", [])]
                        })
    except Exception as e:
        print(f"Remotive API failed: {e}")
        
    if not jobs:
        # Fallback to LLM
        prompt = f"""
Generate 15 realistic, currently-relevant job listings for a '{role}' role located in '{location}'.
Try to match these skills if provided: {', '.join(skills) if skills else 'any'}.
Include REAL companies with REAL career page URLs or LinkedIn URLs.
Return a JSON array of objects, where each object has:
- title
- company
- location
- salary
- experience
- posted (e.g. '2 days ago')
- url
- source (must be "AI Generated")
- skills (list of required skills)
"""
        response_text = await call_llm(prompt, json_mode=True)
        response_text = re.sub(r'^```json\n', '', response_text)
        response_text = re.sub(r'\n```$', '', response_text)
        response_text = response_text.strip('` \n')
        try:
            jobs = json.loads(response_text)
        except json.JSONDecodeError:
            pass
            
    return jobs
