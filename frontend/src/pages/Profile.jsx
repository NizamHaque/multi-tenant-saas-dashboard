import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { handleAuthError, getErrorMessage } from '../utils/auth'
import RoleBadge from '../components/RoleBadge'

const DOC_TYPES = [
  { value: 'RESUME', label: 'Resume' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'MARKSHEET', label: 'Marksheet' },
  { value: 'OTHER', label: 'Other Document' },
]

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  education: '',
  designation: '',
  department: '',
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function downloadDocument(docId, fileName) {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `http://localhost:8080/api/profile/documents/${docId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

function DocumentList({ documents, onDelete, canDelete }) {
  if (!documents?.length) {
    return <p className="profile-no-docs">No documents uploaded yet.</p>
  }

  return (
    <ul className="profile-doc-list">
      {documents.map((doc) => (
        <li key={doc.id} className="profile-doc-item">
          <div className="profile-doc-info">
            <span className="profile-doc-type">{doc.documentType}</span>
            <span className="profile-doc-name">{doc.originalName}</span>
            <span className="profile-doc-meta">
              {formatFileSize(doc.fileSize)}
              {doc.uploadedAt &&
                ` · ${new Date(doc.uploadedAt).toLocaleDateString()}`}
            </span>
          </div>
          <div className="profile-doc-actions">
            <button
              type="button"
              className="profile-doc-btn"
              onClick={() => downloadDocument(doc.id, doc.originalName)}
            >
              Download
            </button>
            {canDelete && (
              <button
                type="button"
                className="profile-doc-btn profile-doc-btn--danger"
                onClick={() => onDelete(doc.id)}
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function MemberProfileForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [docType, setDocType] = useState('RESUME')
  const fileRef = useRef(null)

  const loadProfile = () => {
    api
      .get('/profile/me')
      .then((res) => {
        setProfile(res.data)
        setForm({
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          dateOfBirth: res.data.dateOfBirth || '',
          education: res.data.education || '',
          designation: res.data.designation || '',
          department: res.data.department || '',
        })
      })
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load profile'))
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.put('/profile/me', form)
      setProfile(res.data)
      setSuccess('Profile saved successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      if (!handleAuthError(err, navigate)) {
        setError(getErrorMessage(err, 'Failed to save profile'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    setUploading(true)
    setError('')
    setSuccess('')
    const data = new FormData()
    data.append('file', file)
    data.append('documentType', docType)
    try {
      const res = await api.post('/profile/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(res.data)
      setSuccess('Document uploaded successfully!')
      fileRef.current.value = ''
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      if (!handleAuthError(err, navigate)) {
        setError(getErrorMessage(err, 'Failed to upload document'))
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (documentId) => {
    if (!window.confirm('Remove this document?')) return
    try {
      const res = await api.delete(`/profile/documents/${documentId}`)
      setProfile(res.data)
      setSuccess('Document removed')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      if (!handleAuthError(err, navigate)) {
        setError(getErrorMessage(err, 'Failed to remove document'))
      }
    }
  }

  if (loading) {
    return <div className="page-loading">Loading your profile...</div>
  }

  return (
    <div className="profile-form-wrap">
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="profile-form" onSubmit={handleSave}>
        <h3 className="profile-section-title">Basic Details</h3>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="profile-field">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Engineering"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="education">Education</label>
            <input
              id="education"
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="B.Tech Computer Science"
            />
          </div>
          <div className="profile-field profile-field--full">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Your full address"
              rows={3}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="profile-upload-section">
        <h3 className="profile-section-title">Upload Documents</h3>
        <p className="profile-section-sub">
          Upload your resume, certificates, marksheets, and other documents.
        </p>
        <div className="profile-upload-row">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="profile-doc-select"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="profile-file-input"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <DocumentList
          documents={profile?.documents}
          onDelete={handleDeleteDoc}
          canDelete
        />
      </div>
    </div>
  )
}

function AdminProfileViewer() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/profile/members')
      .then((res) => setProfiles(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load member profiles'))
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const viewProfile = (email) => {
    api
      .get(`/profile/members/${encodeURIComponent(email)}`)
      .then((res) => setSelected(res.data))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setError(getErrorMessage(err, 'Failed to load profile'))
        }
      })
  }

  if (loading) {
    return <div className="page-loading">Loading member profiles...</div>
  }

  return (
    <div className="profile-admin-wrap">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-admin-layout">
        <div className="profile-admin-list">
          <h3 className="profile-section-title">Team Members</h3>
          {profiles.length === 0 ? (
            <p className="empty-state">No profiles submitted yet</p>
          ) : (
            <ul className="profile-member-list">
              {profiles.map((p) => (
                <li key={p.id || p.userEmail}>
                  <button
                    type="button"
                    className={`profile-member-btn${
                      selected?.userEmail === p.userEmail ? ' active' : ''
                    }`}
                    onClick={() => viewProfile(p.userEmail)}
                  >
                    <span className="profile-member-name">
                      {p.fullName || p.userEmail}
                    </span>
                    <span className="profile-member-email">{p.userEmail}</span>
                    <span className="profile-member-meta">
                      {p.documents?.length || 0} document
                      {(p.documents?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="profile-admin-detail">
          {!selected ? (
            <p className="empty-state">
              Select a member to view their profile and documents
            </p>
          ) : (
            <>
              <div className="profile-detail-header">
                <h3>{selected.fullName || selected.userEmail}</h3>
                <p className="profile-detail-email">{selected.userEmail}</p>
              </div>

              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Phone</span>
                  <span>{selected.phone || '—'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Date of Birth</span>
                  <span>{selected.dateOfBirth || '—'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Designation</span>
                  <span>{selected.designation || '—'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Department</span>
                  <span>{selected.department || '—'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Education</span>
                  <span>{selected.education || '—'}</span>
                </div>
                <div className="profile-detail-item profile-detail-item--full">
                  <span className="profile-detail-label">Address</span>
                  <span>{selected.address || '—'}</span>
                </div>
              </div>

              <h4 className="profile-section-title">Uploaded Documents</h4>
              <DocumentList
                documents={selected.documents}
                canDelete={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const role = localStorage.getItem('role')
  const isAdmin = role === 'ORG_ADMIN'

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">📋 Member Profile</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'View team member profiles and uploaded documents'
            : 'Fill in your details and upload your documents'}
        </p>
      </header>

      {isAdmin ? (
        <>
          <div className="profile-tabs-note">
            <RoleBadge role="ORG_ADMIN" /> Admin view — personal data is
            confidential to your organisation
          </div>
          <AdminProfileViewer />
        </>
      ) : (
        <MemberProfileForm />
      )}
    </>
  )
}
