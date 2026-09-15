import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import adminApi from '../api/adminAxios'
import { handleAdminAuthError, getErrorMessage } from '../utils/auth'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isTenantActive(tenant) {
  return tenant.isActive ?? tenant.active ?? false
}

export default function SuperAdmin() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .get('/admin/tenants')
      .then((res) => setTenants(res.data))
      .catch((err) => {
        if (!handleAdminAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load organisations'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-header-badge">Super Admin</p>
          <h1 className="admin-header-title">Platform Admin Panel</h1>
        </div>
        <div className="admin-header-actions">
          <Link to="/login" className="admin-header-link">
            Tenant login
          </Link>
          <button type="button" className="admin-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="kpi-grid admin-kpi">
          <div className="kpi-card">
            <p className="kpi-label">Total Organisations</p>
            <p className="kpi-value">{loading ? '—' : tenants.length}</p>
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="page-loading">Loading organisations...</div>
          ) : tenants.length === 0 ? (
            <p className="empty-state">No organisations registered yet</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Subdomain</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.subdomain}</td>
                    <td>
                      <span
                        className={
                          t.plan === 'PRO'
                            ? 'plan-badge plan-badge--pro'
                            : 'plan-badge plan-badge--free'
                        }
                      >
                        {t.plan || 'FREE'}
                      </span>
                    </td>
                    <td>
                      {isTenantActive(t) ? (
                        <span className="status-badge status-badge--active">
                          Active
                        </span>
                      ) : (
                        <span className="status-badge status-badge--inactive">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
