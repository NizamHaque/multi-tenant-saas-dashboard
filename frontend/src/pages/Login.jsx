import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { loginAsDemo, getErrorMessage } from '../utils/auth'

const authStyles = `
  @keyframes authGradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1B0C0C;
    position: relative;
    overflow: hidden;
    padding: 2rem;
  }
  .auth-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #313E17, #4C5C2D, #FFDE42, #313E17);
    background-size: 300% 300%;
    animation: authGradientShift 10s ease-in-out infinite;
    opacity: 0.2;
  }
  .auth-back {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
    text-decoration: none;
    z-index: 2;
    transition: color 0.2s;
  }
  .auth-back:hover { color: #FFDE42; }
  .auth-card {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    position: relative;
    z-index: 1;
  }
  .auth-title {
    color: #fff;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    font-weight: 600;
  }
  .auth-input {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
    color: #fff;
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.4); }
  .auth-input:focus { border-color: #FFDE42; }
  .auth-button {
    width: 100%;
    padding: 0.85rem;
    background: #FFDE42;
    color: #1B0C0C;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(255, 222, 66, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .auth-button:hover:not(:disabled) { transform: translateY(-1px); }
  .auth-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .auth-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.25rem 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
  }
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
  .auth-divider span {
    padding: 0 0.75rem;
  }
  .auth-secondary-button {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 222, 66, 0.08);
    color: #FFDE42;
    border: 1px solid rgba(255, 222, 66, 0.3);
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .auth-secondary-button:hover:not(:disabled) {
    background: rgba(255, 222, 66, 0.16);
    border-color: rgba(255, 222, 66, 0.5);
    transform: translateY(-1px);
  }
  .auth-secondary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .auth-error { color: #ef4444; margin-bottom: 1rem; font-size: 0.9rem; }
  .auth-link { margin-top: 1.25rem; text-align: center; font-size: 0.9rem; color: rgba(255,255,255,0.6); }
  .auth-link a { color: #FFDE42; }
  .auth-forgot {
    display: block;
    text-align: right;
    font-size: 0.85rem;
    color: #FFDE42;
    margin: -0.5rem 0 1rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 100%;
    font-family: inherit;
  }
  .auth-forgot:hover { text-decoration: underline; }
  .auth-admin-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding: 0.65rem 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255, 222, 66, 0.08);
    color: #FFDE42;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
  }
  @media (max-width: 480px) {
    .auth-card {
      padding: 1.75rem 1.25rem;
    }
    .auth-title {
      font-size: 1.25rem;
    }
    .auth-back {
      top: 1rem;
      left: 1rem;
    }
  }
`

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('tenantName', res.data.tenantName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError('')
    setDemoLoading(true)
    try {
      await loginAsDemo()
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to launch demo session. Please try normal login.'))
      setDemoLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <style>{authStyles}</style>
      <div className="auth-gradient" />
      <Link to="/" className="auth-back">← Back to Home</Link>

      <div className="auth-card">
        <h2 className="auth-title">Sign in to your dashboard</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="auth-forgot"
            onClick={() => alert('Feature coming soon')}
          >
            Forgot password?
          </button>
          <button className="auth-button" type="submit" disabled={loading || demoLoading}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-secondary-button"
          onClick={handleDemoLogin}
          disabled={demoLoading || loading}
        >
          {demoLoading ? (
            <>
              <span className="button-spinner"></span>
              Opening Demo...
            </>
          ) : (
            <>
              ⚡ Continue as Guest
            </>
          )}
        </button>

        <p className="auth-link">
          New here? <Link to="/signup">Create organisation</Link>
        </p>
        <Link to="/admin/login" className="auth-admin-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Super Admin Panel
        </Link>
      </div>
    </div>
  )
}
