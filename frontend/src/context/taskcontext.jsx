import { createContext, useContext, useState } from "react"

const TaskContext = createContext()

export function TaskProvider({ children }) {
  const [allMeetings, setAllMeetings] = useState([])

  const saveMeeting = (tasks) => {
    const meeting = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      tasks
    }
    setAllMeetings(prev => [meeting, ...prev])
  }

  return (
    <TaskContext.Provider value={{ allMeetings, saveMeeting }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  return useContext(TaskContext)
}