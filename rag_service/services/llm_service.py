import os
import google.generativeai as genai

def init_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)

def call_gemini(prompt: str) -> str:
    init_gemini()
    # Using the specified latest stable model available
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    return response.text
