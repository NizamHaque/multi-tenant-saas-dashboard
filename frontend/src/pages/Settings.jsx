import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { handleAuthError, getErrorMessage } from '../utils/auth'
import RoleBadge from '../components/RoleBadge'

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/tenant/me'), api.get('/members')])
      .then(([userRes, membersRes]) => {
        setUser(userRes.data)
        setMemberCount(membersRes.data?.length ?? 0)
        if (userRes.data.tenantId) {
          localStorage.setItem('tenantId', userRes.data.tenantId)
        }
      })
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load settings'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return <div className="page-loading">Loading settings...</div>
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  const tenantName = localStorage.getItem('tenantName') || 'Your Company'
  const tenantId = user?.tenantId || localStorage.getItem('tenantId') || '—'
  const subdomain = localStorage.getItem('subdomain') || 'yourcompany'
  const plan = 'FREE'
  const initial = tenantName.charAt(0).toUpperCase()

  const handleUpgrade = () => {
    alert('Feature coming soon! Pro plans will be available shortly.')
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Your organisation and account details</p>
      </header>

      <div className="org-profile-card">
        <div className="org-profile-header">
          <div className="org-avatar">{initial}</div>
          <div className="org-profile-info">
            <h2 className="org-name">{tenantName}</h2>
            <p className="org-subdomain">
              {subdomain}.saas-platform.com
            </p>
          </div>
          <span className={`org-plan-badge org-plan-badge--${plan.toLowerCase()}`}>
            {plan}
          </span>
        </div>

        <div className="org-profile-stats">
          <div className="org-stat">
            <span className="org-stat-value">{memberCount}</span>
            <span className="org-stat-label">Team Members</span>
          </div>
          <div className="org-stat">
            <span className="org-stat-value">
              {tenantId !== '—' && tenantId.length > 8
                ? `${tenantId.slice(0, 8)}…`
                : tenantId}
            </span>
            <span className="org-stat-label">Tenant ID</span>
          </div>
        </div>

        <button type="button" className="org-upgrade-btn" onClick={handleUpgrade}>
          Upgrade to Pro
        </button>
      </div>

      <div className="settings-divider" />

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Your account</h3>
          <div className="settings-row">
            <span className="settings-label">Email</span>
            <span className="settings-value">{user?.email || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Role</span>
            <span className="settings-value">
              {user?.role ? <RoleBadge role={user.role} /> : '—'}
            </span>
          </div>
        </div>

        <div className="settings-card">
          <h3>Organisation details</h3>
          <div className="settings-row">
            <span className="settings-label">Company name</span>
            <span className="settings-value">{tenantName}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Subdomain</span>
            <span className="settings-value">{subdomain}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Plan</span>
            <span className="settings-value">{plan}</span>
          </div>
        </div>
      </div>
    </>
  )
}
