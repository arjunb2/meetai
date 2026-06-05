import { createContext, useContext, useState, useEffect } from "react"

const DEFAULT_CLUBS = ["Horizon", "SEDS", "TEDx", "General"]

const TaskContext = createContext()

export function TaskProvider({ children }) {
  const [allMeetings, setAllMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem("meetai_meetings")
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [activeClub, setActiveClub] = useState(null)

  const [clubs, setClubs] = useState(() => {
    try {
      const saved = localStorage.getItem("meetai_clubs")
      return saved ? JSON.parse(saved) : DEFAULT_CLUBS
    } catch { return DEFAULT_CLUBS }
  })

  useEffect(() => {
    localStorage.setItem("meetai_meetings", JSON.stringify(allMeetings))
  }, [allMeetings])

  useEffect(() => {
    localStorage.setItem("meetai_clubs", JSON.stringify(clubs))
  }, [clubs])

  const saveMeeting = (tasks, club, minutes, attendance) => {
    const meeting = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      club,
      minutes,
      attendance,
      tasks
    }
    setAllMeetings(prev => [meeting, ...prev])
  }

  const deleteMeeting = (id) => {
    setAllMeetings(prev => prev.filter(m => m.id !== id))
  }

  const updateMeeting = (id, updatedData) => {
    setAllMeetings(prev =>
      prev.map(m => m.id === id ? { ...m, ...updatedData } : m)
    )
  }

  const addClub = (name) => {
    if (name.trim() && !clubs.includes(name.trim())) {
      setClubs(prev => [...prev, name.trim()])
    }
  }

  const deleteClub = (name) => {
    setClubs(prev => prev.filter(c => c !== name))
    setAllMeetings(prev => prev.filter(m => m.club !== name))
  }

  return (
    <TaskContext.Provider value={{
      allMeetings, saveMeeting, deleteMeeting, updateMeeting,
      activeClub, setActiveClub,
      clubs, addClub, deleteClub
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  return useContext(TaskContext)
}