import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getErrorMessage, handleAuthError, isDemoUser } from '../utils/auth'

export default function InviteModal({ onClose, onSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'VIEWER' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isDemo = isDemoUser()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (isDemo) {
      setTimeout(() => {
        setSubmitting(false)
        onSuccess(`Demo Mode: Simulated member invite for ${form.email}!`)
        onClose()
      }, 400)
      return
    }

    try {
      await api.post('/members/invite', form)
      onSuccess()
      onClose()
    } catch (err) {
      if (!handleAuthError(err, navigate)) {
        setError(getErrorMessage(err, 'Failed to invite member'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Invite Member</h2>
        {isDemo && (
          <div className="alert alert-info" style={{ fontSize: '0.8rem', background: 'rgba(255, 222, 66, 0.15)', color: '#FFDE42', border: '1px solid rgba(255, 222, 66, 0.3)', marginBottom: '1rem' }}>
            ⚡ Demo Mode: Inviting members simulates a successful workflow without altering persistent database records.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label htmlFor="invite-email">Email</label>
          <input
            id="invite-email"
            name="email"
            type="email"
            placeholder="member@company.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="invite-password">Temporary password</label>
          <input
            id="invite-password"
            name="password"
            type="password"
            placeholder="Set a password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <label htmlFor="invite-role">Role</label>
          <select
            id="invite-role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="MANAGER">MANAGER</option>
            <option value="VIEWER">VIEWER</option>
          </select>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
