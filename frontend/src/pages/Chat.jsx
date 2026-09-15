import { useEffect, useRef, useState } from 'react'
import { useChat } from '../context/ChatContext'

function ChatRoleBadge({ role }) {
  const styles = {
    ORG_ADMIN: { background: '#ede9fe', color: '#6d28d9' },
    MANAGER: { background: '#dbeafe', color: '#1d4ed8' },
    VIEWER: { background: '#f1f5f9', color: '#64748b' },
  }
  const style = styles[role] || styles.VIEWER
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.1rem 0.45rem',
        borderRadius: '999px',
        fontSize: '0.65rem',
        fontWeight: 600,
        marginLeft: '0.35rem',
        ...style,
      }}
    >
      {role}
    </span>
  )
}

function formatTime(sentAt) {
  if (!sentAt) return ''
  const date = new Date(sentAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function Chat() {
  const {
    messages,
    members,
    loading,
    error,
    connected,
    connecting,
    sendMessage,
    userEmail,
    markChatRead,
  } = useChat()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    markChatRead()
  }, [markChatRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (sendMessage(input)) {
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const addEmoji = () => {
    setInput((prev) => prev + '😊')
  }

  if (loading) {
    return <div className="page-loading">Loading chat...</div>
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">💬 Group Chat</h1>
        <p className="page-subtitle">Real-time organisation messaging</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="chat-shell">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Organisation Chat</h3>
            <div className="chat-connection-status">
              <span
                className="chat-status-dot"
                style={{ background: connected ? '#16a34a' : '#ef4444' }}
              />
              {connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}
            </div>
          </div>
          <p className="chat-members-title">Team Members</p>
          <ul className="chat-members-list">
            {members.map((m) => (
              <li key={m.id || m.email} className="chat-member-item">
                <span className="chat-member-dot" />
                {m.email}
              </li>
            ))}
          </ul>
        </aside>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="empty-state">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isSystem = msg.messageType === 'SYSTEM'
                const isOwn = msg.senderEmail === userEmail

                if (isSystem) {
                  return (
                    <div key={msg.id} className="chat-system-msg">
                      {msg.content}
                    </div>
                  )
                }

                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble-row${isOwn ? ' own' : ''}`}
                  >
                    <div className={`chat-bubble${isOwn ? ' own' : ''}`}>
                      <div className="chat-bubble-header">
                        <span className="chat-sender">{msg.senderEmail}</span>
                        <ChatRoleBadge role={msg.senderRole} />
                      </div>
                      <p className="chat-content">{msg.content}</p>
                      <span className="chat-time">{formatTime(msg.sentAt)}</span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <button
              type="button"
              className="chat-emoji-btn"
              onClick={addEmoji}
              title="Add emoji"
            >
              😊
            </button>
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!connected}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!connected || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
