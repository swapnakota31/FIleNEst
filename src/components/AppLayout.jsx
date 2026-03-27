import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Trash2,
  User,
  Settings as SettingsIcon
} from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import Toast from './Toast'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [toasts, setToasts] = useState([])

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const sidebarItems = useMemo(
    () => [
      {
        path: '/dashboard',
        label: 'Dashboard',
        shortLabel: 'D',
        icon: LayoutDashboard
      },
      {
        path: '/my-files',
        label: 'My Files',
        shortLabel: 'F',
        icon: FolderOpen
      },
      {
        path: '/deleted-files',
        label: 'Deleted Files',
        shortLabel: 'X',
        icon: Trash2
      },
      { path: '/profile', label: 'Profile', shortLabel: 'P', icon: User },
      {
        path: '/settings',
        label: 'Settings',
        shortLabel: 'S',
        icon: SettingsIcon
      }
    ],
    []
  )

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/my-files': 'My Files',
    '/deleted-files': 'Deleted Files',
    '/profile': 'Profile',
    '/settings': 'Settings'
  }

  const pageTitle = pageTitles[location.pathname] || 'FileNest'

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen((prev) => !prev)
      return
    }

    setCollapsed((prev) => !prev)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen(false)
    }
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()

    setToasts((prev) => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3200)
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="authenticated-app">
      <Sidebar
        items={sidebarItems}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={closeMobileSidebar}
      />

      <section className="app-content-shell">
        <Header
          title={pageTitle}
          onToggleSidebar={handleToggleSidebar}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
        />

        <main className="app-page-area">
          <Outlet context={{ user, setUser, theme, setTheme, showToast }} />
        </main>
      </section>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default AppLayout
