import json
import re
from .llm_service import call_llm

# In-memory server cache to store generated project guides
_project_guide_cache = {}

async def get_project_guide(name: str, description: str, skills: list) -> dict:
    cache_key = name.strip().lower()
    if cache_key in _project_guide_cache:
        return _project_guide_cache[cache_key]

    prompt = f"""
You are an expert software architect and developer. The user wants to build a project with the following details:
Project Name: {name}
Description: {description}
Skills/Technologies: {', '.join(skills)}

Please generate a step-by-step roadmap and guide for building this project.
Return the response as a valid JSON object with the following structure exactly (and no additional text):
{{
  "architecture": "Brief description of the architecture.",
  "prerequisites": ["List of things to know or install"],
  "steps": [
    {{
      "title": "Step 1 Title",
      "description": "What to do in this step",
      "tips": ["Tip 1", "Tip 2"]
    }}
  ],
  "resources": [
    {{"name": "Docs/Lib Name", "url": "url"}}
  ]
}}
"""
    response_text = await call_llm(prompt=prompt, json_mode=True)
    response_text = re.sub(r'^```json\s*', '', response_text.strip())
    response_text = re.sub(r'\s*```$', '', response_text.strip())
    
    try:
        data = json.loads(response_text)
        _project_guide_cache[cache_key] = data
        return data
    except Exception as e:
        print(f"Error parsing project guide JSON: {e}")
        fallback_data = {
            "architecture": f"Standard modular architecture for {name}",
            "prerequisites": skills,
            "steps": [
                {
                    "title": "Setup & Environment",
                    "description": f"Initialize the repository and configure dependencies for {', '.join(skills)}.",
                    "tips": ["Use virtual environments or containerization."]
                },
                {
                    "title": "Core Implementation",
                    "description": description,
                    "tips": ["Break logic into reusable components."]
                },
                {
                    "title": "Testing & Deployment",
                    "description": "Write automated tests and deploy the project.",
                    "tips": ["Set up CI/CD workflows."]
                }
            ],
            "resources": []
        }
        _project_guide_cache[cache_key] = fallback_data
        return fallback_data
