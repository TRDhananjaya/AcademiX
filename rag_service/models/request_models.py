# pyrefly: ignore [missing-import]

from pydantic import BaseModel
from typing import List, Optional

class AnswerAnalysis(BaseModel):
    questionText: str
    studentAnswer: str
    correctAnswer: str
    isCorrect: bool

class ModuleData(BaseModel):
    module_id: str
    score: float
    incorrect_questions: List[str]
    answers_analysis: List[AnswerAnalysis] = []  # New: rich answer-level data, defaults empty for backward compat

class StudyPlanRequest(BaseModel):
    studentId: str
    overall_score: float
    lessonId: str
    modules_data: List[ModuleData]

class StudyPlanResponse(BaseModel):
    success: bool
    studyPlan: str