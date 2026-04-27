from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict

def chunk_documents(documents: List[Dict], chunk_size: int = 300, chunk_overlap: int = 50) -> List[Dict]:
    """
    Splits documents into smaller chunks using LangChain's RecursiveCharacterTextSplitter.
    Uses token sizing roughly by converting chunk_size to character equivalent 
    (1 token ~= 4 chars) or directly splitting by chars. 
    Here we split by characters as an approximation.
    """
    # 300 tokens is roughly 1200 characters. 50 tokens overlap is roughly 200 characters.
    char_chunk_size = chunk_size * 4
    char_chunk_overlap = chunk_overlap * 4
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=char_chunk_size,
        chunk_overlap=char_chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = []
    for doc in documents:
        splits = text_splitter.split_text(doc["text"])
        for i, split in enumerate(splits):
            chunk_metadata = doc["metadata"].copy()
            chunk_metadata["chunk_index"] = i
            
            chunks.append({
                "text": split,
                "metadata": chunk_metadata
            })
            
    return chunks
