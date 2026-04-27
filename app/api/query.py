from fastapi import APIRouter
from app.models.schemas import QueryRequest, QueryResponse
from app.services.rag_service import process_query

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_handler(request: QueryRequest):
    """
    Direct API endpoint for querying the RAG pipeline.
    Maintains session history if session_id is provided.
    """
    response_text = await process_query(request.query, session_id=request.session_id)
    return QueryResponse(answer=response_text)
