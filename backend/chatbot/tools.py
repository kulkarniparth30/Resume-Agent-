"""LangChain tools for the Career Copilot chatbot."""

from typing import List, Optional, Dict, Any
from langchain_core.tools import tool
from chatbot.memory import get_profile, save_preference_key
from chatbot.jobs_provider import get_jobs_provider, MockJobsProvider
from services.analyser import analyse_resume
from services.roadmap_generator import generate_roadmap

@tool
def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Retrieve the saved profile, skills, target role, experience level, and preferences for a user.
    Args:
        user_id: The ID of the authenticated user.
    """
    try:
        prof = get_profile(user_id)
        # Exclude raw resume text from immediate prompt dump to save tokens
        return {
            "user_id": user_id,
            "skills": prof.get("skills", []),
            "target_role": prof.get("target_role", ""),
            "location": prof.get("location", ""),
            "experience_level": prof.get("experience_level", ""),
            "preferences": prof.get("preferences", {}),
            "has_resume": bool(prof.get("resume_text"))
        }
    except Exception as e:
        return {"error": f"Failed to get user profile: {str(e)}"}

@tool
def save_preference(user_id: str, key: str, value: str) -> Dict[str, Any]:
    """Save or update a specific job/career preference for the user (e.g. remote preference, target location, role type, min salary, or target industry).
    Args:
        user_id: The ID of the user.
        key: The preference key ('remote', 'role_types', 'min_salary', 'industries', or 'custom').
        value: The value to record for this preference.
    """
    try:
        updated = save_preference_key(user_id, key, value)
        return {"status": "success", "updated_preferences": updated}
    except Exception as e:
        return {"error": f"Failed to save preference: {str(e)}"}

@tool
async def search_jobs(role: str, location: Optional[str] = "India", skills: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Search for relevant active job listings based on job title/role, location, and optional skills.
    Args:
        role: The job title or category to search for (e.g. 'Backend Engineer', 'Data Analyst').
        location: City or country location or 'Remote'.
        skills: List of candidate skills to filter or match against.
    """
    try:
        provider = get_jobs_provider()
        jobs = await provider.search(role=role, skills=skills, location=location or "India")
        if not jobs:
            jobs = await MockJobsProvider().search(role=role, skills=skills, location=location or "India")
        return jobs[:10]
    except Exception as e:
        return [{"error": f"Failed searching jobs: {str(e)}"}]

@tool
def match_job_to_profile(user_id: str, job_title: str, job_skills: List[str]) -> Dict[str, Any]:
    """Calculate match score, matched skills, and missing skills between a job listing and the user's profile skills.
    Args:
        user_id: The user ID to inspect.
        job_title: The title of the job.
        job_skills: The skills required by the job.
    """
    try:
        prof = get_profile(user_id)
        user_skills = set(s.lower() for s in prof.get("skills", []))
        
        if not job_skills:
            return {
                "job_title": job_title,
                "match_score": 75,
                "matched_skills": list(prof.get("skills", [])[:3]),
                "missing_skills": []
            }
            
        matched = []
        missing = []
        for js in job_skills:
            if js.lower() in user_skills or any(us in js.lower() for us in user_skills):
                matched.append(js)
            else:
                missing.append(js)
                
        total = len(job_skills)
        score = int((len(matched) / total) * 100) if total > 0 else 50
        
        return {
            "job_title": job_title,
            "match_score": score,
            "matched_skills": matched,
            "missing_skills": missing
        }
    except Exception as e:
        return {"error": f"Failed to match job: {str(e)}"}

@tool
async def get_skill_gap(user_id: str, target_role: str) -> Dict[str, Any]:
    """Analyze skill gaps for the user against their desired target job role.
    Args:
        user_id: The user ID.
        target_role: The role to evaluate against (e.g. 'Senior Full Stack Developer').
    """
    try:
        prof = get_profile(user_id)
        resume_text = prof.get("resume_text", "")
        skills = prof.get("skills", [])
        
        # Check if we have cached analysis for this role
        cached_analysis = prof.get("last_analysis", {})
        if cached_analysis and prof.get("target_role", "").lower() == target_role.lower():
            return {
                "target_role": target_role,
                "skill_gap": cached_analysis.get("skill_gap", []),
                "gap_score": cached_analysis.get("gap_score", 0),
                "required_skills": cached_analysis.get("required_skills", [])
            }
            
        res = await analyse_resume(
            resume_text=resume_text or f"Skills: {', '.join(skills)}",
            jd_text="",
            job_role=target_role,
            manual_skills=skills
        )
        return {
            "target_role": target_role,
            "skill_gap": res.get("skill_gap", []),
            "gap_score": res.get("gap_score", 0),
            "required_skills": res.get("required_skills", [])
        }
    except Exception as e:
        return {"error": f"Failed to calculate skill gap: {str(e)}"}

@tool
async def get_roadmap(user_id: str, target_role: str) -> Dict[str, Any]:
    """Generate a step-by-step personalized learning roadmap for a target role based on user gaps and current skills, and automatically save it to the user's permanent Roadmap section.
    Args:
        user_id: The user ID.
        target_role: The target career role (e.g. 'Agentic AI Engineer').
    """
    from services.roadmap_service import save_roadmap_record
    try:
        prof = get_profile(user_id)
        skills = prof.get("skills", [])
        gap_res = await get_skill_gap.ainvoke({"user_id": user_id, "target_role": target_role})
        gaps = gap_res.get("skill_gap", []) if isinstance(gap_res, dict) else []
        
        roadmap = await generate_roadmap(
            candidate_skills=skills,
            skill_gaps=gaps,
            job_role=target_role,
            rank_score=60
        )
        
        saved_entry = save_roadmap_record(
            user_id=user_id,
            role=target_role,
            roadmap_data=roadmap,
            rank_score=60
        )
        
        return {
            "status": "saved",
            "message": f"Successfully generated and saved {target_role} roadmap to the user's Roadmap section.",
            "target_role": target_role,
            "roadmap_id": saved_entry["id"],
            "roadmap": roadmap
        }
    except Exception as e:
        return {"error": f"Failed to generate roadmap: {str(e)}"}

