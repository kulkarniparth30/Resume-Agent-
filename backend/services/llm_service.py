import time
import google.genai as genai
from groq import Groq
from config import GEMINI_API_KEY, GROQ_API_KEY

async def call_llm(prompt: str, system_prompt: str = None, provider: str = 'gemini', json_mode: bool = False) -> str:
    if json_mode:
        prompt += "\n\nPlease respond with valid JSON only without any markdown formatting."

    def call_gemini():
        client = genai.Client(api_key=GEMINI_API_KEY)
        models = ['gemini-3.6-flash']
        last_err = None
        for model in models:
            try:
                contents = prompt
                if system_prompt:
                    contents = f"System: {system_prompt}\n\nUser: {prompt}"
                response = client.models.generate_content(model=model, contents=contents)
                if response and response.text:
                    return response.text
            except Exception as e:
                last_err = e
                print(f"Gemini model {model} attempt failed: {e}")
        raise last_err or Exception("All Gemini models failed")

    def call_groq():
        client = Groq(api_key=GROQ_API_KEY)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        # Verified active Groq models
        groq_models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'groq/compound']
        last_err = None
        for model in groq_models:
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                    
                response = client.chat.completions.create(**kwargs)
                if response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content
            except Exception as e:
                last_err = e
                print(f"Groq model {model} attempt failed: {e}")
        raise last_err or Exception("All Groq models failed")

    # Primary provider with automatic fallback
    if provider == 'gemini':
        try:
            return call_gemini()
        except Exception as e:
            print(f"Gemini fallback to Groq: {e}")
            return call_groq()
    elif provider == 'groq':
        try:
            return call_groq()
        except Exception as e:
            print(f"Groq fallback to Gemini: {e}")
            return call_gemini()
    else:
        try:
            return call_groq()
        except Exception:
            return call_gemini()
