import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTasks } from "../context/taskcontext"

export default function Dashboard() {
  const { allMeetings } = useTasks()
  const navigate = useNavigate()
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [completedTasks, setCompletedTasks] = useState([])

  const allTasks = allMeetings.flatMap(m =>
    m.tasks.map(t => ({ ...t, meetingId: m.id, date: m.date, time: m.time }))
  )

  const filtered = allTasks.filter(t =>
    priorityFilter === "ALL" ? true : t.priority === priorityFilter
  )

  const toggleComplete = (key) => {
    setCompletedTasks(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const priorityColor = (p) => {
    if (p === "HIGH") return "#ff4d4d"
    if (p === "MEDIUM") return "#f0a500"
    return "#4caf50"
  }

  const completed = completedTasks.length
  const pending = allTasks.length - completed
  const high = allTasks.filter(t => t.priority === "HIGH").length

  return (
    <div className="app">
      <div className="header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>📊 Dashboard</h1>
        <p>Track tasks across all your meetings</p>
      </div>

      {allTasks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#666" }}>
          <p>No meetings extracted yet.</p>
          <button className="extract-btn" style={{ marginTop: "16px" }} onClick={() => navigate("/")}>
            Extract Your First Meeting
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h2>{allTasks.length}</h2>
              <p>Total Tasks</p>
            </div>
            <div className="stat-card">
              <h2>{completed}</h2>
              <p>Completed</p>
            </div>
            <div className="stat-card">
              <h2>{pending}</h2>
              <p>Pending</p>
            </div>
            <div className="stat-card">
              <h2 style={{ color: "#ff4d4d" }}>{high}</h2>
              <p>High Priority</p>
            </div>
          </div>

          <div className="filters">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
              <button
                key={f}
                className={priorityFilter === f ? "filter-btn active" : "filter-btn"}
                onClick={() => setPriorityFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {allMeetings.map(meeting => {
            const meetingTasks = filtered.filter(t => t.meetingId === meeting.id)
            if (meetingTasks.length === 0) return null
            return (
              <div key={meeting.id} className="card">
                <div className="meeting-header">
                  <span>📅 {meeting.date} · {meeting.time}</span>
                  <span>{meeting.tasks.length} tasks</span>
                </div>
                <div className="task-list">
                  {meetingTasks.map((t, i) => {
                    const key = `${meeting.id}-${i}`
                    const done = completedTasks.includes(key)
                    return (
                      <div
                        key={key}
                        className={done ? "task-row done" : "task-row"}
                        onClick={() => toggleComplete(key)}
                      >
                        <div className="task-row-left">
                          <span className="check">{done ? "✅" : "⬜"}</span>
                          <div>
                            <p className="task-row-name">{t.task}</p>
                            <p className="task-row-meta">{t.owner} · 📅 {t.deadline}</p>
                          </div>
                        </div>
                        <span className="badge" style={{ background: priorityColor(t.priority) }}>
                          {t.priority}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}