from pydantic import BaseModel

class StudyPlanRequest(BaseModel):
    studentId: str
    module: str
    score: float
    lessonId: str

class StudyPlanResponse(BaseModel):
    success: bool
    studyPlan: str
