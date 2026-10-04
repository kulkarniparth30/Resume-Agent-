"""Jobs API abstraction provider for Career Copilot."""

import os
import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from services.llm_service import call_llm
import json
import re

class JobsProvider(ABC):
    @abstractmethod
    async def search(self, role: str, skills: Optional[List[str]] = None, location: str = "India") -> List[Dict[str, Any]]:
        pass

class RemotiveJobsProvider(JobsProvider):
    async def search(self, role: str, skills: Optional[List[str]] = None, location: str = "India") -> List[Dict[str, Any]]:
        clean_role = role.replace(" ", "+")
        url = f"https://remotive.com/api/remote-jobs?search={clean_role}&limit=15"
        jobs = []
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(url, timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    for j in data.get("jobs", []):
                        jobs.append({
                            "title": j.get("title", ""),
                            "company": j.get("company_name", ""),
                            "location": j.get("candidate_required_location", location),
                            "salary": j.get("salary", "Not specified"),
                            "url": j.get("url", ""),
                            "source": "Remotive",
                            "skills": j.get("tags", [])
                        })
        except Exception as e:
            print(f"[JobsProvider] Remotive error: {e}")
        return jobs

class MockJobsProvider(JobsProvider):
    async def search(self, role: str, skills: Optional[List[str]] = None, location: str = "India") -> List[Dict[str, Any]]:
        # High-fidelity realistic jobs stub
        return [
            {
                "title": f"Senior {role.title()}",
                "company": "TechNova Solutions",
                "location": location or "Remote",
                "salary": "18-24 LPA",
                "url": "https://example.com/careers/technova",
                "source": "MockProvider",
                "skills": (skills[:4] if skills else ["Python", "Docker", "AWS", "FastAPI"])
            },
            {
                "title": f"{role.title()} - Core Systems",
                "company": "Apex Cloud Systems",
                "location": location or "Bangalore",
                "salary": "14-20 LPA",
                "url": "https://example.com/careers/apex",
                "source": "MockProvider",
                "skills": (skills[:3] if skills else ["Python", "PostgreSQL", "Git"])
            },
            {
                "title": f"Associate {role.title()}",
                "company": "NextGen Innovations",
                "location": "Remote",
                "salary": "8-12 LPA",
                "url": "https://example.com/careers/nextgen",
                "source": "MockProvider",
                "skills": (skills[:2] if skills else ["REST APIs", "Problem Solving"])
            }
        ]

class LLMFallbackJobsProvider(JobsProvider):
    async def search(self, role: str, skills: Optional[List[str]] = None, location: str = "India") -> List[Dict[str, Any]]:
        skills_str = ", ".join(skills) if skills else "general software skills"
        prompt = f"""Generate 5 realistic job postings for the role '{role}' in '{location}'.
Skills required: {skills_str}.
Return a strict JSON array of objects with keys: title, company, location, salary, url, source, skills (array)."""
        try:
            resp = await call_llm(prompt, json_mode=True)
            resp = re.sub(r"^```json\s*", "", resp.strip())
            resp = re.sub(r"\s*```$", "", resp.strip())
            return json.loads(resp)
        except Exception as e:
            print(f"[JobsProvider] LLM fallback error: {e}")
            return await MockJobsProvider().search(role, skills, location)

def get_jobs_provider() -> JobsProvider:
    provider_name = os.getenv("JOBS_API_PROVIDER", "remotive").lower()
    if provider_name == "mock":
        return MockJobsProvider()
    return RemotiveJobsProvider()
