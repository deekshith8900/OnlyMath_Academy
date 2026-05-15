from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    language: Optional[str] = "English"

class QueryResponse(BaseModel):
    answer: str

class QuizRequest(BaseModel):
    difficulty: str = "medium"
    concept: str = "general math"
    language: Optional[str] = "English"

class QuizResponse(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class WorksheetRequest(BaseModel):
    concept: str = "general math"
    difficulty: str = "medium"

class WorksheetProblem(BaseModel):
    question: str
    answer: str

class WorksheetResponse(BaseModel):
    problems: List[WorksheetProblem]
