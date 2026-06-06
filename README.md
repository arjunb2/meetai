## MeetAI — AI Meeting Task Extraction Agent

Convert meeting notes into structured, actionable task lists in seconds.

## Problem

Meetings happen. Tasks get discussed. Nothing gets tracked.

Teams lose accountability because task details disappear into email and Slack. **MeetAI** extracts structured tasks directly from meeting notes or voice recordings.

## Features

 **Text & Voice Input** — Paste notes or record a meeting summary  
 **AI Task Extraction** — Groq LLM identifies owners, deadlines, priorities  
 **Dashboard** — Track all meetings and tasks in one place  
 **Club Organization** — Separate meetings by team  
 **Export** — Copy to WhatsApp or download as CSV  
 **Persistent Storage** — All data saved locally  
 **Edit & Delete** — Manage past meetings anytime  

## Live Demo

🚀 **[https://meetai-eosin-two.vercel.app](https://meetai-eosin-two.vercel.app)**

## How It Works

```
Meeting Notes / Audio Recording
         ↓
   Groq Whisper API (transcription)
         ↓
   Groq Llama 3.3 (task extraction)
         ↓
Structured JSON {owner, task, deadline, priority}
         ↓
   React Dashboard + localStorage
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite (Vercel) |
| **Backend** | FastAPI (Render) |
| **AI** | Groq API (Whisper + Llama 3.3) |
| **Storage** | localStorage |
| **State** | React Context API |

## Getting Started

### Requirements
- Python 3.10+
- Node.js 16+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### Local Setup

**1. Clone & Setup Backend**
```bash
git clone https://github.com/arjunb2/meetai.git
cd meetai
echo "GROQ_API_KEY=your_key_here" > .env
pip install fastapi uvicorn groq python-dotenv python-multipart
python -m uvicorn main:app --reload
```

**2. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5175`

## Project Structure

```
meetai/
├── main.py                      # FastAPI backend
├── .env                         # API keys (git ignored)
├── .gitignore
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   ├── context/
    │   │   └── taskcontext.jsx   # Global state
    │   └── pages/
    │       ├── dashboard.jsx     # Meeting history
    │       └── extract.jsx       # New meeting
    ├── package.json
    └── vite.config.js
```

## API Endpoints

### POST `/extract`
Extracts tasks from meeting notes.
```bash
curl -X POST http://localhost:8000/extract \
  -F "notes=Arjun will finalize design by Friday. High priority."
```

Response:
```json
{
  "tasks": [
    {
      "owner": "Arjun",
      "task": "finalize design",
      "deadline": "Friday",
      "priority": "HIGH"
    }
  ]
}
```

### POST `/transcribe`
Converts audio to text.
```bash
curl -X POST http://localhost:8000/transcribe \
  -F "file=@audio.wav"
```

Response:
```json
{
  "transcript": "Meeting notes text here..."
}
```

## Key Design Decisions

**Why Groq?**  
Faster inference than OpenAI, generous free tier, perfect for real-time task extraction.

**Why localStorage?**  
Eliminates need for a backend database for MVP. Data persists across refreshes. Simple to understand and debug.

**Why React Context?**  
Lightweight state management without Redux complexity. Clubs and meetings are shared across pages seamlessly.

**Why System Prompt Engineering?**  
The real work isn't code — it's telling the AI exactly what to extract. Detailed prompt rules ensure consistent, hallucination-free output.

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| LLM returning markdown instead of JSON | Added "JSON only" constraint in system prompt + try-catch |
| Club data not syncing between pages | Moved clubs to React Context for shared state |
| Data lost on page refresh | Implemented localStorage with useEffect hooks |
| Double-saving meetings | Removed React StrictMode, separated save actions |
| Audio recording issues | Added MediaRecorder API with blob handling |

## What's Next

- 📅 Date/time picker for past meetings
- 🔗 Google Calendar sync & reminders
- 👥 Team sharing (currently local-only)
- 🔐 User authentication
- 📊 Analytics dashboard

## Author

**Arjun Bijumon**  
4th Year CS Student | CUSAT  


### Questions?
Open an issue or email arjun.b2k5@gmail.com
```
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
