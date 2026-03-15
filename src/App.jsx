import { useState, useEffect, useCallback } from 'react'
import { fetchWorkouts, createWorkout, updateWorkout, deleteWorkout } from './lib/api'
import Dashboard from './components/Dashboard'
import WorkoutLog from './components/WorkoutLog'
import SessionForm from './components/SessionForm'
import Auth from './components/Auth'
import './App.css'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [view, setView] = useState('dashboard') // dashboard | log | add
  const [editingSession, setEditingSession] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('fittrack-token') || '')
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('fittrack-email') || '')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const setViewAndCloseNav = useCallback((v) => {
    setView(v)
    setNavOpen(false)
  }, [])

  useEffect(() => {
    if (!token) {
      setWorkouts([])
      return
    }
    fetchWorkouts(token)
      .then((serverWorkouts) => {
        // server returns workouts with .data payload; normalise to session shape
        const sessions = serverWorkouts.map((w) => ({
          id: w.id,
          date: w.data.date,
          bodyPart: w.data.bodyPart,
          exercises: w.data.exercises || [],
          notes: w.data.notes || '',
          createdAt: w.created_at,
        }))
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
        setWorkouts(sessions)
      })
      .catch((err) => {
        console.error(err)
        setAuthError(err.message || 'Failed to load workouts')
      })
  }, [token])

  const refreshWorkouts = () => {
    if (!token) return
    fetchWorkouts(token)
      .then((serverWorkouts) => {
        const sessions = serverWorkouts.map((w) => ({
          id: w.id,
          date: w.data.date,
          bodyPart: w.data.bodyPart,
          exercises: w.data.exercises || [],
          notes: w.data.notes || '',
          createdAt: w.created_at,
        }))
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
        setWorkouts(sessions)
      })
      .catch((err) => {
        console.error(err)
        setAuthError(err.message || 'Failed to load workouts')
      })
  }

  const handleSaveSession = async (sessionData, id) => {
    if (!token) return
    try {
      if (id) {
        await updateWorkout(token, id, sessionData)
      } else {
        await createWorkout(token, sessionData)
      }
      refreshWorkouts()
      setEditingSession(null)
      setViewAndCloseNav('log')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save workout')
    }
  }

  const handleDeleteSession = async (id) => {
    if (!token) return
    if (!window.confirm('Delete this workout session?')) return
    try {
      await deleteWorkout(token, id)
      refreshWorkouts()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete workout')
    }
  }

  const handleLogin = async (email, password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await (await import('./lib/api')).login(email, password)
      setToken(data.token)
      setUserEmail(data.user.email)
      localStorage.setItem('fittrack-token', data.token)
      localStorage.setItem('fittrack-email', data.user.email)
    } catch (err) {
      setAuthError(err.message || 'Login failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (email, password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await (await import('./lib/api')).register(email, password)
      setToken(data.token)
      setUserEmail(data.user.email)
      localStorage.setItem('fittrack-token', data.token)
      localStorage.setItem('fittrack-email', data.user.email)
    } catch (err) {
      setAuthError(err.message || 'Registration failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUserEmail('')
    setWorkouts([])
    localStorage.removeItem('fittrack-token')
    localStorage.removeItem('fittrack-email')
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
        {token && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {userEmail}
            </span>
            <button
              type="button"
              className="nav-btn"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
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
            disabled={!token}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${view === 'log' ? 'active' : ''}`}
            onClick={() => setViewAndCloseNav('log')}
            disabled={!token}
          >
            Workouts
          </button>
          <button
            className={`nav-btn ${view === 'add' ? 'active' : ''}`}
            onClick={() => {
              setEditingSession(null)
              setViewAndCloseNav('add')
            }}
            disabled={!token}
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
        {!token ? (
          <Auth
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
            error={authError}
          />
        ) : (
          <>
            {view === 'dashboard' && <Dashboard workouts={workouts} />}
            {view === 'log' && (
              <WorkoutLog
                workouts={workouts}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
              />
            )}
            {view === 'add' && (
              <SessionForm
                session={editingSession}
                onSave={handleSaveSession}
                onCancel={handleCancelEdit}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
