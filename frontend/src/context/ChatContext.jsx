import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '../api/axios'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const location = useLocation()
  const pathRef = useRef(location.pathname)
  const userEmailRef = useRef('')

  const [unreadCount, setUnreadCount] = useState(() =>
    parseInt(localStorage.getItem('chatUnread') || '0', 10)
  )
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [tenantId, setTenantId] = useState(localStorage.getItem('tenantId') || '')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '')

  const clientRef = useRef(null)
  const joinedRef = useRef(false)

  useEffect(() => {
    pathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    userEmailRef.current = userEmail
  }, [userEmail])

  const markChatRead = useCallback(() => {
    setUnreadCount(0)
    localStorage.setItem('chatUnread', '0')
  }, [])

  useEffect(() => {
    if (location.pathname === '/chat') {
      markChatRead()
    }
  }, [location.pathname, markChatRead])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    Promise.all([api.get('/chat/messages'), api.get('/tenant/me'), api.get('/members')])
      .then(([msgRes, meRes, membersRes]) => {
        setMessages(msgRes.data || [])
        const email = meRes.data.email || ''
        setUserEmail(email)
        userEmailRef.current = email
        setUserRole(meRes.data.role || localStorage.getItem('role') || '')
        const tid = meRes.data.tenantId || localStorage.getItem('tenantId') || ''
        setTenantId(tid)
        if (tid) localStorage.setItem('tenantId', tid)
        setMembers(membersRes.data || [])
      })
      .catch(() => setError('Failed to load chat'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!tenantId || !userEmail || loading) return

    const token = localStorage.getItem('token')
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        setConnecting(false)

        client.subscribe(`/topic/chat.${tenantId}`, (message) => {
          const parsed = JSON.parse(message.body)
          setMessages((prev) => {
            if (prev.some((m) => m.id === parsed.id)) return prev
            return [...prev, parsed]
          })

          const isOwn = parsed.senderEmail === userEmailRef.current
          const isSystem = parsed.messageType === 'SYSTEM'
          const onChatPage = pathRef.current === '/chat'

          if (!onChatPage && !isOwn && !isSystem) {
            setUnreadCount((c) => {
              const next = c + 1
              localStorage.setItem('chatUnread', String(next))
              return next
            })
          }
        })

        if (!joinedRef.current && userEmail) {
          joinedRef.current = true
          client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({
              tenantId,
              senderEmail: userEmail,
              senderRole: userRole,
              content: `${userEmail} joined the chat`,
              messageType: 'SYSTEM',
            }),
          })
        }
      },
      onDisconnect: () => {
        setConnected(false)
        setConnecting(true)
      },
      onStompError: () => {
        setConnected(false)
        setConnecting(false)
      },
      onWebSocketClose: () => {
        setConnected(false)
        setConnecting(true)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [tenantId, userEmail, userRole, loading])

  const sendMessage = useCallback(
    (content, messageType = 'TEXT') => {
      if (!content.trim() || !clientRef.current?.connected) return false
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          tenantId,
          senderEmail: userEmail,
          senderRole: userRole,
          content: content.trim(),
          messageType,
        }),
      })
      return true
    },
    [tenantId, userEmail, userRole]
  )

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        markChatRead,
        messages,
        members,
        loading,
        error,
        connected,
        connecting,
        sendMessage,
        userEmail,
        userRole,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
