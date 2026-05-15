from fastapi import APIRouter
from app.models.schemas import QuizRequest, QuizResponse
from app.services.quiz_service import generate_quiz

router = APIRouter()

@router.post("/quiz", response_model=QuizResponse)
async def quiz_handler(request: QuizRequest):
    """
    Generates an adaptive AI math quiz based on difficulty and concept.
    """
    quiz_data = await generate_quiz(request.difficulty, request.concept, request.language)
    return QuizResponse(**quiz_data)
