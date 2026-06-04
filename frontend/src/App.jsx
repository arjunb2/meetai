import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TaskProvider } from "./context/taskcontext"
import Extract from "./pages/extract"
import Dashboard from "./pages/dashboard"
import "./App.css"

export default function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Extract />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  )
}