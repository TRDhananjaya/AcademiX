from pydantic import BaseModel
from typing import List

class ModuleData(BaseModel):
    module_id: str
    score: float
    incorrect_questions: List[str]

class StudyPlanRequest(BaseModel):
    studentId: str
    overall_score: float
    lessonId: str
    modules_data: List[ModuleData]

class StudyPlanResponse(BaseModel):
    success: bool
    studyPlan: str
