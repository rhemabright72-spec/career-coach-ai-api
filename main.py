import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid

# Load environment variables from .env file
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.8-flash")
chat = model.start_chat(history=[])

# Send system prompt to set AI's role
chat.send_message("""You are an AI Career Coach assistant. Your role is to help students with:
1. Resume review and improvement suggestions
2. Career path guidance
3. Interview preparation tips
4. Technical skill development advice

Always be encouraging but honest. Provide specific, actionable advice.
If asked about something outside career coaching, politely redirect.""")

# Create FastAPI app
app = FastAPI(
    title="Career Coach AI",
    description="AI-powered career coaching API",
    version="1.0.0"
)

# Enable CORS (so your frontend can talk to this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request/response models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "Welcome to Career Coach AI API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_connected": True}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to the AI Career Coach.

    Example request:
    {
        "message": "How can I improve my resume for AI internships?"
    }
    """
    try:
        # Get response from AI
        response = chat.send_message(request.message)

        return ChatResponse(
            response=response.text,
            conversation_id=str(uuid.uuid4())
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Service Error: {str(e)}"
        )

@app.post("/chat/reset")
async def reset_conversation():
    """Reset the conversation history"""
    global chat
    chat = model.start_chat(history=[])
    chat.send_message("""You are an AI Career Coach assistant...""")
    return {"message": "Conversation reset successfully"}
