import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ChatProvider } from '../context/ChatContext'

export default function AppLayout() {
  return (
    <ChatProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ChatProvider>
  )
}
