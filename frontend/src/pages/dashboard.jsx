import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTasks } from "../context/taskcontext"

export default function Dashboard() {
  const { allMeetings, activeClub, setActiveClub, clubs, addClub, deleteClub, deleteMeeting } = useTasks()
  const navigate = useNavigate()
  const [showAddClub, setShowAddClub] = useState(false)
  const [newClub, setNewClub] = useState("")
  const [expandedMeeting, setExpandedMeeting] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [completedTasks, setCompletedTasks] = useState([])
  const [note, setNote] = useState(() => localStorage.getItem("meetai_note") || "")

  const handleAddClub = () => {
    if (newClub.trim()) {
      addClub(newClub.trim())
      setNewClub("")
      setShowAddClub(false)
    }
  }

  const filteredMeetings = allMeetings.filter(m => {
    return activeClub ? m.club === activeClub : true
  })

  const allTasks = filteredMeetings.flatMap(m =>
    m.tasks.map(t => ({ ...t, meetingId: m.id }))
  )

  const priorityColor = (p) => {
    if (p === "HIGH") return "#ff4d4d"
    if (p === "MEDIUM") return "#f0a500"
    return "#4caf50"
  }

  const toggleComplete = (key) => {
    setCompletedTasks(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const completed = completedTasks.length
  const pending = allTasks.length - completed
  const high = allTasks.filter(t => t.priority === "HIGH").length

  return (
    <div className="app">
      <div className="header">
        <h1>🗒️ MeetAI</h1>
        <p>Your meeting execution hub</p>
      </div>

    {/* Top row */}
<div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "stretch" }}>
  <button
    onClick={() => window.open("https://meet.google.com", "_blank")}
    style={{
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: "12px",
      padding: "12px 20px",
      color: "#f0f0f0",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
      alignSelf: "center"
    }}
  >
    📹 Schedule / Join Meet
  </button>

  <div style={{
    flex: 1,
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column"
  }}>
    <p style={{ fontSize: "0.72rem", color: "#555", marginBottom: "6px" }}>🗒️ Quick Notes</p>
    <textarea
      placeholder="reminders, ideas..."
      value={note}
      onChange={e => {
        setNote(e.target.value)
        localStorage.setItem("meetai_note", e.target.value)
      }}
      style={{
        flex: 1,
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#aaa",
        fontSize: "0.85rem",
        resize: "none",
        fontFamily: "inherit",
        minHeight: "80px"
      }}
    />
  </div>
</div>

      {/* Club Selector */}
      <div className="section-title">Your Clubs</div>
      <div className="club-row">
        {clubs.map(club => (
          <div key={club} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <button
              className={activeClub === club ? "club-btn active" : "club-btn"}
              onClick={() => setActiveClub(activeClub === club ? null : club)}
            >
              {club}
            </button>
            <span
              onClick={() => {
                if (window.confirm(`Delete "${club}" and all its meetings?`)) {
                  deleteClub(club)
                  if (activeClub === club) setActiveClub(null)
                }
              }}
              style={{
                cursor: "pointer", color: "#666",
                fontSize: "0.9rem", userSelect: "none",
                padding: "2px 6px", borderRadius: "4px"
              }}
            >
              ✕
            </span>
          </div>
        ))}
        <button className="club-btn add" onClick={() => setShowAddClub(!showAddClub)}>
          + Add
        </button>
      </div>

      {showAddClub && (
        <div className="add-club-row">
          <input
            placeholder="Club name..."
            value={newClub}
            onChange={e => setNewClub(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddClub()}
          />
          <button className="confirm-btn" onClick={handleAddClub}>Add</button>
        </div>
      )}

      <button className="new-meeting-btn" onClick={() => navigate("/extract")}>
        ⚡ New Meeting
      </button>

      {allTasks.length > 0 && (
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
      )}

      <div className="section-title">
        {activeClub ? `${activeClub} Meetings` : "All Meetings"}
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#666" }}>
          <p>No meetings yet. Start your first one!</p>
        </div>
      ) : (
        filteredMeetings.map(meeting => (
          <div key={meeting.id} className="card">
            <div
              className="meeting-header"
              onClick={() => setExpandedMeeting(
                expandedMeeting === meeting.id ? null : meeting.id
              )}
              style={{ cursor: "pointer" }}
            >
              <div>
                <span className="club-tag">{meeting.club}</span>
                <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "#666" }}>
                  {meeting.date} · {meeting.time}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: "0.85rem" }}>
                  {meeting.tasks.length} tasks
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/extract?edit=${meeting.id}`)
                  }}
                  className="delete-meeting-btn"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm("Delete this meeting?")) {
                      deleteMeeting(meeting.id)
                    }
                  }}
                  className="delete-meeting-btn"
                >
                  🗑️
                </button>
                <span style={{ color: "#666" }}>
                  {expandedMeeting === meeting.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedMeeting === meeting.id && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      let msg = "📋 *Meeting Task Summary*\n\n"
                      meeting.tasks.forEach(t => {
                        msg += `• ${t.owner}: ${t.task} (by ${t.deadline}) [${t.priority}]\n`
                      })
                      msg += "\nLet's get these done! 💪"
                      navigator.clipboard.writeText(msg)
                    }}
                  >
                    💬 Copy WhatsApp
                  </button>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      const rows = [["Owner", "Task", "Deadline", "Priority"]]
                      meeting.tasks.forEach(t => rows.push([t.owner, t.task, t.deadline, t.priority]))
                      const csv = rows.map(r => r.join(",")).join("\n")
                      const blob = new Blob([csv], { type: "text/csv" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `${meeting.club}-${meeting.date}.csv`
                      a.click()
                    }}
                  >
                    📥 Download CSV
                  </button>
                </div>

                {meeting.attendance && (
                  <div className="meeting-section">
                    <p className="meeting-section-title">👥 Attendance</p>
                    <p style={{ color: "#aaa", fontSize: "0.9rem" }}>{meeting.attendance}</p>
                  </div>
                )}

                {meeting.minutes && (
                  <div className="meeting-section">
                    <p className="meeting-section-title">📝 Minutes</p>
                    <p style={{ color: "#aaa", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                      {meeting.minutes}
                    </p>
                  </div>
                )}

                <div className="filters" style={{ marginTop: "12px" }}>
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

                <div className="task-list" style={{ marginTop: "12px" }}>
                  {meeting.tasks
                    .filter(t => priorityFilter === "ALL" || t.priority === priorityFilter)
                    .map((t, i) => {
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
            )}
          </div>
        ))
      )}
    </div>
  )
}