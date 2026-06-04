from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an AI Meeting-to-Execution Agent designed for student organizations, clubs, and early-career teams.

## YOUR TASK
From the given meeting notes or transcript, extract all actionable tasks and convert them into a structured JSON format.

## RULES
1. ONLY extract real tasks mentioned in the input. Do NOT hallucinate or invent tasks.
2. If no owner is mentioned, set "owner": "Unassigned"
3. If no deadline mentioned, set "deadline": "Not specified"
4. Assign priority based on context:
   - HIGH → urgent, time-sensitive, event-critical
   - MEDIUM → normal operational tasks
   - LOW → optional, vague, or long-term tasks
5. Keep task descriptions short, clear, and actionable.
6. Output MUST be valid JSON only. No explanations, no markdown, no extra text.

## OUTPUT FORMAT (STRICT)
{
  "tasks": [
    {
      "owner": "string",
      "task": "string",
      "deadline": "string",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ]
}

Return only valid JSON. No commentary. No markdown. No explanations."""

@app.post("/extract")
async def extract_tasks(notes: str = Form(...)):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": notes}
        ]
    )
    raw = response.choices[0].message.content.strip()
    data = json.loads(raw)
    return data

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    transcription = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=(file.filename, audio_bytes, "audio/wav"),
    )
    return {"transcript": transcription.text}