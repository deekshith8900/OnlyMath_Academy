import os
from supabase import create_client, Client
from typing import List, Dict

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_chat_history(session_id: str) -> List[Dict]:
    """Retrieve the last 5-10 messages for a user session."""
    if not supabase:
        return []
    
    response = supabase.table("chat_sessions").select("messages").eq("session_id", session_id).execute()
    if response.data:
        return response.data[0].get("messages", [])
    return []

async def update_chat_history(session_id: str, user_message: str, bot_response: str):
    """Update user session history, keeping the last 10 messages."""
    if not supabase:
        return
        
    history = await get_chat_history(session_id)
    
    # Append new messages
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": bot_response})
    
    # Keep last 10 messages max
    history = history[-10:]
    
    # Upsert to Supabase
    supabase.table("chat_sessions").upsert({
        "session_id": session_id,
        "messages": history
    }).execute()
