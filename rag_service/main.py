import logging
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from models.request_models import StudyPlanRequest, StudyPlanResponse
from services.rag_service import generate_study_plan

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
