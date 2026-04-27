import os
from groq import AsyncGroq
from typing import List, Dict

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# LLaMA 3.3 70B
MODEL_NAME = "llama3-70b-8192" 

SYSTEM_PROMPT = """You are a helpful math assistant for OnlyMath Academy.

STRICT INSTRUCTIONS:
- Answer ONLY using the provided context.
- Do NOT use your own knowledge.
- If the answer is not found in the context, respond exactly:
"I don't have specific information about this in my knowledge base for questions about this contact us at onlymath.academy@gmail.com"

CONTEXT:
{retrieved_chunks}
"""

async def generate_answer(query: str, context: str, chat_history: List[Dict] = None) -> str:
    """
    Generates an answer using Groq and the provided context.
    """
    if not client:
        return "Groq API is not configured. Please set GROQ_API_KEY."
        
    # Build messages list
    messages = []
    
    # System prompt with context
    formatted_system_prompt = SYSTEM_PROMPT.format(retrieved_chunks=context)
    messages.append({"role": "system", "content": formatted_system_prompt})
    
    # Add chat history if available
    if chat_history:
        for msg in chat_history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
    # Add current query
    messages.append({"role": "user", "content": f"QUESTION:\n{query}\n\nANSWER:"})
    
    try:
        response = await client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            temperature=0.1,  # Low temperature for factuality
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return "Sorry, I am currently experiencing technical difficulties."
