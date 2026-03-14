import { getWeeklyWorkload, getMonthlyWorkload, getWorkloadHistory, BODY_PARTS } from '../lib/store'
import { startOfWeek, startOfMonth, format } from 'date-fns'
import './Dashboard.css'

function Dashboard({ workouts }) {
  const weekly = getWeeklyWorkload()
  const monthly = getMonthlyWorkload()
  const history = getWorkloadHistory(8)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const monthStart = startOfMonth(new Date())

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <h2>Summary Dashboard</h2>
        <p className="dashboard-subtitle">
          Monitor weekly and monthly training workloads, balance, volume, and progress over time
        </p>
      </section>

      <section className="dashboard-section">
        <h3>This Week</h3>
        <p className="period-label">{format(weekStart, 'MMM d')} – This week</p>
        <div className="workload-grid">
          {BODY_PARTS.map(({ id, label, color }) => (
            <WorkloadCard
              key={id}
              bodyPart={label}
              color={color}
              data={weekly[id] || { sets: 0, volume: 0, exercises: 0, workload: 0 }}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>This Month</h3>
        <p className="period-label">{format(monthStart, 'MMMM yyyy')}</p>
        <div className="workload-grid">
          {BODY_PARTS.map(({ id, label, color }) => (
            <WorkloadCard
              key={id}
              bodyPart={label}
              color={color}
              data={monthly[id] || { sets: 0, volume: 0, exercises: 0, workload: 0 }}
            />
          ))}
        </div>
      </section>

      <section className="balance-section">
        <h3>Weekly Balance (by Workload)</h3>
        <p className="balance-subtitle">Compare training volume across body parts</p>
        <BalanceChart data={weekly} />
      </section>

      <section className="progress-section">
        <h3>Progress Over Time</h3>
        <p className="progress-subtitle">Total workload (kg) per week for the last 8 weeks</p>
        <ProgressChart history={history} />
      </section>
    </div>
  )
}

function WorkloadCard({ bodyPart, color, data }) {
  const { sets, volume, exercises, workload = 0 } = data
  return (
    <div className="workload-card" style={{ '--accent': color }}>
      <div className="workload-card-header">
        <span className="workload-card-dot" />
        <span>{bodyPart}</span>
      </div>
      <div className="workload-card-stats">
        <div className="stat stat-workload">
          <span className="stat-value">{workload >= 1000 ? `${(workload / 1000).toFixed(1)}k` : workload}</span>
          <span className="stat-label">Workload (kg)</span>
        </div>
        <div className="stat">
          <span className="stat-value">{sets}</span>
          <span className="stat-label">Sets</span>
        </div>
        <div className="stat">
          <span className="stat-value">{volume}</span>
          <span className="stat-label">Reps</span>
        </div>
        <div className="stat">
          <span className="stat-value">{exercises}</span>
          <span className="stat-label">Exercises</span>
        </div>
      </div>
    </div>
  )
}

function BalanceChart({ data }) {
  const maxWorkload = Math.max(
    ...BODY_PARTS.map(({ id }) => (data[id]?.workload || 0)),
    1
  )

  return (
    <div className="balance-chart">
      {BODY_PARTS.map(({ id, label, color }) => {
        const workload = data[id]?.workload || 0
        const pct = maxWorkload > 0 ? (workload / maxWorkload) * 100 : 0
        const displayWorkload = workload >= 1000 ? `${(workload / 1000).toFixed(1)}k` : workload
        return (
          <div key={id} className="balance-row">
            <span className="balance-label">{label}</span>
            <div className="balance-bar-wrap">
              <div
                className="balance-bar"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                }}
              />
              <span className="balance-value">{displayWorkload} kg</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProgressChart({ history }) {
  const maxTotal = Math.max(...history.map((h) => h.total), 1)

  return (
    <div className="progress-chart">
      <div className="progress-bars">
        {history.map((week, i) => {
          const pct = maxTotal > 0 ? (week.total / maxTotal) * 100 : 0
          return (
            <div key={week.weekStart} className="progress-bar-col">
              <div className="progress-bar-tooltip" title={`${week.total.toLocaleString()} kg`}>
                <div
                  className="progress-bar-fill"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="progress-bar-label">{week.label}</span>
            </div>
          )
        })}
      </div>
      <div className="progress-legend">
        <span>Older</span>
        <span>This week</span>
      </div>
    </div>
  )
}

export default Dashboard
