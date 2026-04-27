import os
from typing import List, Dict
from pinecone import Pinecone

# Initialize Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "onlymath-chatbot")

pc = Pinecone(api_key=PINECONE_API_KEY) if PINECONE_API_KEY else None

# We use Pinecone's built-in Inference API for embeddings
# multilingual-e5-large outputs 1024 dimensions. 
# NOTE: Make sure your Pinecone index is created with 1024 dimensions!
EMBEDDING_MODEL = "multilingual-e5-large"

def embed_and_store(chunks: List[Dict]):
    """
    Generates embeddings for chunks using Pinecone Inference API and upserts them.
    """
    if not pc:
        raise ValueError("Pinecone API key not configured. Cannot upsert.")
        
    index = pc.Index(PINECONE_INDEX_NAME)
    
    batch_size = 96 # Pinecone inference limits batch size to 96 items
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        
        texts = [chunk["text"] for chunk in batch]
        metadatas = [chunk["metadata"] for chunk in batch]
        
        # Inject the text into metadata so we can retrieve it later
        for j, meta in enumerate(metadatas):
            meta["text"] = texts[j]
        
        # Generate embeddings using Pinecone Inference API
        embedding_data = pc.inference.embed(
            model=EMBEDDING_MODEL, 
            inputs=texts, 
            parameters={"input_type": "passage"}
        )
        embeddings = [item['values'] for item in embedding_data]
        
        # Create records for Pinecone
        records = []
        for j, chunk in enumerate(batch):
            record_id = f"{chunk['metadata']['file_name']}_chunk_{chunk['metadata']['chunk_index']}"
            records.append({
                "id": record_id,
                "values": embeddings[j],
                "metadata": metadatas[j]
            })
            
        # Upsert to Pinecone
        index.upsert(vectors=records)
        print(f"Upserted {len(records)} chunks into Pinecone.")
