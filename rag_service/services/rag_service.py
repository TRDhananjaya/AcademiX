from services.llm_service import call_gemini
from utils.prompt_builder import build_study_plan_prompt

def retrieve_context(module: str) -> str:
    # Future RAG expansion: PDF/document ingestion, vector database retrieval
    # For now, return optional mock context or an empty string
    return ""

def generate_study_plan(module: str, score: float) -> str:
    context = retrieve_context(module)
    prompt = build_study_plan_prompt(module, score, context)
    return call_gemini(prompt)
