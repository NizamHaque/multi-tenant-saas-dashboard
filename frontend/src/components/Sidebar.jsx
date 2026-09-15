import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { handleAuthError } from '../utils/auth'
import { useChat } from '../context/ChatContext'

export default function Sidebar() {
  const navigate = useNavigate()
  const { unreadCount } = useChat()
  const [email, setEmail] = useState('')
  const tenantName = localStorage.getItem('tenantName') || 'Your Company'

  useEffect(() => {
    api
      .get('/tenant/me')
      .then((res) => setEmail(res.data.email || ''))
      .catch((err) => {
        if (!handleAuthError(err, navigate)) {
          setEmail('')
        }
      })
  }, [navigate])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-company">{tenantName}</p>
        <p className="sidebar-email">{email || 'Loading...'}</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/members"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          Members
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          📋 My Profile
        </NavLink>
        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          📅 Attendance
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `sidebar-link sidebar-link--chat${isActive ? ' active' : ''}`
          }
        >
          💬 Group Chat
          {unreadCount > 0 && (
            <span className="sidebar-unread-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
