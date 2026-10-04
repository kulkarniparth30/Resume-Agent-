"""Persistent SQLite memory store for user profiles and preferences."""

import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "copilot.db")

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                skills TEXT DEFAULT '[]',
                target_role TEXT DEFAULT '',
                location TEXT DEFAULT '',
                experience_level TEXT DEFAULT '',
                resume_text TEXT DEFAULT '',
                last_analysis TEXT DEFAULT '{}',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                remote_preference TEXT DEFAULT '',
                role_types TEXT DEFAULT '[]',
                min_salary TEXT DEFAULT '',
                industries TEXT DEFAULT '[]',
                custom TEXT DEFAULT '{}',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS thread_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_key TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

init_db()

def get_profile(user_id: str) -> Dict[str, Any]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        
        pref_cursor = conn.cursor()
        pref_cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
        pref_row = pref_cursor.fetchone()
        
        preferences = {}
        if pref_row:
            try:
                role_types = json.loads(pref_row["role_types"] or "[]")
            except Exception:
                role_types = []
            try:
                industries = json.loads(pref_row["industries"] or "[]")
            except Exception:
                industries = []
            try:
                custom = json.loads(pref_row["custom"] or "{}")
            except Exception:
                custom = {}
                
            preferences = {
                "remote_preference": pref_row["remote_preference"] or "",
                "role_types": role_types,
                "min_salary": pref_row["min_salary"] or "",
                "industries": industries,
                "custom": custom
            }

        if not row:
            return {
                "user_id": user_id,
                "skills": [],
                "target_role": "",
                "location": "",
                "experience_level": "",
                "resume_text": "",
                "last_analysis": {},
                "preferences": preferences
            }

        try:
            skills = json.loads(row["skills"] or "[]")
        except Exception:
            skills = []
        try:
            last_analysis = json.loads(row["last_analysis"] or "{}")
        except Exception:
            last_analysis = {}

        return {
            "user_id": user_id,
            "skills": skills,
            "target_role": row["target_role"] or "",
            "location": row["location"] or "",
            "experience_level": row["experience_level"] or "",
            "resume_text": row["resume_text"] or "",
            "last_analysis": last_analysis,
            "preferences": preferences
        }

def save_profile(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    init_db()
    current = get_profile(user_id)
    
    # Merge updates
    skills = data.get("skills", current.get("skills", []))
    target_role = data.get("target_role", current.get("target_role", ""))
    location = data.get("location", current.get("location", ""))
    experience_level = data.get("experience_level", current.get("experience_level", ""))
    resume_text = data.get("resume_text", current.get("resume_text", ""))
    last_analysis = data.get("last_analysis", current.get("last_analysis", {}))
    
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profiles (user_id, skills, target_role, location, experience_level, resume_text, last_analysis, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                skills = excluded.skills,
                target_role = excluded.target_role,
                location = excluded.location,
                experience_level = excluded.experience_level,
                resume_text = excluded.resume_text,
                last_analysis = excluded.last_analysis,
                updated_at = excluded.updated_at
        """, (
            user_id,
            json.dumps(skills),
            target_role,
            location,
            experience_level,
            resume_text,
            json.dumps(last_analysis),
            datetime.utcnow().isoformat()
        ))
        conn.commit()
    return get_profile(user_id)

def save_preference_key(user_id: str, key: str, value: Any) -> Dict[str, Any]:
    init_db()
    current_prof = get_profile(user_id)
    prefs = current_prof.get("preferences", {})
    
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        if key in ["remote", "remote_preference"]:
            prefs["remote_preference"] = str(value)
        elif key in ["role_types", "role_type"]:
            val_list = [value] if isinstance(value, str) else list(value)
            prefs["role_types"] = list(set(prefs.get("role_types", []) + val_list))
        elif key in ["min_salary", "salary"]:
            prefs["min_salary"] = str(value)
        elif key in ["industries", "industry"]:
            val_list = [value] if isinstance(value, str) else list(value)
            prefs["industries"] = list(set(prefs.get("industries", []) + val_list))
        else:
            custom = prefs.get("custom", {})
            custom[key] = value
            prefs["custom"] = custom

        cursor.execute("""
            INSERT INTO user_preferences (user_id, remote_preference, role_types, min_salary, industries, custom, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                remote_preference = excluded.remote_preference,
                role_types = excluded.role_types,
                min_salary = excluded.min_salary,
                industries = excluded.industries,
                custom = excluded.custom,
                updated_at = excluded.updated_at
        """, (
            user_id,
            prefs.get("remote_preference", ""),
            json.dumps(prefs.get("role_types", [])),
            prefs.get("min_salary", ""),
            json.dumps(prefs.get("industries", [])),
            json.dumps(prefs.get("custom", {})),
            datetime.utcnow().isoformat()
        ))
        conn.commit()
        
    return prefs

def seed_profile_from_history(user_id: str, analyses: list) -> None:
    if not analyses:
        return
    latest = analyses[0]
    analysis_res = latest.get("analysis_result") or latest.get("result") or {}
    job_role = latest.get("job_role", "")
    resume_text = latest.get("resume_text", "")
    candidate_skills = analysis_res.get("candidate_skills", [])
    
    current = get_profile(user_id)
    updated_skills = list(set(current.get("skills", []) + candidate_skills))
    
    save_profile(user_id, {
        "skills": updated_skills,
        "target_role": current.get("target_role") or job_role,
        "resume_text": current.get("resume_text") or resume_text,
        "last_analysis": analysis_res if analysis_res else current.get("last_analysis", {})
    })

def save_thread_message(thread_key: str, role: str, content: str) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO thread_messages (thread_key, role, content) VALUES (?, ?, ?)",
            (thread_key, role, content)
        )
        conn.commit()

def get_thread_messages(thread_key: str, limit: int = 30) -> list:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM thread_messages WHERE thread_key = ? ORDER BY id ASC LIMIT ?",
            (thread_key, limit)
        )
        rows = cursor.fetchall()
        return [{"role": r["role"], "content": r["content"]} for r in rows]
