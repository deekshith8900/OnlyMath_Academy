import os
from pathlib import Path
from typing import List, Dict

def load_documents(directory: str) -> List[Dict]:
    """
    Loads all markdown and text files from the given directory.
    Returns a list of dictionaries containing 'text' and metadata ('file_name', 'topic').
    """
    documents = []
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"Directory {directory} does not exist.")
        return documents
        
    for file_path in dir_path.glob("*"):
        if file_path.suffix in [".md", ".txt"]:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Extract basic topic from filename (e.g., "01_company_overview.md" -> "company_overview")
            topic = file_path.stem.split("_", 1)[-1] if "_" in file_path.stem else file_path.stem
            
            documents.append({
                "text": content,
                "metadata": {
                    "file_name": file_path.name,
                    "topic": topic
                }
            })
            
    return documents
