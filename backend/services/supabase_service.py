import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials not configured.")
        return None
        
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return supabase_client
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return None

# --- Auth Operations ---

def sign_up_user(email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
    client = get_supabase_client()
    if not client:
        raise Exception("Supabase is not configured.")
    
    data = {
        "email": email,
        "password": password,
    }
    if name:
        data["options"] = {"data": {"full_name": name, "name": name}}
        
    response = client.auth.sign_up(data)
    user = response.user
    session = response.session
    
    return {
        "user": {
            "id": user.id if user else None,
            "email": user.email if user else email,
            "name": name or (user.user_metadata.get("name") if user and user.user_metadata else "")
        },
        "token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None
    }

def sign_in_user(email: str, password: str) -> Dict[str, Any]:
    client = get_supabase_client()
    if not client:
        raise Exception("Supabase is not configured.")
        
    response = client.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    
    user = response.user
    session = response.session
    
    return {
        "user": {
            "id": user.id if user else None,
            "email": user.email if user else email,
            "name": user.user_metadata.get("name", user.user_metadata.get("full_name", "")) if user and user.user_metadata else ""
        },
        "token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None
    }

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    client = get_supabase_client()
    if not client or not token:
        return None
        
    try:
        response = client.auth.get_user(token)
        user = response.user
        if user:
            return {
                "id": user.id,
                "email": user.email,
                "name": user.user_metadata.get("name", user.user_metadata.get("full_name", "")) if user.user_metadata else ""
            }
    except Exception as e:
        print(f"Error validating Supabase token: {e}")
    return None

# --- Database History Operations ---

def save_analysis(
    user_id: Optional[str],
    job_role: str,
    jd_text: Optional[str],
    resume_text: Optional[str],
    analysis_result: Dict[str, Any]
) -> Dict[str, Any]:
    client = get_supabase_client()
    record = {
        "user_id": user_id,
        "job_role": job_role,
        "jd_text": jd_text or "",
        "resume_text": resume_text or "",
        "analysis_result": analysis_result
    }
    
    if client:
        try:
            res = client.table("analysis_history").insert(record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Warning: Could not persist analysis to Supabase table 'analysis_history': {e}")
            
    # Return local record representation if table insert not completed
    return {
        "id": "local-" + str(os.urandom(4).hex()),
        **record
    }

def fetch_user_analyses(user_id: Optional[str]) -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if not client or not user_id:
        return []
        
    try:
        res = client.table("analysis_history").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching analyses from Supabase: {e}")
        return []

def delete_analysis(analysis_id: Any, user_id: Optional[str]) -> bool:
    client = get_supabase_client()
    if not client:
        return False
        
    try:
        query = client.table("analysis_history").delete().eq("id", analysis_id)
        if user_id:
            query = query.eq("user_id", user_id)
        query.execute()
        return True
    except Exception as e:
        print(f"Error deleting analysis from Supabase: {e}")
        return False
