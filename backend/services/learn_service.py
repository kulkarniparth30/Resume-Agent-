import json
import re
from .llm_service import call_llm

async def get_learning_resources(skill: str, job_role: str, user_level: str = 'intermediate') -> dict:
    prompt = f"""
Provide REAL, SPECIFIC learning resources for the skill '{skill}' tailored to a '{user_level}' level individual aiming for a '{job_role}' role.
The resources must include:
- 5 YouTube videos (with real channel names like freeCodeCamp, Fireship, Traversy Media, 3Blue1Brown, etc.)
- 4 articles/tutorials (from real sites like MDN, Real Python, Medium, dev.to, etc.)
- 3 research papers/documentation links (from arxiv, official docs, etc.)

For each resource, include: title, url, description, source, difficulty (beginner/intermediate/advanced).
Return a JSON object with the following structure:
{{
  "youtube": [
    {{"title": "...", "url": "...", "description": "...", "source": "...", "difficulty": "..."}}
  ],
  "articles": [
    {{"title": "...", "url": "...", "description": "...", "source": "...", "difficulty": "..."}}
  ],
  "papers": [
    {{"title": "...", "url": "...", "description": "...", "source": "...", "difficulty": "..."}}
  ]
}}
"""
    response_text = await call_llm(prompt, json_mode=True)
    # Strip markdown if any
    response_text = re.sub(r'^```json\n', '', response_text)
    response_text = re.sub(r'\n```$', '', response_text)
    response_text = response_text.strip('` \n')
    
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        return {"youtube": [], "articles": [], "papers": []}
