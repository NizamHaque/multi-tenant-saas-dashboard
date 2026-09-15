import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '../api/axios'
import { handleAuthError } from '../utils/auth'
import InviteModal from '../components/InviteModal'
import { useChat } from '../context/ChatContext'

const EVENT_CONFIG = {
  USER_LOGIN: { label: 'User logged in', dotClass: 'timeline-dot--login' },
  USER_SIGNUP: { label: 'New organisation signup', dotClass: 'timeline-dot--signup' },
  MEMBER_INVITED: { label: 'Member invited to organisation', dotClass: 'timeline-dot--invite' },
}

const TIME_OFFSETS = [
  { minutes: 2, label: 'just now' },
  { minutes: 45, label: null },
  { hours: 2, label: null },
  { hours: 5, label: null },
  { hours: 12, label: null },
]

const HUB_CARDS = [
  { icon: '💬', title: 'Group Chat', desc: 'Talk with your team in real time', path: '/chat', accent: 'hub-card--gold' },
  { icon: '📋', title: 'My Profile', desc: 'Submit details & documents', path: '/profile', accent: 'hub-card--olive' },
  { icon: '📅', title: 'Attendance', desc: 'Mark your daily presence', path: '/attendance', accent: 'hub-card--dark' },
  { icon: '👥', title: 'Members', desc: 'See who is on your team', path: '/members', accent: 'hub-card--cream' },
  { icon: '📊', title: 'Analytics', desc: 'Charts & activity below', path: '#analytics', accent: 'hub-card--olive' },
  { icon: '⚙️', title: 'Settings', desc: 'Organisation preferences', path: '/settings', accent: 'hub-card--gold' },
]

