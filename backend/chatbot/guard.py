"""Guard node for topic classification to enforce career/job domain boundaries."""

import re
from services.llm_service import call_llm
from chatbot.prompts import GUARD_SYSTEM_PROMPT
from chatbot.state import CopilotState
from langchain_core.messages import AIMessage

REFUSAL_MESSAGE = "I am Career Copilot, dedicated exclusively to assisting with your career, jobs, resume analysis, ATS optimization, and professional skill roadmaps. I cannot answer queries outside this domain."

CAREER_KEYWORDS = {
    "roadmap", "learn", "learning", "study", "skills", "skill", "job", "jobs", 
    "career", "careers", "interview", "interviews", "resume", "cv", "ats", 
    "salary", "hire", "hiring", "apply", "application", "developer", "engineer",
    "analyst", "scientist", "fresher", "intern", "internship", "bullet", "bullets",
    "project", "blueprint", "outreach", "tech", "ai", "agentic", "ml", "python",
    "fastapi", "react", "backend", "frontend", "devops", "cloud", "aws", "docker",
    "portfolio", "course", "certifications", "role", "work", "experience"
}

async def guard_node(state: CopilotState) -> dict:
    """Classifies the last user message as career_related or off_topic."""
    messages = state.get("messages", [])
    if not messages:
        return {"is_off_topic": False}
        
    last_msg = messages[-1]
    user_text = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
    user_text_lower = user_text.lower()
    
    # Fast whitelist: if prompt contains core career, learning, or technical domain words, allow immediately
    words = set(re.findall(r'\b[a-z]+\b', user_text_lower))
    if words.intersection(CAREER_KEYWORDS):
        return {"is_off_topic": False}
    
    prompt = f"Message:\n{user_text}\n\nClassification:"
    
    try:
        res = await call_llm(prompt=prompt, system_prompt=GUARD_SYSTEM_PROMPT, provider="gemini")
        decision = res.strip().lower()
        is_off_topic = "off_topic" in decision
        return {"is_off_topic": is_off_topic}
    except Exception as e:
        print(f"[GuardNode] Error evaluating guard: {e}")
        # Default to safe passing
        return {"is_off_topic": False}

async def refusal_node(state: CopilotState) -> dict:
    """Returns standard polite refusal and prevents tool calls."""
    return {
        "messages": [AIMessage(content=REFUSAL_MESSAGE)],
        "is_off_topic": True
    }
