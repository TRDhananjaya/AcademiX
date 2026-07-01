import os
from langchain_google_genai import ChatGoogleGenerativeAI

_llm_instance = None

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        # Load the key from GEMINI_API_KEY if GOOGLE_API_KEY is not set
        api_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not found in environment variables")
        
        # Ensure it's set in os.environ for Langchain
        os.environ["GOOGLE_API_KEY"] = api_key
        
        _llm_instance = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.3,
            google_api_key=api_key
        )
    return _llm_instance

def call_gemini(prompt: str) -> str:
    llm = get_llm()
    response = llm.invoke(prompt)
    return response.content