function timeAgo(offset) {
  if (offset.label) return offset.label
  if (offset.minutes) {
    return offset.minutes === 1 ? '1 minute ago' : `${offset.minutes} minutes ago`
  }
  if (offset.hours === 1) return '1 hour ago'
  return `${offset.hours} hours ago`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildTimelineEvents(eventsByType = {}, activityByDay = {}) {
  const events = []
  let idx = 0

  Object.entries(eventsByType).forEach(([type, count]) => {
    const config = EVENT_CONFIG[type] || {
      label: type.replace(/_/g, ' ').toLowerCase(),
      dotClass: 'timeline-dot--default',
    }
    const toAdd = Math.min(count, 3)
    for (let i = 0; i < toAdd; i++) {
      events.push({
        id: `${type}-${i}`,
        description: config.label,
        dotClass: config.dotClass,
        timeAgo: timeAgo(TIME_OFFSETS[idx % TIME_OFFSETS.length]),
      })
      idx++
    }
  })

  if (events.length < 5) {
    const dates = Object.keys(activityByDay).sort().reverse()
    dates.forEach((date, i) => {
      if (events.length >= 5) return
      if (activityByDay[date] > 0) {
        events.push({
          id: `activity-${date}`,
          description: `${activityByDay[date]} event${activityByDay[date] > 1 ? 's' : ''} recorded`,
          dotClass: 'timeline-dot--default',
          timeAgo: i === 0 ? 'today' : `${i + 1} day${i > 0 ? 's' : ''} ago`,
        })
      }
    })
  }

  return events.slice(0, 5)
}

function buildNotifications(activityByDay = {}, eventsByType = {}) {
  const items = []
  const dates = Object.keys(activityByDay).sort().reverse()

  dates.slice(0, 3).forEach((date, i) => {
    const count = activityByDay[date]
    if (count > 0) {
      items.push({
        id: `day-${date}`,
        text: `${count} event${count > 1 ? 's' : ''} on ${date.slice(5)}`,
        time: i === 0 ? 'Today' : `${i}d ago`,
        read: false,
      })
    }
  })

  Object.entries(eventsByType).forEach(([type, count]) => {
    if (count > 0 && items.length < 5) {
      const config = EVENT_CONFIG[type]
      items.push({
        id: `type-${type}`,
        text: `${count} ${config?.label || type.replace(/_/g, ' ').toLowerCase()}${count > 1 ? 's' : ''}`,
        time: 'Recent',
        read: false,
      })
    }
  })

  return items.slice(0, 5)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { unreadCount } = useChat()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)

  const tenantName = localStorage.getItem('tenantName') || 'Your Company'
  const role = localStorage.getItem('role')
  const canInvite = role === 'ORG_ADMIN'

  useEffect(() => {
    api
      .get('/analytics/stats')
      .then((res) => {
        setStats(res.data)
        setNotifications(
          buildNotifications(res.data.activityByDay, res.data.eventsByType)
        )
      })
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError('Failed to load dashboard data')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadNotifs = notifications.filter((n) => !n.read).length

  const handleNotifClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const scrollToAnalytics = () => {
    document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleHubClick = (path) => {
    if (path === '#analytics') scrollToAnalytics()
    else navigate(path)
  }

  if (loading) {
    return <div className="page-loading">Loading your workspace...</div>
  }

  if (error || !stats) {
    return <div className="alert alert-error">{error || 'No data available'}</div>
  }

  const activityData = Object.entries(stats.activityByDay || {}).map(
    ([date, count]) => ({ date: date.slice(5), events: count })
  )
  const eventTypeData = Object.entries(stats.eventsByType || {}).map(
    ([type, count]) => ({ type: type.replace(/_/g, ' '), count })
  )
  const timelineEvents = buildTimelineEvents(stats.eventsByType, stats.activityByDay)
  const todayCount = activityData[activityData.length - 1]?.events ?? 0

  return (
    <div className="dash-home">
      {/* Welcome banner */}
      <section className="dash-welcome">
        <div className="dash-welcome-text">
          <p className="dash-welcome-greet">{getGreeting()} 👋</p>
          <h1 className="dash-welcome-title">{tenantName}</h1>
          <p className="dash-welcome-sub">
            Here&apos;s what&apos;s happening in your workspace today.
            {todayCount > 0
              ? ` ${todayCount} event${todayCount > 1 ? 's' : ''} so far.`
              : ' A quiet day so far — perfect time to explore!'}
          </p>
        </div>
        <div className="dash-welcome-actions">
          {canInvite && (
            <button type="button" className="dash-btn dash-btn--gold" onClick={() => setShowInvite(true)}>
              + Invite Member
            </button>
          )}
          <div className="notification-wrapper" ref={notifRef}>
            <button
              type="button"
              className="dash-btn dash-btn--outline notification-bell"
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Notifications"
            >
              🔔 Alerts
              {unreadNotifs > 0 && (
                <span className="notification-badge">{unreadNotifs}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <p className="notification-dropdown-title">Recent Activity</p>
                {notifications.length === 0 ? (
                  <p className="notification-empty">All caught up!</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`notification-item${n.read ? ' read' : ''}`}
                          onClick={() => handleNotifClick(n.id)}
                        >
                          <span className="notification-text">{n.text}</span>
                          <span className="notification-time">{n.time}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick stats pills */}
      <div className="dash-stats-row">
        <div className="dash-stat-pill">
          <span className="dash-stat-icon">👥</span>
          <div>
            <p className="dash-stat-num">{stats.totalMembers}</p>
            <p className="dash-stat-lbl">Team Members</p>
          </div>
        </div>
        <div className="dash-stat-pill">
          <span className="dash-stat-icon">⚡</span>
          <div>
            <p className="dash-stat-num">{stats.totalEvents}</p>
            <p className="dash-stat-lbl">Total Events</p>
          </div>
        </div>
        <div className="dash-stat-pill">
          <span className="dash-stat-icon">📈</span>
          <div>
            <p className="dash-stat-num">{todayCount}</p>
            <p className="dash-stat-lbl">Today&apos;s Activity</p>
          </div>
        </div>
        <div className="dash-stat-pill">
          <span className="dash-stat-icon">🏷️</span>
          <div>
            <p className="dash-stat-num">{Object.keys(stats.eventsByType || {}).length}</p>
            <p className="dash-stat-lbl">Event Types</p>
          </div>
        </div>
      </div>

      {/* Feature hub bento grid */}
      <section className="dash-hub">
        <h2 className="dash-section-title">Your Workspace</h2>
        <p className="dash-section-sub">Jump into any feature — everything you need, one click away</p>
        <div className="dash-hub-grid">
          {HUB_CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              className={`hub-card ${card.accent}`}
              onClick={() => handleHubClick(card.path)}
            >
              <span className="hub-card-icon">{card.icon}</span>
              <span className="hub-card-title">{card.title}</span>
              <span className="hub-card-desc">{card.desc}</span>
              {card.path === '/chat' && unreadCount > 0 && (
                <span className="hub-card-badge">{unreadCount} new</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Analytics bento */}
      <section id="analytics" className="dash-bento">
        <div className="dash-bento-chart dash-bento-chart--wide">
          <h3 className="chart-title">Activity — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#FFDE42"
                strokeWidth={3}
                dot={{ r: 5, fill: '#FFDE42', stroke: '#1B0C0C', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#FFDE42' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-bento-side">
          <div className="dash-bento-chart">
            <h3 className="chart-title">Events by Type</h3>
            {eventTypeData.length === 0 ? (
              <p className="empty-state">No events yet — invite your team!</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={eventTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFDE42" stroke="#1B0C0C" strokeWidth={1} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dash-bento-timeline">
            <h3 className="chart-title">Recent Activity</h3>
            {timelineEvents.length === 0 ? (
              <p className="empty-state" style={{ padding: '1rem' }}>Nothing yet today</p>
            ) : (
              <ul className="activity-timeline">
                {timelineEvents.map((event, i) => (
                  <li key={event.id} className="timeline-item">
                    <div className="timeline-track">
                      <span className={`timeline-dot ${event.dotClass}`} />
                      {i < timelineEvents.length - 1 && <span className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-text">{event.description}</p>
                      <p className="timeline-time">{event.timeAgo}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false)
            api.get('/analytics/stats').then((res) => {
              setStats(res.data)
              setNotifications(
                buildNotifications(res.data.activityByDay, res.data.eventsByType)
              )
            })
          }}
        />
      )}
    </div>
  )
}
