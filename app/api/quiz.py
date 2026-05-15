from fastapi import APIRouter
from app.models.schemas import QuizRequest, QuizResponse, WorksheetRequest, WorksheetResponse
from app.services.quiz_service import generate_quiz, generate_worksheet

router = APIRouter()

@router.post("/quiz", response_model=QuizResponse)
async def quiz_handler(request: QuizRequest):
    """
    Generates an adaptive AI math quiz based on difficulty and concept.
    """
    quiz_data = await generate_quiz(request.difficulty, request.concept, request.language)
    return QuizResponse(**quiz_data)

@router.post("/worksheet", response_model=WorksheetResponse)
async def worksheet_handler(request: WorksheetRequest):
    """
    Generates a 10-problem printable worksheet.
    """
    worksheet_data = await generate_worksheet(request.difficulty, request.concept)
    return WorksheetResponse(**worksheet_data)
