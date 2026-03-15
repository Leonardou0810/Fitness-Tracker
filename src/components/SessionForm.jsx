import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  BODY_PARTS,
  calcExerciseWorkload,
} from '../lib/store'
import './SessionForm.css'

const today = format(new Date(), 'yyyy-MM-dd')

/** Parse weight input: "80" or "80,85,90" → single weight or array per set */
function parseWeightInput(val, sets) {
  if (!val || !val.trim()) return null
  const parts = val.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return null
  const nums = parts.map((p) => (parseFloat(p) || 0))
  if (nums.length === 1) return nums[0]
  return nums
}

function SessionForm({ session, onSave, onCancel }) {
  const isEditing = !!session

  const [date, setDate] = useState(today)
  const [bodyPart, setBodyPart] = useState('chest')
  const [exercises, setExercises] = useState([
    { name: '', reps: '', sets: '', weight: '', weightsPerSet: null, muscleGroups: [] },
  ])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (session) {
      setDate(format(new Date(session.date), 'yyyy-MM-dd'))
      setBodyPart(session.bodyPart || 'chest')
      setExercises(
        session.exercises?.length > 0
          ? session.exercises.map((e) => {
              const w = e.weightsPerSet && Array.isArray(e.weightsPerSet)
                ? e.weightsPerSet.join(', ')
                : (e.weight != null && e.weight !== '' ? String(e.weight) : '')
              return {
                name: e.name || '',
                reps: String(e.reps ?? ''),
                sets: String(e.sets ?? ''),
                weight: w,
                weightsPerSet: e.weightsPerSet || null,
                muscleGroups: e.muscleGroups || [],
              }
            })
          : [{ name: '', reps: '', sets: '', weight: '', weightsPerSet: null, muscleGroups: [] }]
      )
      setNotes(session.notes || '')
    }
  }, [session])

  const addExercise = () => {
    setExercises([...exercises, { name: '', reps: '', sets: '', weight: '', weightsPerSet: null, muscleGroups: [] }])
  }

  const removeExercise = (index) => {
    if (exercises.length <= 1) return
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index, field, value) => {
    setExercises(
      exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    )
  }

  const toggleMuscleGroup = (exIndex, groupId) => {
    setExercises(
      exercises.map((ex, i) => {
        if (i !== exIndex) return ex
        const current = ex.muscleGroups || []
        const next = current.includes(groupId)
          ? current.filter((g) => g !== groupId)
          : [...current, groupId]
        return { ...ex, muscleGroups: next }
      })
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const cleanedExercises = exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => {
        const parsed = parseWeightInput(ex.weight, Number(ex.sets) || 0)
        const weight = typeof parsed === 'number' ? parsed : null
        const weightsPerSet = Array.isArray(parsed) && parsed.length > 0 ? parsed : null
        return {
          name: ex.name.trim(),
          reps: Number(ex.reps) || 0,
          sets: Number(ex.sets) || 0,
          weight: weight,
          weightsPerSet: weightsPerSet,
          muscleGroups: ex.muscleGroups || [],
        }
      })

    if (cleanedExercises.length === 0) {
      alert('Add at least one exercise with a name.')
      return
    }

    const payload = {
      date: new Date(date).toISOString().slice(0, 10),
      bodyPart,
      exercises: cleanedExercises,
      notes: notes.trim(),
    }

    onSave(payload, isEditing ? session.id : null)
  }

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <div className="session-form-header">
        <h2>{isEditing ? 'Edit Workout Session' : 'Log Workout'}</h2>
        <p className="session-form-subtitle">
          Record your exercises with sets, reps, and muscle groups
        </p>
      </div>

      <div className="form-row">
        <label>
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          <span>Body Part</span>
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            required
          >
            {BODY_PARTS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="exercises-section">
        <div className="exercises-header">
          <h3>Exercises</h3>
          <button type="button" className="btn-add" onClick={addExercise}>
            + Add Exercise
          </button>
        </div>

        {exercises.map((ex, index) => (
          <div key={index} className="exercise-block">
            <div className="exercise-fields">
              <div className="field-name">
                <input
                  type="text"
                  placeholder="Exercise name (e.g. Bench Press)"
                  value={ex.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                />
              </div>
              <div className="field-numbers">
                <div className="field-number">
                  <span className="number-label">Sets</span>
                  <input
                    type="number"
                    placeholder="—"
                    min="1"
                    value={ex.sets}
                    onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                  />
                </div>
                <div className="field-number">
                  <span className="number-label">Reps</span>
                  <input
                    type="number"
                    placeholder="—"
                    min="0"
                    value={ex.reps}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                  />
                </div>
                <div className="field-number field-weight">
                  <span className="number-label">Weight (kg)</span>
                  <input
                    type="text"
                    placeholder="80 or 80,85,90 per set"
                    value={ex.weight}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                  />
                </div>
              </div>
              {(() => {
                const parsed = parseWeightInput(ex.weight)
                const exForCalc = {
                  reps: Number(ex.reps) || 0,
                  sets: Number(ex.sets) || 0,
                  weight: typeof parsed === 'number' ? parsed : (parsed?.length === 1 ? parsed[0] : null),
                  weightsPerSet: Array.isArray(parsed) && parsed.length > 1 ? parsed : null,
                }
                const workload = calcExerciseWorkload(exForCalc)
                return workload > 0 ? (
                  <div className="exercise-workload">
                    Total workload: <strong>{workload.toLocaleString()} kg</strong>
                  </div>
                ) : null
              })()}
              <div className="field-muscles">
                <span className="field-label">Muscle groups:</span>
                <div className="muscle-chips">
                  {BODY_PARTS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      className={`chip ${ex.muscleGroups?.includes(id) ? 'active' : ''}`}
                      onClick={() => toggleMuscleGroup(index, id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeExercise(index)}
              disabled={exercises.length <= 1}
              title="Remove exercise"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <label className="field-notes">
        <span>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes..."
          rows={2}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {isEditing ? 'Save Changes' : 'Log Workout'}
        </button>
      </div>
    </form>
  )
}

export default SessionForm
