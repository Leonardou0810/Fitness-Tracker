import { format } from 'date-fns'
import { BODY_PARTS, deleteWorkoutSession, getWorkoutsGroupedByBodyPart, calcExerciseWorkload } from '../lib/store'
import './WorkoutLog.css'

function WorkoutLog({ workouts, onRefresh, onEdit }) {
  const grouped = getWorkoutsGroupedByBodyPart(workouts)

  const handleDelete = (id) => {
    if (window.confirm('Delete this workout session?')) {
      deleteWorkoutSession(id)
      onRefresh()
    }
  }

  return (
    <div className="workout-log">
      <div className="workout-log-header">
        <h2>Workout Sessions</h2>
        <p className="workout-log-subtitle">
          Sessions grouped by body part. Click Edit to modify.
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <p>No workouts logged yet.</p>
          <p>Start by logging your first workout session.</p>
        </div>
      ) : (
        <div className="workout-log-groups">
          {BODY_PARTS.map(({ id, label, color }) => {
            const sessions = grouped[id] || []
            if (sessions.length === 0) return null

            return (
              <section key={id} className="workout-group">
                <h3 className="workout-group-title" style={{ '--group-color': color }}>
                  {label}
                </h3>
                <div className="session-list">
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session, onEdit, onDelete }) {
  const bodyPart = BODY_PARTS.find((p) => p.id === session.bodyPart)
  const color = bodyPart?.color || '#888'

  return (
    <div className="session-card">
      <div className="session-card-header">
        <span className="session-date">{format(new Date(session.date), 'MMM d, yyyy')}</span>
        <span className="session-dot" style={{ backgroundColor: color }} />
      </div>
      <div className="session-exercises">
        {session.exercises?.map((ex, i) => {
          const workload = calcExerciseWorkload(ex)
          const weightStr = ex.weightsPerSet?.length
            ? ex.weightsPerSet.join(', ') + ' kg/set'
            : ex.weight != null && ex.weight !== '' ? `${ex.weight} kg` : null
          return (
            <div key={i} className="exercise-row">
              <span className="exercise-name">{ex.name}</span>
              <span className="exercise-detail">
                {ex.sets}×{ex.reps}
                {weightStr && ` • ${weightStr}`}
                {workload > 0 && (
                  <span className="exercise-workload-badge">{workload.toLocaleString()} kg workload</span>
                )}
                {ex.muscleGroups?.length > 0 && ` • ${ex.muscleGroups.join(', ')}`}
              </span>
            </div>
          )
        })}
      </div>
      <div className="session-actions">
        <button className="btn-edit" onClick={() => onEdit(session)}>
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(session.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default WorkoutLog
