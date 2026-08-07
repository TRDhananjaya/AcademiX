# pyrefly: ignore [missing-import]

import logging
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from models.request_models import StudyPlanRequest, StudyPlanResponse
from services.rag_service import generate_study_plan, generate_adaptive_followup_quiz

load_dotenv()

app = FastAPI(title="AcademiX RAG Service", description="AI Study Plan Generation Service")

@app.post("/generate_plan", response_model=StudyPlanResponse)
async def generate_plan_endpoint(req: StudyPlanRequest):
    try:
        study_plan_text = generate_study_plan(req.overall_score, req.modules_data)
        return StudyPlanResponse(
            success=True,
            studyPlan=study_plan_text
        )
    except Exception as e:
        logging.error(f"Error generating study plan: {e}")
        # Note: If gemini call fails, we return a 500 server error instead of a generic response
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_followup_quiz")
async def generate_followup_quiz_endpoint(req: StudyPlanRequest):
    try:
        quiz_json_text = generate_adaptive_followup_quiz(req.modules_data)
        
        # Clean up possible markdown fences
        quiz_json_text = quiz_json_text.strip()
        if quiz_json_text.startswith("```json"):
            quiz_json_text = quiz_json_text[7:]
        if quiz_json_text.startswith("```"):
            quiz_json_text = quiz_json_text[3:]
        if quiz_json_text.endswith("```"):
            quiz_json_text = quiz_json_text[:-3]
            
        import json
        
        try:
            quiz_data = json.loads(quiz_json_text)
        except json.JSONDecodeError as je:
            logging.error(f"Failed to parse LLM JSON output: {je}. Raw output: {quiz_json_text}")
            raise HTTPException(status_code=500, detail="Failed to generate a valid JSON quiz format.")
            
        return {
            "success": True,
            "quiz": quiz_data
        }
    except Exception as e:
        logging.error(f"Error generating adaptive followup quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))