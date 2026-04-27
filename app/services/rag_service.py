from app.services.retriever import retrieve_docs
from app.services.llm_service import generate_answer
from app.db.session import get_chat_history, update_chat_history

async def process_query(query: str, session_id: str = None) -> str:
    """
    Orchestrates the RAG pipeline.
    1. Fetches chat history (if session_id is provided).
    2. Retrieves relevant documents from Pinecone.
    3. Calls Groq LLM to generate the answer.
    4. Updates chat history.
    """
    # 1. Get history
    chat_history = []
    if session_id:
        chat_history = await get_chat_history(session_id)
        
    # 2. Retrieve context
    docs_context = await retrieve_docs(query)
    
    # 3. Generate answer
    answer = await generate_answer(query, docs_context, chat_history)
    
    # 4. Update history
    if session_id:
        await update_chat_history(session_id, query, answer)
        
    return answer
