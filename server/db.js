import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
const usersPath = join(dataDir, 'users.json')
const workoutsPath = join(dataDir, 'workouts.json')

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

function loadJSON(path, defaultVal = []) {
  try {
    const raw = readFileSync(path, 'utf8')
    return JSON.parse(raw)
  } catch {
    return defaultVal
  }
}

function saveJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

// In-memory store, persisted to JSON files
let users = loadJSON(usersPath, [])
let workouts = loadJSON(workoutsPath, [])

function persist() {
  saveJSON(usersPath, users)
  saveJSON(workoutsPath, workouts)
}

export const userStore = {
  getByEmail(email) {
    return users.find((u) => u.email === email.toLowerCase()) || null
  },
  getById(id) {
    return users.find((u) => u.id === id) || null
  },
  insert(email, password_hash) {
    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
    const created_at = new Date().toISOString()
    const user = { id, email: email.toLowerCase(), password_hash, created_at }
    users.push(user)
    persist()
    return user
  },
}

export const workoutStore = {
  getByUserId(userId) {
    return workouts.filter((w) => w.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },
  getByIdAndUser(id, userId) {
    const w = workouts.find((w) => w.id === id && w.user_id === userId)
    return w || null
  },
  insert(userId, data) {
    const id = workouts.length ? Math.max(...workouts.map((w) => w.id)) + 1 : 1
    const created_at = new Date().toISOString()
    const row = { id, user_id: userId, data: JSON.stringify(data), created_at }
    workouts.push(row)
    persist()
    return { id, data: typeof data === 'string' ? JSON.parse(data) : data, created_at }
  },
  update(id, userId, data) {
    const w = workouts.find((w) => w.id === id && w.user_id === userId)
    if (!w) return null
    w.data = JSON.stringify(data)
    persist()
    return { id: w.id, data: typeof data === 'string' ? JSON.parse(data) : data, created_at: w.created_at }
  },
  delete(id, userId) {
    const idx = workouts.findIndex((w) => w.id === id && w.user_id === userId)
    if (idx === -1) return false
    workouts.splice(idx, 1)
    persist()
    return true
  },
}

export default { userStore, workoutStore }
