import os
from dotenv import load_dotenv

# Load from ../.env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables.")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE credentials not fully configured.")

JOBS_API_PROVIDER = os.getenv("JOBS_API_PROVIDER", "remotive")
JOBS_API_KEY = os.getenv("JOBS_API_KEY", "")
CHATBOT_MODEL = os.getenv("CHATBOT_MODEL", "gemini-3.5-flash-lite")
CHATBOT_MAX_TOOL_LOOPS = int(os.getenv("CHATBOT_MAX_TOOL_LOOPS", "8"))
