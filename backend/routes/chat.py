"""FastAPI routes for the Career Copilot chatbot."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from typing import Optional, List, Dict, Any
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

from chatbot.graph import copilot_app
from chatbot.memory import (
    get_profile, 
    seed_profile_from_history, 
    save_preference_key,
    save_thread_message,
    get_thread_messages
)
from services.supabase_service import fetch_user_analyses
from routes.auth import get_current_user_optional

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    thread_id: Optional[str] = "default_thread"
    message: str

class ChatResponse(BaseModel):
    response: str
    is_off_topic: bool
    tool_calls_made: List[str] = []
    profile: Dict[str, Any]

class UpdatePreferenceRequest(BaseModel):
    key: str
    value: Any

# In-memory thread history cache for multi-turn sessions
SESSION_THREADS: Dict[str, List[Any]] = {}

@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    effective_user_id = (user.get("id") if user else req.user_id) or "guest_user"
    
    # Check if profile should be seeded from existing resume analysis
    current_prof = get_profile(effective_user_id)
    if not current_prof.get("skills"):
        analyses = fetch_user_analyses(effective_user_id)
        if analyses:
            seed_profile_from_history(effective_user_id, analyses)
            
    thread_key = f"{effective_user_id}:{req.thread_id or 'default'}"
    if thread_key not in SESSION_THREADS:
        db_msgs = get_thread_messages(thread_key)
        reconstructed = []
        for dm in db_msgs:
            if dm["role"] == "user":
                reconstructed.append(HumanMessage(content=dm["content"]))
            elif dm["role"] == "assistant":
                reconstructed.append(AIMessage(content=dm["content"]))
        SESSION_THREADS[thread_key] = reconstructed

    past_messages = SESSION_THREADS.get(thread_key, [])
    
    new_human_msg = HumanMessage(content=req.message)
    incoming_messages = past_messages + [new_human_msg]
    
    state_input = {
        "messages": incoming_messages,
        "user_id": effective_user_id,
        "is_off_topic": False
    }
    
    try:
        final_state = await copilot_app.ainvoke(state_input)
    except Exception as e:
        print(f"[ChatRoute] Error executing copilot graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    all_msgs = final_state.get("messages", [])
    
    # Save to session thread cache (keeping last 20 messages)
    SESSION_THREADS[thread_key] = all_msgs[-20:]
    
    # Find tool calls made during this run
    tools_called = []
    for m in all_msgs[len(past_messages):]:
        if hasattr(m, "tool_calls") and m.tool_calls:
            for tc in m.tool_calls:
                tools_called.append(tc.get("name", "tool"))
                
    # Extract final text
    final_text = "I'm here to assist with your career goals."
    for m in reversed(all_msgs):
        if isinstance(m, AIMessage) and m.content:
            raw_c = m.content
            if isinstance(raw_c, list):
                final_text = " ".join([b.get("text", str(b)) if isinstance(b, dict) else str(b) for b in raw_c])
            else:
                final_text = str(raw_c)
            break
            
    # Persist turns to SQLite for long-term thread history
    try:
        save_thread_message(thread_key, "user", req.message)
        save_thread_message(thread_key, "assistant", final_text)
    except Exception as db_err:
        print(f"[ChatRoute] Non-fatal thread save error: {db_err}")

    updated_profile = get_profile(effective_user_id)
    
    return ChatResponse(
        response=final_text,
        is_off_topic=final_state.get("is_off_topic", False),
        tool_calls_made=tools_called,
        profile=updated_profile
    )

@router.post("/stream")
async def chat_stream_endpoint(req: ChatRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    effective_user_id = (user.get("id") if user else req.user_id) or "guest_user"
    
    current_prof = get_profile(effective_user_id)
    if not current_prof.get("skills"):
        analyses = fetch_user_analyses(effective_user_id)
        if analyses:
            seed_profile_from_history(effective_user_id, analyses)
            
    thread_key = f"{effective_user_id}:{req.thread_id or 'default'}"
    if thread_key not in SESSION_THREADS:
        db_msgs = get_thread_messages(thread_key)
        reconstructed = []
        for dm in db_msgs:
            if dm["role"] == "user":
                reconstructed.append(HumanMessage(content=dm["content"]))
            elif dm["role"] == "assistant":
                reconstructed.append(AIMessage(content=dm["content"]))
        SESSION_THREADS[thread_key] = reconstructed

    past_messages = SESSION_THREADS.get(thread_key, [])
    new_human_msg = HumanMessage(content=req.message)
    incoming_messages = past_messages + [new_human_msg]
    
    state_input = {
        "messages": incoming_messages,
        "user_id": effective_user_id,
        "is_off_topic": False
    }

    async def event_generator():
        accumulated_text = []
        tools_called = []
        is_off_topic = False
        saved_roadmap_info = None

        def safe_sse(obj: dict) -> str:
            try:
                return f"data: {json.dumps(obj, default=str)}\n\n"
            except Exception as ser_err:
                return f"data: {json.dumps({'type': 'error', 'error': str(ser_err)}, default=str)}\n\n"

        try:
            async for event in copilot_app.astream_events(state_input, version="v2"):
                kind = event.get("event")
                
                if kind == "on_chain_end" and event.get("name") == "guard":
                    guard_output = event["data"].get("output", {})
                    if guard_output.get("is_off_topic"):
                        is_off_topic = True

                elif kind == "on_tool_start":
                    tool_name = event.get("name", "tool")
                    tools_called.append(tool_name)
                    tool_input = event["data"].get("input", {})
                    yield safe_sse({'type': 'tool_start', 'tool': tool_name, 'input': tool_input})

                elif kind == "on_tool_end":
                    tool_name = event.get("name", "tool")
                    tool_out = event.get("data", {}).get("output")
                    if tool_name == "get_roadmap":
                        if hasattr(tool_out, "content"):
                            try:
                                saved_roadmap_info = json.loads(tool_out.content) if isinstance(tool_out.content, str) else tool_out.content
                            except Exception:
                                saved_roadmap_info = str(tool_out.content)
                        elif isinstance(tool_out, dict):
                            saved_roadmap_info = tool_out

                    yield safe_sse({'type': 'tool_end', 'tool': tool_name})

                elif kind == "on_chat_model_stream":
                    chunk = event["data"].get("chunk")
                    if chunk and hasattr(chunk, "content"):
                        content = chunk.content
                        token_str = ""
                        if isinstance(content, str):
                            token_str = content
                        elif isinstance(content, list):
                            for item in content:
                                if isinstance(item, dict) and item.get("type") == "text":
                                    token_str += item.get("text", "")
                                elif isinstance(item, str):
                                    token_str += item
                        if token_str:
                            accumulated_text.append(token_str)
                            yield safe_sse({'type': 'token', 'content': token_str})

        except Exception as e:
            print(f"[ChatStream] Streaming error: {e}")
            yield safe_sse({'type': 'error', 'error': str(e)})

        final_response_text = "".join(accumulated_text).strip() or "I'm here to assist with your career goals."

        # If get_roadmap was called, guarantee we attach the latest saved roadmap
        if "get_roadmap" in tools_called and not saved_roadmap_info:
            try:
                from services.roadmap_service import get_saved_roadmaps
                rms = get_saved_roadmaps(effective_user_id)
                if rms:
                    saved_roadmap_info = rms[0]
            except Exception as rm_err:
                print(f"[ChatStream] Non-fatal roadmap lookup error: {rm_err}")

        # Ensure saved_roadmap_info is JSON safe
        clean_roadmap = None
        if saved_roadmap_info:
            if isinstance(saved_roadmap_info, dict):
                clean_roadmap = {
                    "id": saved_roadmap_info.get("id"),
                    "role": saved_roadmap_info.get("role") or saved_roadmap_info.get("target_role"),
                    "title": saved_roadmap_info.get("title"),
                    "timeline": saved_roadmap_info.get("timeline"),
                    "rank_score": saved_roadmap_info.get("rank_score", 60),
                    "roadmap": saved_roadmap_info.get("roadmap") or saved_roadmap_info.get("roadmap_data", [])
                }
            elif hasattr(saved_roadmap_info, "content"):
                try:
                    clean_roadmap = json.loads(saved_roadmap_info.content)
                except Exception:
                    clean_roadmap = str(saved_roadmap_info.content)

        try:
            save_thread_message(thread_key, "user", req.message)
            save_thread_message(thread_key, "assistant", final_response_text)
            SESSION_THREADS[thread_key] = (past_messages + [new_human_msg, AIMessage(content=final_response_text)])[-20:]
        except Exception as db_err:
            print(f"[ChatStream] DB save error: {db_err}")

        updated_profile = get_profile(effective_user_id)
        yield safe_sse({
            'type': 'done',
            'response': final_response_text,
            'is_off_topic': is_off_topic,
            'tool_calls_made': list(set(tools_called)),
            'profile': updated_profile,
            'saved_roadmap': clean_roadmap
        })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/profile/{user_id}")
async def get_user_profile_endpoint(user_id: str):
    try:
        return get_profile(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/{user_id}/preference")
async def update_user_preference_endpoint(user_id: str, req: UpdatePreferenceRequest):
    try:
        return save_preference_key(user_id, req.key, req.value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
