import { useState } from 'react'
import './SessionForm.css'
import './Auth.css'

function Auth({ onLogin, onRegister, loading, error }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    if (mode === 'login') {
      onLogin(email, password)
    } else {
      onRegister(email, password)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        <form className="session-form" onSubmit={handleSubmit}>
          <div className="session-form-header">
            <h2>{mode === 'login' ? 'Sign in to FitTrack' : 'Create your account'}</h2>
            <p className="session-form-subtitle">
              {mode === 'login'
                ? 'Log in to sync your workouts across devices.'
                : 'Register with your email to start tracking workouts.'}
            </p>
          </div>

      <div className="form-row">
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
      </div>

      {error && (
        <p className="session-form-error">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create account'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
        </button>
      </div>
    </form>
      </div>
    </div>
  )
}

export default Auth

