import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTasks } from "../context/taskcontext"
import axios from "axios"

export default function Extract() {
  const [inputMethod, setInputMethod] = useState("text")
  const [notes, setNotes] = useState("")
  const [transcript, setTranscript] = useState("")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState("")
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const { saveMeeting } = useTasks()
  const navigate = useNavigate()

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.wav")

      setLoading(true)
      try {
        const res = await axios.post("http://127.0.0.1:8000/transcribe", formData)
        setTranscript(res.data.transcript)
        setNotes(res.data.transcript)
      } catch (err) {
        setError("Transcription failed. Try again.")
      }
      setLoading(false)
    }

    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current.stop()
    setRecording(false)
  }

  const extractTasks = async () => {
    if (!notes.trim()) return
    setLoading(true)
    setError("")
    setTasks([])

    try {
      const formData = new FormData()
      formData.append("notes", notes)
      const res = await axios.post("http://127.0.0.1:8000/extract", formData)
      setTasks(res.data.tasks)
      saveMeeting(res.data.tasks)
    } catch (err) {
      setError("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  const priorityColor = (p) => {
    if (p === "HIGH") return "#ff4d4d"
    if (p === "MEDIUM") return "#f0a500"
    return "#4caf50"
  }

  const whatsappMessage = () => {
    let msg = "📋 *Meeting Task Summary*\n\n"
    tasks.forEach(t => {
      msg += `• ${t.owner}: ${t.task} (by ${t.deadline}) [${t.priority}]\n`
    })
    msg += "\nLet's get these done! 💪"
    return msg
  }

  const downloadCSV = () => {
    const rows = [["Owner", "Task", "Deadline", "Priority"]]
    tasks.forEach(t => rows.push([t.owner, t.task, t.deadline, t.priority]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tasks.csv"
    a.click()
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🗒️ MeetAI</h1>
        <p>Convert meeting notes into a structured execution plan instantly</p>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={inputMethod === "text" ? "tab active" : "tab"}
            onClick={() => setInputMethod("text")}
          >
            📝 Paste Notes
          </button>
          <button
            className={inputMethod === "audio" ? "tab active" : "tab"}
            onClick={() => setInputMethod("audio")}
          >
            🎙️ Record Audio
          </button>
        </div>

        {inputMethod === "text" && (
          <textarea
            placeholder="Paste your meeting notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
          />
        )}

        {inputMethod === "audio" && (
          <div className="audio-section">
            {!recording ? (
              <button className="record-btn" onClick={startRecording}>
                🎙️ Start Recording
              </button>
            ) : (
              <button className="record-btn recording" onClick={stopRecording}>
                ⏹️ Stop Recording
              </button>
            )}
            {transcript && (
              <div className="transcript">
                <p><strong>📄 Transcript:</strong></p>
                <p>{transcript}</p>
              </div>
            )}
          </div>
        )}

        <button className="extract-btn" onClick={extractTasks} disabled={loading}>
          {loading ? "Processing..." : "⚡ Extract Tasks"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {tasks.length > 0 && (
        <div className="results">
          <div className="summary">
            ✅ {tasks.length} tasks found —
            🔴 {tasks.filter(t => t.priority === "HIGH").length} High ·
            🟡 {tasks.filter(t => t.priority === "MEDIUM").length} Medium ·
            🟢 {tasks.filter(t => t.priority === "LOW").length} Low
          </div>

          <div className="tasks">
            {tasks.map((t, i) => (
              <div className="task-card" key={i}>
                <div className="task-top">
                  <span className="owner">{t.owner}</span>
                  <span className="badge" style={{ background: priorityColor(t.priority) }}>
                    {t.priority}
                  </span>
                </div>
                <p className="task-name">{t.task}</p>
                <p className="deadline">📅 {t.deadline}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>💬 WhatsApp Summary</h3>
            <pre>{whatsappMessage()}</pre>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(whatsappMessage())}>
              📋 Copy
            </button>
          </div>

          <button className="download-btn" onClick={downloadCSV}>
            📥 Download CSV
          </button>

          <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
            📊 View Dashboard
          </button>
        </div>
      )}
    </div>
  )
}