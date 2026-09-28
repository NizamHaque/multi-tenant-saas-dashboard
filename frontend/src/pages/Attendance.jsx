import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '../api/axios'
import { handleAuthError, getErrorMessage, isDemoUser } from '../utils/auth'

function StatusBadge({ status }) {
  const present = status === 'PRESENT'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: present ? '#dcfce7' : '#fef2f2',
        color: present ? '#15803d' : '#b91c1c',
      }}
    >
      {status}
    </span>
  )
}

function MemberView() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchStatus = useCallback(() => {
    api
      .get('/attendance/today/status')
      .then((res) => setStatus(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load attendance status'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleMarkPresent = async () => {
    setError('')
    setSuccess('')
    setMarking(true)

    if (isDemoUser()) {
      setTimeout(() => {
        setMarking(false)
        setStatus({ marked: true, status: 'PRESENT' })
        setSuccess('Demo Mode: Attendance marked present locally!')
        setTimeout(() => setSuccess(''), 4000)
      }, 300)
      return
    }

    try {
      await api.post('/attendance/mark')
      setSuccess('Attendance marked successfully!')
      fetchStatus()
    } catch (err) {
      if (!handleAuthError(err, navigate)) {
        setError(
          err.response?.data?.message ||
            getErrorMessage(err, 'Failed to mark attendance')
        )
      }
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return <div className="page-loading">Loading attendance...</div>
  }

  const isMarked = status?.marked || status?.status === 'PRESENT'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="attendance-member-view">
      <div className="attendance-date-card">
        <p className="attendance-date-label">Today</p>
        <p className="attendance-date-value">{today}</p>
      </div>

      <div className="attendance-status-card">
        <p className="attendance-status-label">Your Status</p>
        <p
          className="attendance-status-value"
          style={{ color: isMarked ? '#16a34a' : '#ef4444' }}
        >
          {isMarked ? 'Present ✓' : 'Not Marked'}
        </p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="button"
        className="attendance-mark-btn"
        disabled={isMarked || marking}
        onClick={handleMarkPresent}
        style={{
          background: isMarked
            ? '#16a34a'
            : '#FFDE42',
          opacity: isMarked ? 0.85 : 1,
          cursor: isMarked ? 'not-allowed' : 'pointer',
        }}
      >
        {marking ? 'Marking...' : isMarked ? 'Already Marked ✓' : 'Mark Present'}
      </button>
    </div>
  )
}

function AdminTodayTab() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchToday = useCallback(() => {
    api
      .get('/attendance/today')
      .then((res) => setRecords(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load today attendance'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    fetchToday()
    const interval = setInterval(fetchToday, 30000)
    return () => clearInterval(interval)
  }, [fetchToday])

  const presentCount = records.filter((r) => r.status === 'PRESENT').length

  if (loading && records.length === 0) {
    return <div className="page-loading">Loading today&apos;s attendance...</div>
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <p className="attendance-summary">
        <strong>{presentCount}</strong> out of <strong>{records.length}</strong>{' '}
        members present today
      </p>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.email}>
                <td>{r.email}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminHistoryTab() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [emailFilter, setEmailFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    api
      .get('/attendance/history')
      .then((res) => setHistory(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load history'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const memberEmails = useMemo(() => {
    const emails = [...new Set(history.map((r) => r.userEmail))]
    return emails.sort()
  }, [history])

  const filtered = useMemo(() => {
    return history
      .filter((r) => {
        if (emailFilter !== 'ALL' && r.userEmail !== emailFilter) return false
        if (dateFrom && r.date < dateFrom) return false
        if (dateTo && r.date > dateTo) return false
        return true
      })
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return (b.markedAt || '').localeCompare(a.markedAt || '')
      })
  }, [history, emailFilter, dateFrom, dateTo])

  if (loading) {
    return <div className="page-loading">Loading history...</div>
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="attendance-filters">
        <div className="attendance-filter-group">
          <label htmlFor="email-filter">Member</label>
          <select
            id="email-filter"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          >
            <option value="ALL">All members</option>
            {memberEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>
        <div className="attendance-filter-group">
          <label htmlFor="date-from">From</label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="attendance-filter-group">
          <label htmlFor="date-to">To</label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty-state">No records match your filters</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.userEmail}</td>
                  <td>{r.date}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {r.markedAt
                      ? new Date(r.markedAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function AdminAnalyticsTab() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/attendance/analytics')
      .then((res) => setAnalytics(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load analytics'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return <div className="page-loading">Loading analytics...</div>
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  const byDate = analytics?.attendanceByDate || {}
  const dateChartData = Object.entries(byDate)
    .map(([date, count]) => ({ date: date.slice(5), count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)

  const byMember = analytics?.attendanceByMember || {}
  const memberChartData = Object.entries(byMember)
    .map(([email, count]) => ({
      email: email.split('@')[0],
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Total Members</p>
          <p className="kpi-value">{analytics.totalMembers}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Present Today</p>
          <p className="kpi-value">{analytics.totalPresentToday}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Total Records</p>
          <p className="kpi-value">{analytics.totalRecords}</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Attendance by Date (Last 14 Days)</h3>
          {dateChartData.length === 0 ? (
            <p className="empty-state">No attendance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#FFDE42" stroke="#1B0C0C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Attendance by Member</h3>
          {memberChartData.length === 0 ? (
            <p className="empty-state">No attendance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={memberChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="email" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B0C0C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminView() {
  const [tab, setTab] = useState('today')

  return (
    <div>
      <div className="attendance-tabs">
        {[
          { id: 'today', label: 'Today' },
          { id: 'history', label: 'History' },
          { id: 'analytics', label: 'Analytics' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`attendance-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && <AdminTodayTab />}
      {tab === 'history' && <AdminHistoryTab />}
      {tab === 'analytics' && <AdminAnalyticsTab />}
    </div>
  )
}

export default function Attendance() {
  const role = localStorage.getItem('role')
  const isAdmin = role === 'ORG_ADMIN'

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">📅 Attendance</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Manage and monitor team attendance'
            : 'Mark your daily attendance'}
        </p>
      </header>

      {isAdmin ? <AdminView /> : <MemberView />}
    </>
  )
}
