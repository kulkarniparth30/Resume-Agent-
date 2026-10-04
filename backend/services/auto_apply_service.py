import json
import sqlite3
import os
import datetime
import re
from typing import List, Dict, Tuple, Optional, Any

from services.llm_service import call_llm
from chatbot.memory import get_profile

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "copilot.db")

def init_applications_table():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            job_title TEXT NOT NULL,
            company TEXT NOT NULL,
            job_url TEXT DEFAULT '',
            job_skills TEXT DEFAULT '[]',
            match_percentage INTEGER DEFAULT 0,
            cover_letter TEXT DEFAULT '',
            custom_bullets TEXT DEFAULT '[]',
            application_summary TEXT DEFAULT '',
            status TEXT DEFAULT 'prepared',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_applications_table()

def compute_match(user_skills: List[str], job_skills: List[str]) -> Tuple[int, List[str], List[str]]:
    if not job_skills:
        return 0, [], []
    
    matched_skills = []
    missing_skills = []
    
    user_skills_lower = [s.lower() for s in user_skills]
    
    for req_skill in job_skills:
        req_lower = req_skill.lower()
        if any(req_lower in u or u in req_lower for u in user_skills_lower):
            matched_skills.append(req_skill)
        else:
            missing_skills.append(req_skill)
            
    match_percentage = int((len(matched_skills) / len(job_skills)) * 100)
    return match_percentage, matched_skills, missing_skills

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def save_application(user_id, job_title, company, job_url, job_skills, match_percentage, cover_letter, custom_bullets, application_summary) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    job_skills_json = json.dumps(job_skills)
    custom_bullets_json = json.dumps(custom_bullets)
    
    cursor.execute('''
        INSERT INTO job_applications 
        (user_id, job_title, company, job_url, job_skills, match_percentage, cover_letter, custom_bullets, application_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, job_title, company, job_url, job_skills_json, match_percentage, cover_letter, custom_bullets_json, application_summary))
    
    app_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute('SELECT * FROM job_applications WHERE id = ?', (app_id,))
    record = cursor.fetchone()
    conn.close()
    
    if record:
        try:
            record['job_skills'] = json.loads(record['job_skills'])
        except json.JSONDecodeError:
            pass
        try:
            record['custom_bullets'] = json.loads(record['custom_bullets'])
        except json.JSONDecodeError:
            pass
            
    return record

def get_applications(user_id) -> list:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM job_applications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    for row in rows:
        try:
            row['job_skills'] = json.loads(row['job_skills'])
        except json.JSONDecodeError:
            pass
        try:
            row['custom_bullets'] = json.loads(row['custom_bullets'])
        except json.JSONDecodeError:
            pass
            
    return rows

def update_application_status(application_id, new_status) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    updated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        UPDATE job_applications 
        SET status = ?, updated_at = ?
        WHERE id = ?
    ''', (new_status, updated_at, application_id))
    
    conn.commit()
    cursor.execute('SELECT * FROM job_applications WHERE id = ?', (application_id,))
    record = cursor.fetchone()
    conn.close()
    
    if record:
        try:
            record['job_skills'] = json.loads(record['job_skills'])
        except json.JSONDecodeError:
            pass
        try:
            record['custom_bullets'] = json.loads(record['custom_bullets'])
        except json.JSONDecodeError:
            pass
            
    return record

def delete_application(application_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM job_applications WHERE id = ?', (application_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

async def generate_application_package(user_id, job_title, company, job_url='', job_skills=None) -> dict:
    if job_skills is None:
        job_skills = []
        
    profile = get_profile(user_id)
    if not profile:
        profile = {"skills": [], "target_role": "Candidate", "experience_level": ""}
        
    user_skills = profile.get("skills", [])
    
    match_percentage, matched_skills, missing_skills = compute_match(user_skills, job_skills)
    
    prompt = f"""
    Generate a tailored job application package.
    Candidate target role: {profile.get("target_role", "Candidate")}
    Candidate experience: {profile.get("experience_level", "")}
    Candidate skills: {', '.join(user_skills)}
    
    Target Job Title: {job_title}
    Target Company: {company}
    Required Job Skills: {', '.join(job_skills)}
    Matched Skills: {', '.join(matched_skills)}
    
    Please provide the response ONLY in valid JSON format with the following keys:
    - "cover_letter": A tailored 3-paragraph cover letter for the job, mentioning the candidate's matched skills and expressing enthusiasm for the company.
    - "custom_bullets": A list of 3 tailored resume bullet points that highlight skills relevant to the job.
    - "application_summary": A 2-3 sentence summary of why this candidate is a great fit.
    """
    
    response = await call_llm(prompt, provider="groq", json_mode=True)
    
    if isinstance(response, str):
        clean_res = re.sub(r'```json', '', response, flags=re.IGNORECASE)
        clean_res = re.sub(r'```', '', clean_res)
        try:
            parsed_res = json.loads(clean_res.strip())
        except json.JSONDecodeError:
            parsed_res = {
                "cover_letter": "Error generating cover letter.",
                "custom_bullets": [],
                "application_summary": "Error parsing JSON."
            }
    else:
        parsed_res = response
        
    cover_letter = parsed_res.get("cover_letter", "")
    custom_bullets = parsed_res.get("custom_bullets", [])
    application_summary = parsed_res.get("application_summary", "")
    
    record = save_application(
        user_id=user_id,
        job_title=job_title,
        company=company,
        job_url=job_url,
        job_skills=job_skills,
        match_percentage=match_percentage,
        cover_letter=cover_letter,
        custom_bullets=custom_bullets,
        application_summary=application_summary
    )
    
    return {
        "user_id": user_id,
        "job_title": job_title,
        "company": company,
        "job_url": job_url,
        "match_percentage": match_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "cover_letter": cover_letter,
        "custom_bullets": custom_bullets,
        "application_summary": application_summary,
        "status": record.get("status", "prepared"),
        "created_at": record.get("created_at")
    }
