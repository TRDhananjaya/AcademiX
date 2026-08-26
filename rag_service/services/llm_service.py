# pyrefly: ignore [missing-import]

import os
import time
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from google.api_core.exceptions import ResourceExhausted

class QuotaExhaustedError(Exception):
    """Exception raised when the Gemini API quota is exhausted."""
    pass

_llm_instance = None

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        # Load the key from GEMINI_API_KEY if GOOGLE_API_KEY is not set
        api_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not found in environment variables")
        
        # Remove keys from env to prevent langchain_google_genai warning about both being set
        if "GOOGLE_API_KEY" in os.environ:
            del os.environ["GOOGLE_API_KEY"]
        if "GEMINI_API_KEY" in os.environ:
            del os.environ["GEMINI_API_KEY"]
        
        _llm_instance = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            max_output_tokens=7000,
            api_key=api_key
        )
    return _llm_instance

def call_gemini(prompt: str) -> str:
    llm = get_llm()
    max_retries = 1
    retry_delay = 5
    
    for attempt in range(max_retries + 1):
        try:
            response = llm.invoke(prompt)
            return str(response.content)
        except Exception as e:
            err_str = str(e)
            is_quota_error = isinstance(e, ResourceExhausted) or "429" in err_str or "RESOURCE_EXHAUSTED" in err_str
            
            if is_quota_error:
                if attempt < max_retries:
                    logging.warning(f"[RAG] Gemini 429 rate limit hit. Retrying in {retry_delay}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                else:
                    logging.error("[RAG] Gemini quota exhausted for gemini-2.5-flash. Study Plan generation postponed/failed due to API quota.")
                    raise QuotaExhaustedError("Gemini API quota exhausted.") from e
            else:
                raise e