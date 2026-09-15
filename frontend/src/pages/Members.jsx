import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { handleAuthError, getErrorMessage } from '../utils/auth'
import RoleBadge from '../components/RoleBadge'
import InviteModal from '../components/InviteModal'

export default function Members() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const role = localStorage.getItem('role')
  const canInvite = role === 'ORG_ADMIN'

  const fetchMembers = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/members')
      .then((res) => setMembers(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load members'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleInviteSuccess = () => {
    setSuccess('Member invited successfully')
    fetchMembers()
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Members</h1>
        <p className="page-subtitle">Manage your organisation&apos;s team</p>
      </header>

      <div className="members-toolbar">
        <div />
        {canInvite && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Invite Member
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="page-loading">Loading members...</div>
        ) : members.length === 0 ? (
          <p className="empty-state">No members found</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.email}</td>
                  <td>
                    <RoleBadge role={m.role} />
                  </td>
                  <td style={{ color: '#64748b' }}>
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!canInvite && (
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>
          Only organisation admins can invite new members.
        </p>
      )}

      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </>
  )
}
