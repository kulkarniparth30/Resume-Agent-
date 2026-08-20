import os
from dotenv import load_dotenv

# Load from ../.env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables.")
