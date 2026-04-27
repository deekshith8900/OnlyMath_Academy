import os
from dotenv import load_dotenv

# Load env variables before importing modules that use them
load_dotenv()

from app.ingestion.loader import load_documents
from app.ingestion.chunker import chunk_documents
from app.ingestion.embedder import embed_and_store

def main():
    data_dir = "data/OnlyMath_Chatbot"
    print(f"Loading documents from {data_dir}...")
    
    docs = load_documents(data_dir)
    if not docs:
        print("No documents found. Please check the path.")
        return
        
    print(f"Loaded {len(docs)} documents.")
    
    print("Chunking documents...")
    chunks = chunk_documents(docs, chunk_size=300, chunk_overlap=50)
    print(f"Created {len(chunks)} chunks.")
    
    print("Embedding and storing in Pinecone...")
    try:
        embed_and_store(chunks)
        print("Ingestion complete!")
    except Exception as e:
        print(f"Ingestion failed: {e}")

if __name__ == "__main__":
    main()
