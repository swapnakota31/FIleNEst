import { Menu, LogOut, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

function Header({ title, theme, onToggleSidebar, onToggleTheme, onLogout }) {
  const isDark = theme === 'dark'

  return (
    <header className="app-header">
      <div className="header-left">
        <motion.button
          type="button"
          className="header-toggle"
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Menu size={18} />
        </motion.button>
        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">FileNest Workspace</p>
        </div>
      </div>

      <div className="header-right">
        <motion.button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </motion.button>

        <motion.button
          type="button"
          className="header-logout"
          onClick={onLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </motion.button>
      </div>
    </header>
  )
}

export default Header
