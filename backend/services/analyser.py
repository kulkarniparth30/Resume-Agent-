import json
from .llm_service import call_llm

async def analyse_resume(resume_text: str, jd_text: str = '', job_role: str = '', manual_skills: list = None) -> dict:
    if manual_skills is None:
        manual_skills = []
        
    prompt = f"""
    Analyze the following resume against the job description and job role.
    
    Job Role: {job_role}
    Job Description: {jd_text}
    Manual Skills Provided: {manual_skills}
    
    Resume:
    {resume_text}
    
    Extract insights and calculate ATS score, gap score, and match percentage. 
    You MUST return EXACTLY this JSON structure and nothing else:
    {{
      "candidate_skills": ["Python"],
      "required_skills": ["Python", "Docker"],
      "skill_gap": [{{"skill": "Docker", "importance": 4.2, "rank": 1}}],
      "ats_score": 68,
      "gap_score": 42,
      "match_percent": 62,
      "rank_score": 75,
      "rank_breakdown": {{
        "skills_match": 70,
        "experience_relevance": 80,
        "education_fit": 75,
        "project_alignment": 65
      }},
      "fake_skills": [{{"skill": "ML", "reason": "Listed but no evidence found"}}],
      "suggestions": [{{"skill": "Docker Compose", "related_to": "Docker", "weeks": 1}}],
      "jobs": [{{"title": "ML Engineer", "company": "Zepto", "location": "Pune", "match": 71, "salary": "8-12 LPA"}}],
      "courses": [{{"name": "ML Specialization", "platform": "Coursera", "rating": 4.9, "price": "Free", "skill": "ML"}}],
      "project_ideas": [{{"name": "ML API", "description": "...", "skills_covered": ["Python"], "estimated_time": "2 weekends"}}],
      "salary_insights": {{
        "current_range": "4-6 LPA",
        "skills": [{{"skill": "ML", "bump": "+8 LPA", "weeks": 12, "roi": "high"}}]
      }},
      "resume_improvements": [
        {{
          "section": "Experience",
          "current": "Developed REST APIs using Python and Flask.",
          "suggested": "Architected high-throughput RESTful microservices with FastAPI & Redis, reducing API response latency by 35% under peak loads.",
          "reason": "Matches JD requirements for high performance and adds quantifiable impact metrics.",
          "impact": "High"
        }},
        {{
          "section": "Summary",
          "current": "Software engineer with experience in Python.",
          "suggested": "Results-driven Software Engineer with specialized expertise in distributed backend systems, AI agents, and scalable cloud architectures.",
          "reason": "Elevates personal branding to align directly with target role seniority.",
          "impact": "Medium"
        }}
      ]
    }}
    """
    
    response = await call_llm(prompt=prompt, provider='gemini', json_mode=True)
    
    try:
        # Strip markdown json blocks if present
        if response.startswith("```json"):
            response = response.replace("```json\n", "", 1)
        if response.startswith("```"):
            response = response.replace("```\n", "", 1)
        if response.endswith("```"):
            response = response.rsplit("```", 1)[0]
            
        data = json.loads(response.strip())
        return data
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        # Fallback empty structure
        return {
            "candidate_skills": [],
            "required_skills": [],
            "skill_gap": [],
            "ats_score": 0,
            "gap_score": 0,
            "match_percent": 0,
            "rank_score": 0,
            "rank_breakdown": {
                "skills_match": 0, "experience_relevance": 0, "education_fit": 0, "project_alignment": 0
            },
            "fake_skills": [], "suggestions": [], "jobs": [], "courses": [], "project_ideas": [],
            "salary_insights": {"current_range": "N/A", "skills": []},
            "resume_improvements": []
        }

async def rank_multiple_resumes(resumes: list[dict], jd_text: str, job_role: str) -> list:
    results = []
    for r in resumes:
        name = r.get("name", "Unknown")
        text = r.get("resume_text", "")
        analysis = await analyse_resume(text, jd_text, job_role)
        analysis["name"] = name
        results.append(analysis)
        
    # Sort by rank_score descending
    results.sort(key=lambda x: x.get("rank_score", 0), reverse=True)
    return results
