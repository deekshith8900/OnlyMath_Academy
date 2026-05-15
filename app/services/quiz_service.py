import os
import json
from groq import AsyncGroq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
MODEL_NAME = "llama3-70b-8192"

async def generate_quiz(difficulty: str, concept: str, language: str = "English") -> dict:
    if not client:
        return {
            "question": "Groq API is not configured.",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Please set GROQ_API_KEY."
        }
        
    prompt = f"""You are an expert math tutor. Generate a multiple-choice question about '{concept}' at a '{difficulty}' difficulty level.
You MUST format your output EXACTLY as a valid JSON object with the following keys:
"question": <the question string>,
"options": <an array of exactly 4 strings>,
"correct_answer": <the exact string from options that is correct>,
"explanation": <a brief explanation>

CRITICAL: Translate the entire JSON content (question, options, explanation) into the {language} language. Keep the JSON keys in English.

JSON Output:"""

    try:
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL_NAME,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return {
            "question": "Error generating quiz. Please try again.",
            "options": ["1", "2", "3", "4"],
            "correct_answer": "1",
            "explanation": str(e)
        }
