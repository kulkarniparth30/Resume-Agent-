import os
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "copilot.db")

def init_roadmaps_table():
    os.makedirs(DB_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                title TEXT NOT NULL,
                timeline TEXT DEFAULT '',
                rank_score INTEGER DEFAULT 50,
                roadmap_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

init_roadmaps_table()

def save_roadmap_record(
    user_id: str,
    role: str,
    roadmap_data: List[Dict[str, Any]],
    rank_score: int = 50,
    timeline: str = "",
    title: str = ""
) -> Dict[str, Any]:
    """Save or update a roadmap record for a user in SQLite."""
    init_roadmaps_table()
    if not title:
        title = f"{role} Learning Roadmap"
    
    if not timeline:
        if rank_score < 40:
            timeline = "4-6 months"
        elif rank_score < 70:
            timeline = "3-4 months"
        else:
            timeline = "1-2 months"

    roadmap_json = json.dumps(roadmap_data)
    now = datetime.utcnow().isoformat()

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check if an existing roadmap for same user and role exists
        cursor.execute(
            "SELECT id FROM saved_roadmaps WHERE user_id = ? AND LOWER(role) = LOWER(?)",
            (user_id, role)
        )
        existing = cursor.fetchone()
        
        if existing:
            roadmap_id = existing["id"]
            cursor.execute("""
                UPDATE saved_roadmaps
                SET title = ?, timeline = ?, rank_score = ?, roadmap_data = ?, updated_at = ?
                WHERE id = ?
            """, (title, timeline, rank_score, roadmap_json, now, roadmap_id))
        else:
            cursor.execute("""
                INSERT INTO saved_roadmaps (user_id, role, title, timeline, rank_score, roadmap_data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, role, title, timeline, rank_score, roadmap_json, now, now))
            roadmap_id = cursor.lastrowid
            
        conn.commit()

        cursor.execute("SELECT * FROM saved_roadmaps WHERE id = ?", (roadmap_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "role": row["role"],
            "title": row["title"],
            "timeline": row["timeline"],
            "rank_score": row["rank_score"],
            "roadmap_data": roadmap_data,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }

def get_saved_roadmaps(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all saved roadmaps for a user, sorted by most recent first."""
    init_roadmaps_table()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM saved_roadmaps WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        results = []
        for r in rows:
            try:
                data = json.loads(r["roadmap_data"])
            except Exception:
                data = []
            results.append({
                "id": r["id"],
                "user_id": r["user_id"],
                "role": r["role"],
                "title": r["title"],
                "timeline": r["timeline"],
                "rank_score": r["rank_score"],
                "roadmap_data": data,
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            })
        return results

def delete_saved_roadmap(roadmap_id: int, user_id: Optional[str] = None) -> bool:
    """Delete a saved roadmap by its ID."""
    init_roadmaps_table()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM saved_roadmaps WHERE id = ? AND user_id = ?", (roadmap_id, user_id))
        else:
            cursor.execute("DELETE FROM saved_roadmaps WHERE id = ?", (roadmap_id,))
        conn.commit()
        return cursor.rowcount > 0