@tool
async def get_ats_score(user_id: str, jd_text: str) -> Dict[str, Any]:
    """Calculate the ATS score, match percentage, and ranking breakdown of the user's resume against a specific Job Description.
    Args:
        user_id: The user ID.
        jd_text: The complete text of the job description to test.
    """
    try:
        prof = get_profile(user_id)
        resume_text = prof.get("resume_text", "")
        skills = prof.get("skills", [])
        
        if not resume_text and not skills:
            return {"error": "User does not have an uploaded resume or saved skills yet."}
            
        res = await analyse_resume(
            resume_text=resume_text or f"Candidate skills: {', '.join(skills)}",
            jd_text=jd_text,
            job_role=prof.get("target_role", "Software Engineer"),
            manual_skills=skills
        )
        return {
            "ats_score": res.get("ats_score", 0),
            "match_percent": res.get("match_percent", 0),
            "rank_breakdown": res.get("rank_breakdown", {}),
            "missing_skills": [item.get("skill") for item in res.get("skill_gap", []) if isinstance(item, dict)]
        }
    except Exception as e:
        return {"error": f"Failed calculating ATS score: {str(e)}"}

@tool
async def rewrite_resume_bullet(bullet: str, target_keywords: Optional[List[str]] = None, context: Optional[str] = "") -> Dict[str, Any]:
    """Rewrite a resume accomplishment bullet point into high-impact, metrics-driven prose using the Google XYZ formula (Accomplished X by doing Y as measured by Z).
    Args:
        bullet: The original bullet point text to rewrite.
        target_keywords: Key skills/technologies from the target job to naturally weave in.
        context: Optional job title or domain context (e.g. 'Backend Engineer', 'DevOps').
    """
    from services.ai_enhancer import enhance_bullet
    try:
        kw_str = f" Target keywords to highlight: {', '.join(target_keywords)}." if target_keywords else ""
        full_context = f"{context or ''}{kw_str}".strip()
        enhanced = await enhance_bullet(bullet=bullet, context=full_context)
        return {
            "original_bullet": bullet,
            "enhanced_bullet": enhanced,
            "formula_applied": "Google XYZ / STAR method"
        }
    except Exception as e:
        return {"error": f"Failed to rewrite bullet: {str(e)}"}

@tool
async def build_project_blueprint(project_name: str, skills: List[str], description: Optional[str] = "") -> Dict[str, Any]:
    """Generate an end-to-end architecture blueprint, prerequisites, milestone implementation steps, and resource links for a portfolio project.
    Args:
        project_name: The name or topic of the project (e.g. 'Distributed Task Queue in Go', 'AI Resume Reranker').
        skills: The technologies and skills the project should demonstrate.
        description: A brief summary of what the project does.
    """
    from services.project_service import get_project_guide
    try:
        desc = description or f"A production-grade application demonstrating mastery in {', '.join(skills)}."
        guide = await get_project_guide(name=project_name, description=desc, skills=skills)
        return guide
    except Exception as e:
        return {"error": f"Failed to build project blueprint: {str(e)}"}

@tool
async def generate_outreach_message(target_company: str, role: str, recipient_role: Optional[str] = "Hiring Manager", key_skill: Optional[str] = "", format: Optional[str] = "linkedin") -> Dict[str, Any]:
    """Generate a high-conversion, personalized cold outreach or networking message for recruiters or hiring managers.
    Args:
        target_company: The company the candidate wants to reach out to.
        role: The job position being targeted.
        recipient_role: Who the message is for (e.g. 'Recruiter', 'Engineering Manager', 'Tech Lead').
        key_skill: The candidate's strongest matching skill or project accomplishment.
        format: The outreach format ('linkedin' for under 300 chars, 'email' for a concise 3-paragraph email).
    """
    from services.llm_service import call_llm
    prompt = f"""
Write a polite, punchy, high-conversion cold outreach message for a candidate seeking a {role} position at {target_company}.
Recipient: {recipient_role}
Key strength/skill to mention: {key_skill or 'modern software engineering best practices'}
Format: {format} (if linkedin: strictly keep under 280 characters suitable for a connection request note; if email: concise 3 short paragraphs with an engaging subject line).

Return ONLY the outreach text without conversational filler.
"""
    try:
        msg = await call_llm(prompt=prompt, provider='groq')
        return {
            "target_company": target_company,
            "role": role,
            "format": format,
            "outreach_text": msg.strip()
        }
    except Exception as e:
        return {"error": f"Failed generating outreach message: {str(e)}"}

@tool
async def auto_apply_to_job(user_id: str, job_title: str, company: str, job_url: str = '', job_skills: Optional[List[str]] = None) -> Dict[str, Any]:
    """Automatically generate a tailored application package for a job, including a custom cover letter, resume bullet points, and match analysis. Use this when the user wants to auto-apply to a specific job.
    Args:
        user_id: The ID of the user.
        job_title: The title of the job to apply for.
        company: The company name.
        job_url: URL of the job listing (optional).
        job_skills: Skills required by the job listing (optional).
    """
    from services.auto_apply_service import generate_application_package
    try:
        result = await generate_application_package(
            user_id=user_id,
            job_title=job_title,
            company=company,
            job_url=job_url,
            job_skills=job_skills or []
        )
        return result
    except Exception as e:
        return {"error": f"Failed to auto-apply: {str(e)}"}
