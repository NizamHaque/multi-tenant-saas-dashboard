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
  .auth-progress {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    z-index: 2;
  }
  .auth-progress-bar {
    width: 120px;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    margin-top: 0.4rem;
    overflow: hidden;
  }
  .auth-progress-fill {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #4C5C2D, #FFDE42);
    border-radius: 4px;
  }
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
    .auth-progress {
      display: none;
    }
  }
`

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName: '', subdomain: '', email: '', password: ''
  })
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
      const res = await api.post('/auth/signup', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('tenantName', res.data.tenantName)
      localStorage.setItem('subdomain', form.subdomain)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
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
      setError(getErrorMessage(err, 'Failed to launch demo session. Please try normal signup or login.'))
      setDemoLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <style>{authStyles}</style>
      <div className="auth-gradient" />
      <Link to="/" className="auth-back">← Back to Home</Link>

      <div className="auth-progress">
        Step 1 of 1
        <div className="auth-progress-bar">
          <div className="auth-progress-fill" />
        </div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Create your organisation</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="subdomain"
            placeholder="Subdomain (e.g. acme)"
            value={form.subdomain}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Admin email"
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
          <button className="auth-button" type="submit" disabled={loading || demoLoading}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Creating account...
              </>
            ) : (
              "Sign Up"
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
