import os
from pinecone import Pinecone

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "onlymath-chatbot")

pc = Pinecone(api_key=PINECONE_API_KEY) if PINECONE_API_KEY else None
EMBEDDING_MODEL = "multilingual-e5-large"

async def retrieve_docs(query: str, top_k: int = 5, threshold: float = 0.75) -> str:
    """
    Embeds the query using Pinecone Inference API and retrieves the top-k matching documents.
    Returns a concatenated string of retrieved context.
    """
    if not pc:
        print("Pinecone not initialized.")
        return ""
        
    index = pc.Index(PINECONE_INDEX_NAME)
    
    # Generate embedding using Pinecone Inference API
    embedding_data = pc.inference.embed(
        model=EMBEDDING_MODEL,
        inputs=[query],
        parameters={"input_type": "query"}
    )
    query_embedding = embedding_data[0]['values']
    
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    retrieved_chunks = []
    for match in results["matches"]:
        if match["score"] >= threshold:
            text = match["metadata"].get("text", "")
            if text:
                retrieved_chunks.append(text)
                
    return "\n\n".join(retrieved_chunks)
