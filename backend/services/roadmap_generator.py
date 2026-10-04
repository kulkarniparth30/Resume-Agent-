import json
import re
from .llm_service import call_llm

def get_fallback_roadmap(job_role: str) -> list:
    role_lower = job_role.lower()
    if "agent" in role_lower or "ai" in role_lower:
        return [
            {
                "id": 1,
                "month": "Month 1",
                "title": "LLM & Agent Architectures",
                "items": [
                    {"id": "1-s1", "type": "skill", "text": "LangGraph & StateGraph Multi-Agent Workflows"},
                    {"id": "1-s2", "type": "skill", "text": "Function Calling & Structured Outputs"},
                    {"id": "1-p1", "type": "project", "text": "Build Autonomous Research Agent with Search & Memory"},
                    {"id": "1-c1", "type": "course", "text": "DeepLearning.AI: Multi-Agent Systems with LangGraph"}
                ]
            },
            {
                "id": 2,
                "month": "Month 2",
                "title": "RAG, Vector DBs & Memory",
                "items": [
                    {"id": "2-s1", "type": "skill", "text": "Advanced RAG (Hybrid Search, Re-ranking)"},
                    {"id": "2-s2", "type": "skill", "text": "ChromaDB / Pinecone Vector Store Integration"},
                    {"id": "2-p1", "type": "project", "text": "Knowledge Graph-enhanced Chatbot with Long-Term Memory"},
                    {"id": "2-c1", "type": "course", "text": "LangChain Academy: Production-Ready RAG"}
                ]
            },
            {
                "id": 3,
                "month": "Month 3",
                "title": "Evaluation, Tool Use & Deployment",
                "items": [
                    {"id": "3-s1", "type": "skill", "text": "Agent Evaluation (RAGAS, TruLens)"},
                    {"id": "3-s2", "type": "skill", "text": "FastAPI SSE Streaming & Docker Deployment"},
                    {"id": "3-p1", "type": "project", "text": "End-to-End Enterprise Agentic Copilot with Full Observability"},
                    {"id": "3-c1", "type": "course", "text": "Full Stack LLM BootCamp / Weights & Biases"}
                ]
            }
        ]
    
    return [
        {
            "id": 1,
            "month": "Month 1",
            "title": "Core Foundations & Patterns",
            "items": [
                {"id": "1-s1", "type": "skill", "text": f"Core skills for {job_role}"},
                {"id": "1-p1", "type": "project", "text": "Hands-on Architecture Project"},
                {"id": "1-c1", "type": "course", "text": f"Professional {job_role} Fundamentals"}
            ]
        },
        {
            "id": 2,
            "month": "Month 2",
            "title": "Advanced Development & Tooling",
            "items": [
                {"id": "2-s1", "type": "skill", "text": "Design Patterns & API Optimization"},
                {"id": "2-p1", "type": "project", "text": "Production-grade Full Stack Service"},
                {"id": "2-c1", "type": "course", "text": "System Design & Cloud Architecture"}
            ]
        },
        {
            "id": 3,
            "month": "Month 3",
            "title": "Testing, Deployment & Scale",
            "items": [
                {"id": "3-s1", "type": "skill", "text": "CI/CD, Monitoring & Containerization"},
                {"id": "3-p1", "type": "project", "text": "Portfolio Capstone Deployment"},
                {"id": "3-c1", "type": "course", "text": "Cloud Infrastructure & DevOps"}
            ]
        }
    ]

async def generate_roadmap(candidate_skills: list, skill_gaps: list, job_role: str, rank_score: int) -> list:
    timeline = ""
    if rank_score < 40:
        timeline = "4-6 months focusing on foundational skills."
    elif rank_score < 70:
        timeline = "3-4 months targeting specific skill gaps."
    else:
        timeline = "1-2 months for polishing and advanced concepts."
        
    prompt = f"""
    Generate a comprehensive personalized learning roadmap for the candidate to become a {job_role}.
    Their current score is {rank_score}/100.
    Expected timeline: {timeline}
    
    Current Skills: {candidate_skills}
    Skill Gaps to master: {skill_gaps}
    
    Return EXACTLY a JSON array where each month object has:
    - id: number
    - month: string (e.g. "Month 1")
    - title: string describing the theme/phase
    - items: array of objects with id (string), type ("skill" | "project" | "course"), and text (string)
    
    Example format:
    [
      {{
        "id": 1,
        "month": "Month 1",
        "title": "Foundations & Core Frameworks",
        "items": [
          {{"id": "1-s1", "type": "skill", "text": "Python Async & Type Hinting"}},
          {{"id": "1-p1", "type": "project", "text": "Multi-agent Task Coordinator"}},
          {{"id": "1-c1", "type": "course", "text": "Coursera: Advanced Engineering"}}
        ]
      }}
    ]
    """
    
    try:
        response = await call_llm(prompt=prompt, provider='gemini', json_mode=True)
    except Exception as e:
        print(f"Roadmap call_llm failed: {e}")
        return get_fallback_roadmap(job_role)
    
    try:
        cleaned = response.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json", 1)[1]
            if "```" in cleaned:
                cleaned = cleaned.split("```", 1)[0]
        elif "```" in cleaned:
            cleaned = cleaned.split("```", 1)[1]
            if "```" in cleaned:
                cleaned = cleaned.split("```", 1)[0]
                
        cleaned = cleaned.strip()
        data = json.loads(cleaned)
        
        if isinstance(data, dict):
            for k in ["roadmap", "months", "timeline", "data", "schedule"]:
                if k in data and isinstance(data[k], list):
                    return data[k]
            # If dict has numeric keys or values
            values = list(data.values())
            if values and isinstance(values[0], list):
                return values[0]
                
        if isinstance(data, list) and len(data) > 0:
            return data
            
        return get_fallback_roadmap(job_role)
    except Exception as e:
        print(f"Error parsing roadmap JSON: {e}, raw was: {response[:200]}")
        return get_fallback_roadmap(job_role)
