# MeetAI — Meeting to Execution Agent

An AI-powered tool that converts messy meeting notes or voice recordings into structured task lists with owners, deadlines, and priorities.

## Stack
- Frontend: React + Vite (Vercel)
- Backend: FastAPI (Render)
- AI: Groq — Llama 3.3 + Whisper

## Features
- Paste notes or record audio
- AI extracts tasks with owner, deadline, priority
- Dashboard with club filtering and meeting history
- WhatsApp summary copy + CSV export
- Edit and delete meetings
- localStorage persistence

## Run Locally

### Backend
```bash
cd backend
pip install fastapi uvicorn groq python-dotenv python-multipart
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
