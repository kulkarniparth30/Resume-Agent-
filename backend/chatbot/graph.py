"""LangGraph Career Copilot Graph definition with Checkpointing, Tool Calling, and Memory Updating."""

import os
import json
import re
from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from config import GEMINI_API_KEY, GROQ_API_KEY
from chatbot.state import CopilotState
from chatbot.guard import guard_node, refusal_node
from chatbot.prompts import AGENT_SYSTEM_PROMPT, MEMORY_UPDATE_PROMPT
from chatbot.memory import get_profile, save_profile, save_preference_key
from chatbot.tools import (
    get_user_profile,
    save_preference,
    search_jobs,
    match_job_to_profile,
    get_skill_gap,
    get_roadmap,
    get_ats_score,
    rewrite_resume_bullet,
    build_project_blueprint,
    generate_outreach_message,
    auto_apply_to_job
)
from services.llm_service import call_llm

ALL_TOOLS = [
    get_user_profile,
    save_preference,
    search_jobs,
    match_job_to_profile,
    get_skill_gap,
    get_roadmap,
    get_ats_score,
    rewrite_resume_bullet,
    build_project_blueprint,
    generate_outreach_message,
    auto_apply_to_job
]

def get_llm():
    """Initializes LLM with Gemini primary (gemini-3.5-flash-lite) and Groq fallback."""
    if GEMINI_API_KEY:
        try:
            return ChatGoogleGenerativeAI(
                model=os.getenv("CHATBOT_MODEL", "gemini-3.5-flash-lite"),
                google_api_key=GEMINI_API_KEY,
                temperature=0.3
            )
        except Exception as e:
            print(f"[Graph] Warning: could not initialize ChatGoogleGenerativeAI: {e}")

    if GROQ_API_KEY:
        try:
            return ChatGroq(
                model_name="openai/gpt-oss-20b",
                groq_api_key=GROQ_API_KEY,
                temperature=0.3
            )
        except Exception as e:
            print(f"[Graph] Warning: could not initialize ChatGroq: {e}")
        
    raise ValueError("Neither GROQ_API_KEY nor GEMINI_API_KEY is available!")

async def agent_node(state: CopilotState) -> dict:
    """Invokes LLM with bound tools and state history."""
    user_id = state.get("user_id", "default_user")
    prof = get_profile(user_id)
    
    # Inject current user context dynamically into system prompt
    context_str = f"\nCurrent User ID: {user_id}\nSaved Skills: {prof.get('skills', [])[:10]}\nTarget Role: {prof.get('target_role', '')}\nLocation: {prof.get('location', '')}\nPreferences: {prof.get('preferences', {})}"
    sys_msg = SystemMessage(content=AGENT_SYSTEM_PROMPT + context_str)
    
    # Keep conversation history clean and bounded to avoid TPM limit overflow
    recent_messages = list(state.get("messages", []))[-8:]
    history = [sys_msg] + recent_messages

    # Tier 1: Primary LLM (Gemini 3.5 Flash Lite)
    try:
        llm = get_llm()
        bound_llm = llm.bind_tools(ALL_TOOLS)
        response = await bound_llm.ainvoke(history)
        return {"messages": [response]}
    except Exception as e:
        print(f"[AgentNode] Primary LLM failed ({e}), trying fallback Tier 2 (Groq gpt-oss-20b)...")

    # Tier 2: Groq gpt-oss-20b
    if GROQ_API_KEY:
        try:
            fallback_llm = ChatGroq(
                model_name="openai/gpt-oss-20b",
                groq_api_key=GROQ_API_KEY,
                temperature=0.3
            ).bind_tools(ALL_TOOLS)
            response = await fallback_llm.ainvoke(history)
            return {"messages": [response]}
        except Exception as e2:
            print(f"[AgentNode] Fallback Tier 2 failed ({e2}), trying Tier 3 (Groq qwen)...")

    # Tier 3: Groq Qwen 27B
    if GROQ_API_KEY:
        try:
            fallback_llm_3 = ChatGroq(
                model_name="qwen/qwen3.8-27b",
                groq_api_key=GROQ_API_KEY,
                temperature=0.3
            ).bind_tools(ALL_TOOLS)
            response = await fallback_llm_3.ainvoke(history)
            return {"messages": [response]}
        except Exception as e3:
            print(f"[AgentNode] All tiers failed: {e3}")

    return {"messages": [AIMessage(content="I'm having trouble connecting to the AI service right now. Please try again in a moment.")]}

def route_after_guard(state: CopilotState) -> Literal["refusal", "agent"]:
    """Conditional edge after guard node."""
    if state.get("is_off_topic"):
        return "refusal"
    return "agent"

def should_continue_tools(state: CopilotState) -> Literal["tools", "memory_update"]:
    """Evaluates if the LLM requested tool execution or is ready for memory update."""
    messages = state.get("messages", [])
    if not messages:
        return "memory_update"
        
    last_msg = messages[-1]
    # Check max loop bounds: count recent tool messages
    recent_tools = [m for m in messages[-10:] if isinstance(m, ToolMessage)]
    max_loops = int(os.getenv("CHATBOT_MAX_TOOL_LOOPS", "8"))
    if len(recent_tools) >= max_loops:
        return "memory_update"
        
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return "memory_update"

async def memory_update_node(state: CopilotState) -> dict:
    """Extracts new preferences/skills from conversation and updates SQLite store."""
    user_id = state.get("user_id", "default_user")
    messages = state.get("messages", [])
    if len(messages) < 2:
        return {}
        
    # Analyze recent messages
    recent_msgs = messages[-4:]
    conv_text = "\n".join([f"{getattr(m, 'type', 'message')}: {m.content}" for m in recent_msgs])
    prof = get_profile(user_id)
    
    prompt = MEMORY_UPDATE_PROMPT.format(
        profile=json.dumps(prof),
        conversation=conv_text
    )
    
    try:
        extraction = await call_llm(prompt=prompt, provider="groq", json_mode=True)
        extraction = re.sub(r"^```json\s*", "", extraction.strip())
        extraction = re.sub(r"\s*```$", "", extraction.strip())
        data = json.loads(extraction)
        
        if not data.get("no_update"):
            if "skills" in data and isinstance(data["skills"], list):
                new_skills = list(set(prof.get("skills", []) + data["skills"]))
                save_profile(user_id, {"skills": new_skills})
            if "target_role" in data and data["target_role"]:
                save_profile(user_id, {"target_role": data["target_role"]})
            if "location" in data and data["location"]:
                save_profile(user_id, {"location": data["location"]})
            if "preferences" in data and isinstance(data["preferences"], dict):
                for k, v in data["preferences"].items():
                    save_preference_key(user_id, k, v)
    except Exception as e:
        print(f"[MemoryUpdate] Non-blocking memory update issue: {e}")
        
    return {}

# Construct the Graph
workflow = StateGraph(CopilotState)

workflow.add_node("guard", guard_node)
workflow.add_node("refusal", refusal_node)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(ALL_TOOLS))
workflow.add_node("memory_update", memory_update_node)

workflow.add_edge(START, "guard")
workflow.add_conditional_edges("guard", route_after_guard, {
    "refusal": "refusal",
    "agent": "agent"
})
workflow.add_edge("refusal", END)

workflow.add_conditional_edges("agent", should_continue_tools, {
    "tools": "tools",
    "memory_update": "memory_update"
})
workflow.add_edge("tools", "agent")
workflow.add_edge("memory_update", END)

# Compile graph
copilot_app = workflow.compile()
