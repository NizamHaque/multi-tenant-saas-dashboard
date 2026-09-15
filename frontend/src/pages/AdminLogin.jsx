import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const authApi = axios.create({
  baseURL: 'http://localhost:8080/api',
})

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.post('/auth/admin/login', form)
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('adminRole', res.data.role)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid super admin credentials')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>Super Admin</div>
        <h2 style={styles.title}>Platform Admin Login</h2>
        <p style={styles.subtitle}>
          Separate access to manage all organisations
        </p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Admin email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Admin password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign in as Admin"
            )}
          </button>
        </form>
        <p style={styles.link}>
          <Link to="/login">← Back to tenant login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e1b4b',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '420px',
  },
  badge: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#4f46e5',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.25rem 0.65rem',
    borderRadius: '6px',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  title: { marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 600 },
  subtitle: {
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  error: { color: '#b91c1c', marginBottom: '1rem', fontSize: '0.9rem' },
  link: { marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem' },
}
