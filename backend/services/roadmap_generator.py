import json
from .llm_service import call_llm

async def generate_roadmap(candidate_skills: list, skill_gaps: list, job_role: str, rank_score: int) -> list:
    timeline = ""
    if rank_score < 40:
        timeline = "4-6 months focusing on foundational skills."
    elif rank_score < 70:
        timeline = "3-4 months targeting specific skill gaps."
    else:
        timeline = "1-2 months for polishing and advanced concepts."
        
    prompt = f"""
    Generate a personalized learning roadmap for the candidate to become a {job_role}.
    Their current score is {rank_score}/100.
    Expected timeline: {timeline}
    
    Current Skills: {candidate_skills}
    Skill Gaps: {skill_gaps}
    
    Return EXACTLY this JSON array format:
    [
      {{
        "id": 1, "month": "Month 1", "title": "Foundation",
        "items": [
          {{"id": "1-s1", "type": "skill", "text": "Python Advanced"}},
          {{"id": "1-p1", "type": "project", "text": "Data Dashboard"}},
          {{"id": "1-c1", "type": "course", "text": "Python for DS (Coursera)"}}
        ]
      }}
    ]
    """
    
    response = await call_llm(prompt=prompt, provider='gemini', json_mode=True)
    
    try:
        if response.startswith("```json"):
            response = response.replace("```json\n", "", 1)
        if response.startswith("```"):
            response = response.replace("```\n", "", 1)
        if response.endswith("```"):
            response = response.rsplit("```", 1)[0]
            
        data = json.loads(response.strip())
        return data
    except Exception as e:
        print(f"Error parsing roadmap JSON: {e}")
        return []
