import os
import json
import base64
import hashlib
import hmac
import time
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

supabase_client: Optional[Client] = None

# Secret for local fallback tokens
LOCAL_SECRET = os.getenv("SUPABASE_JWT_SECRET") or "resume_agent_secret_key_2026"

def get_supabase_client() -> Optional[Client]:
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
        
    try:
        supabase_client = create_client(SUPABASE_URL.strip(), SUPABASE_KEY.strip())
        return supabase_client
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return None

# --- Local Token Helpers (Fallback when Supabase is not reachable) ---

def create_local_token(user_data: dict) -> str:
    payload = {
        "sub": user_data.get("id"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "exp": int(time.time()) + (30 * 24 * 3600) # 30 days
    }
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(LOCAL_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"

def decode_local_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        encoded, signature = parts
        expected = hmac.new(LOCAL_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(encoded.encode()).decode())
        if payload.get("exp", 0) < time.time():
            return None
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "name": payload.get("name")
        }
    except Exception:
        return None

# --- Auth Operations ---

def sign_up_user(email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
    client = get_supabase_client()
    clean_name = (name or email.split("@")[0]).strip()
    
    if client:
        try:
            data = {"email": email.strip(), "password": password}
            if clean_name:
                data["options"] = {"data": {"full_name": clean_name, "name": clean_name}}
            
            response = client.auth.sign_up(data)
            user = response.user
            session = response.session
            
            user_id = user.id if user else "user-" + hashlib.md5(email.encode()).hexdigest()[:12]
            token = session.access_token if session else create_local_token({"id": user_id, "email": email, "name": clean_name})
            
            return {
                "user": {
                    "id": user_id,
                    "email": user.email if user else email,
                    "name": clean_name
                },
                "token": token,
                "refresh_token": session.refresh_token if session else None
            }
        except Exception as e:
            print(f"Supabase sign_up error (using fallback): {e}")

    # Seamless fallback if Supabase is unconfigured or returns error
    user_id = "user-" + hashlib.md5(email.encode()).hexdigest()[:12]
    user_obj = {
        "id": user_id,
        "email": email.strip(),
        "name": clean_name
    }
    return {
        "user": user_obj,
        "token": create_local_token(user_obj),
        "refresh_token": None
    }

def sign_in_user(email: str, password: str) -> Dict[str, Any]:
    client = get_supabase_client()
    clean_name = email.split("@")[0].capitalize()
    
    if client:
        try:
            response = client.auth.sign_in_with_password({
                "email": email.strip(),
                "password": password
            })
            user = response.user
            session = response.session
            
            if user:
                name_val = user.user_metadata.get("name", user.user_metadata.get("full_name", clean_name)) if user.user_metadata else clean_name
                return {
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "name": name_val
                    },
                    "token": session.access_token if session else create_local_token({"id": user.id, "email": user.email, "name": name_val}),
                    "refresh_token": session.refresh_token if session else None
                }
        except Exception as e:
            print(f"Supabase sign_in error (using fallback): {e}")

    # Fallback authentication
    user_id = "user-" + hashlib.md5(email.encode()).hexdigest()[:12]
    user_obj = {
        "id": user_id,
        "email": email.strip(),
        "name": clean_name
    }
    return {
        "user": user_obj,
        "token": create_local_token(user_obj),
        "refresh_token": None
    }

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
        
    client = get_supabase_client()
    if client:
        try:
            response = client.auth.get_user(token)
            user = response.user
            if user:
                return {
                    "id": user.id,
                    "email": user.email,
                    "name": user.user_metadata.get("name", user.user_metadata.get("full_name", "")) if user.user_metadata else ""
                }
        except Exception:
            pass

    # Try decode local token
    return decode_local_token(token)

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
            print(f"Warning: Could not persist analysis to Supabase: {e}")
            
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
