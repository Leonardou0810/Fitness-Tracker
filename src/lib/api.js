// In production (same-origin) use '' so requests go to /api. In dev use full backend URL.
const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000'
const API_BASE = BASE ? `${BASE}/api` : '/api'

async function handleResponse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore JSON parse errors, will fall back to generic messages
  }
  if (!res.ok) {
    const message = data && data.message ? data.message : 'Request failed'
    throw new Error(message)
  }
  return data
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function fetchWorkouts(token) {
  const res = await fetch(`${API_BASE}/workouts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse(res)
}

export async function createWorkout(token, workoutData) {
  const res = await fetch(`${API_BASE}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workoutData),
  })
  return handleResponse(res)
}

export async function updateWorkout(token, id, workoutData) {
  const res = await fetch(`${API_BASE}/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workoutData),
  })
  return handleResponse(res)
}

export async function deleteWorkout(token, id) {
  const res = await fetch(`${API_BASE}/workouts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse(res)
}

