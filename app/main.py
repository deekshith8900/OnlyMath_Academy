import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables before importing routers
load_dotenv()

from app.api.query import router as query_router
from app.api.quiz import router as quiz_router

app = FastAPI(
    title="OnlyMath AI Chatbot API",
    description="Backend for the AI-Powered Web RAG Chatbot",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(query_router, prefix="/api", tags=["api"])
app.include_router(quiz_router, prefix="/api", tags=["quiz"])

@app.get("/")
async def root():
    return {"message": "Welcome to OnlyMath AI Chatbot API"}
