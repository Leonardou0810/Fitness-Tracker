import { format, startOfWeek, startOfMonth, subWeeks } from 'date-fns'

const STORAGE_KEY = 'fittrack-workouts'

/**
 * Calculate total workload for an exercise.
 * Single weight: workload = reps × sets × weight
 * Weights per set: workload = sum of (reps × weight) for each set
 */
export function calcExerciseWorkload(ex) {
  const reps = Number(ex.reps) || 0
  const sets = Number(ex.sets) || 0
  const weights = ex.weightsPerSet
  if (weights && Array.isArray(weights) && weights.length > 0) {
    return weights.reduce((sum, w) => sum + reps * (Number(w) || 0), 0)
  }
  const weight = ex.weight != null && ex.weight !== '' ? Number(ex.weight) : 0
  return reps * sets * weight
}

export const BODY_PARTS = [
  { id: 'chest', label: 'Chest', color: '#ef4444' },
  { id: 'back', label: 'Back', color: '#3b82f6' },
  { id: 'arms', label: 'Arms', color: '#f59e0b' },
  { id: 'legs', label: 'Legs', color: '#8b5cf6' },
  { id: 'shoulders', label: 'Shoulders', color: '#06b6d4' },
  { id: 'core', label: 'Core', color: '#ec4899' },
]

export function loadWorkouts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

// The functions below are kept for backward compatibility,
// but can also operate on an explicitly provided workouts array.

export function getWorkoutsByDateRange(start, end, workoutsArg) {
  const workouts = Array.isArray(workoutsArg) ? workoutsArg : loadWorkouts()
  return workouts.filter((w) => {
    const d = new Date(w.date)
    return d >= start && d <= end
  })
}

export function getWeeklyWorkload(workoutsArg) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const workouts = getWorkoutsByDateRange(weekStart, weekEnd, workoutsArg)

  const byBodyPart = BODY_PARTS.reduce((acc, { id }) => {
    acc[id] = { sets: 0, exercises: 0, volume: 0, workload: 0 }
    return acc
  }, {})

  workouts.forEach((session) => {
    const part = session.bodyPart
    if (!byBodyPart[part]) return
    session.exercises.forEach((ex) => {
      const sets = Number(ex.sets) || 0
      const reps = Number(ex.reps) || 0
      const workload = calcExerciseWorkload(ex)
      byBodyPart[part].sets += sets
      byBodyPart[part].exercises += 1
      byBodyPart[part].volume += sets * reps
      byBodyPart[part].workload += workload
    })
  })

  return byBodyPart
}

export function getMonthlyWorkload(workoutsArg) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

  const workouts = getWorkoutsByDateRange(monthStart, monthEnd, workoutsArg)

  const byBodyPart = BODY_PARTS.reduce((acc, { id }) => {
    acc[id] = { sets: 0, exercises: 0, volume: 0, workload: 0 }
    return acc
  }, {})

  workouts.forEach((session) => {
    const part = session.bodyPart
    if (!byBodyPart[part]) return
    session.exercises.forEach((ex) => {
      const sets = Number(ex.sets) || 0
      const reps = Number(ex.reps) || 0
      const workload = calcExerciseWorkload(ex)
      byBodyPart[part].sets += sets
      byBodyPart[part].exercises += 1
      byBodyPart[part].volume += sets * reps
      byBodyPart[part].workload += workload
    })
  })

  return byBodyPart
}

/**
 * Get workload history for progress tracking (last N weeks)
 */
export function getWorkloadHistory(weeks = 8, workoutsArg) {
  const workouts = Array.isArray(workoutsArg) ? workoutsArg : loadWorkouts()
  const now = new Date()
  const history = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekWorkouts = getWorkoutsByDateRange(weekStart, weekEnd, workouts)
    const byBodyPart = BODY_PARTS.reduce((acc, { id }) => {
      acc[id] = 0
      return acc
    }, {})
    weekWorkouts.forEach((session) => {
      const part = session.bodyPart
      if (byBodyPart[part] != null) {
        session.exercises.forEach((ex) => {
          byBodyPart[part] += calcExerciseWorkload(ex)
        })
      }
    })
    history.push({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      label: format(weekStart, 'MMM d'),
      byBodyPart,
      total: Object.values(byBodyPart).reduce((a, b) => a + b, 0),
    })
  }
  return history
}

export function getWorkoutsGroupedByBodyPart(workoutsArg) {
  const workouts = Array.isArray(workoutsArg) ? workoutsArg : loadWorkouts()
  const grouped = {}
  BODY_PARTS.forEach(({ id }) => (grouped[id] = []))
  workouts.forEach((w) => {
    if (grouped[w.bodyPart]) {
      grouped[w.bodyPart].push(w)
    } else {
      grouped[w.bodyPart] = [w]
    }
  })
  return grouped
}

