from .llm_service import call_llm

async def enhance_section(section_type: str, content: str, jd_context: str = '', job_role: str = '') -> str:
    system_prompt = "You are an expert resume writer and career coach."
    
    prompts = {
        'experience': "Enhance this experience section with stronger action verbs, quantified achievements, and ATS-friendly keywords based on the target role.",
        'summary': "Rewrite this summary to be concise, impactful, and highly tailored to the target role.",
        'project': "Enhance this project description to show technical depth and impact metrics.",
        'skills': "Organize these skills into proper categories and suggest missing relevant skills.",
        'education': "Format and enhance this education section professionally."
    }
    
    instruction = prompts.get(section_type, "Enhance this section to be professional and impactful.")
    
    prompt = f"""
    Target Job Role: {job_role}
    Job Description Context: {jd_context}
    
    Task: {instruction}
    
    Original Content:
    {content}
    
    Please provide the enhanced version of the content directly, without preamble.
    """
    
    enhanced = await call_llm(prompt=prompt, system_prompt=system_prompt, provider='gemini')
    return enhanced.strip()

async def enhance_bullet(bullet: str, context: str = '') -> str:
    system_prompt = "You are an expert resume writer."
    prompt = f"""
    Context: {context}
    
    Task: Enhance this single resume bullet point using the STAR method where possible. Make it start with a strong action verb, and include quantified metrics if possible.
    
    Original Bullet:
    {bullet}
    
    Enhanced Bullet (return just the text, no quotes):
    """
    
    enhanced = await call_llm(prompt=prompt, system_prompt=system_prompt, provider='gemini')
    return enhanced.strip()
