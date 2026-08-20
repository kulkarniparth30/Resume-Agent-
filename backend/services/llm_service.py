import google.genai as genai
from groq import Groq
from config import GEMINI_API_KEY, GROQ_API_KEY

async def call_llm(prompt: str, system_prompt: str = None, provider: str = 'gemini', json_mode: bool = False) -> str:
    if json_mode:
        prompt += "\n\nPlease respond with valid JSON only."

    def call_gemini():
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = 'gemini-3.6-flash'
        contents = prompt
        if system_prompt:
            contents = f"System: {system_prompt}\n\nUser: {prompt}"
        response = client.models.generate_content(model=model, contents=contents)
        return response.text

    def call_groq():
        client = Groq(api_key=GROQ_API_KEY)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model='llama-3.1-70b-versatile',
            messages=messages
        )
        return response.choices[0].message.content

    if provider == 'gemini':
        try:
            return call_gemini()
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq.")
            return call_groq()
    elif provider == 'groq':
        try:
            return call_groq()
        except Exception as e:
            print(f"Groq failed: {e}. Falling back to Gemini.")
            return call_gemini()
    else:
        raise ValueError("Invalid provider specified")
