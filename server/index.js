import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userStore, workoutStore } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const distPath = path.join(__dirname, '..', 'dist')

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'fittrack-dev-secret-change-in-production'

app.use(cors({ origin: true }))
app.use(express.json())

// --- Auth: Register ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const emailNorm = String(email).trim().toLowerCase()
    if (!emailNorm) {
      return res.status(400).json({ message: 'Invalid email' })
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = userStore.getByEmail(emailNorm)
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const userRow = userStore.insert(emailNorm, password_hash)
    const user = { id: userRow.id, email: userRow.email }
    const token = jwt.sign({ userId: user.id, email: userRow.email }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// --- Auth: Login ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const emailNorm = String(email).trim().toLowerCase()

    const row = userStore.getByEmail(emailNorm)
    if (!row) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, row.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = { id: row.id, email: row.email }
    const token = jwt.sign({ userId: row.id, email: row.email }, JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// --- JWT middleware ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// --- Workouts: list ---
app.get('/api/workouts', authMiddleware, (req, res) => {
  try {
    const rows = workoutStore.getByUserId(req.userId)
    const workouts = rows.map((r) => ({
      id: r.id,
      data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
      created_at: r.created_at,
    }))
    res.json(workouts)
  } catch (err) {
    console.error('List workouts error:', err)
    res.status(500).json({ message: 'Failed to load workouts' })
  }
})

// --- Workouts: create ---
app.post('/api/workouts', authMiddleware, (req, res) => {
  try {
    const data = req.body || {}
    const row = workoutStore.insert(req.userId, data)
    res.status(201).json(row)
  } catch (err) {
    console.error('Create workout error:', err)
    res.status(500).json({ message: 'Failed to save workout' })
  }
})

// --- Workouts: update ---
app.put('/api/workouts/:id', authMiddleware, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) return res.status(400).json({ message: 'Invalid workout id' })
    const row = workoutStore.update(id, req.userId, req.body || {})
    if (!row) return res.status(404).json({ message: 'Workout not found' })
    res.json(row)
  } catch (err) {
    console.error('Update workout error:', err)
    res.status(500).json({ message: 'Failed to update workout' })
  }
})

// --- Workouts: delete ---
app.delete('/api/workouts/:id', authMiddleware, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) return res.status(400).json({ message: 'Invalid workout id' })
    const deleted = workoutStore.delete(id, req.userId)
    if (!deleted) return res.status(404).json({ message: 'Workout not found' })
    res.status(204).send()
  } catch (err) {
    console.error('Delete workout error:', err)
    res.status(500).json({ message: 'Failed to delete workout' })
  }
})

// Production: serve frontend build and SPA fallback
if (isProduction && distPath) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`FitTrack API running at http://localhost:${PORT}`)
  if (isProduction) console.log('Serving frontend from dist/')
})
