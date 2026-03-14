import { useState, useEffect, useCallback } from 'react'
import { loadWorkouts } from './lib/store'
import Dashboard from './components/Dashboard'
import WorkoutLog from './components/WorkoutLog'
import SessionForm from './components/SessionForm'
import './App.css'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [view, setView] = useState('dashboard') // dashboard | log | add
  const [editingSession, setEditingSession] = useState(null)
  const [navOpen, setNavOpen] = useState(false)

  const setViewAndCloseNav = useCallback((v) => {
    setView(v)
    setNavOpen(false)
  }, [])

  useEffect(() => {
    setWorkouts(loadWorkouts())
  }, [])

  const refreshWorkouts = () => {
    setWorkouts(loadWorkouts())
  }

  const handleSaveSession = (sessionData) => {
    refreshWorkouts()
    setEditingSession(null)
    setViewAndCloseNav('log')
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setViewAndCloseNav('add')
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setViewAndCloseNav('log')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">FitTrack</h1>
        <button
          type="button"
          className={`nav-toggle ${navOpen ? 'is-open' : ''}`}
          onClick={() => setNavOpen((o) => !o)}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
        <nav className={`app-nav ${navOpen ? 'is-open' : ''}`}>
          <button
            className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setViewAndCloseNav('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${view === 'log' ? 'active' : ''}`}
            onClick={() => setViewAndCloseNav('log')}
          >
            Workouts
          </button>
          <button
            className={`nav-btn ${view === 'add' ? 'active' : ''}`}
            onClick={() => {
              setEditingSession(null)
              setViewAndCloseNav('add')
            }}
          >
            Log Workout
          </button>
        </nav>
      </header>
      {navOpen && (
        <div
          className="nav-overlay"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="app-main">
        {view === 'dashboard' && <Dashboard workouts={workouts} />}
        {view === 'log' && (
          <WorkoutLog
            workouts={workouts}
            onRefresh={refreshWorkouts}
            onEdit={handleEditSession}
          />
        )}
        {view === 'add' && (
          <SessionForm
            session={editingSession}
            onSave={handleSaveSession}
            onCancel={handleCancelEdit}
          />
        )}
      </main>
    </div>
  )
}

export default App
