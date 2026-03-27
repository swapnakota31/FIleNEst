import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, Sparkles, Palette } from 'lucide-react'

function Settings() {
  const { theme, setTheme, showToast } = useOutletContext()

  const isDarkMode = theme === 'dark'

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
    showToast(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled', 'info')
  }

  return (
    <motion.section
      className="dashboard-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <article className="settings-card">
        <h3>
          <Sparkles size={18} /> Settings
        </h3>

        <div className="settings-row">
          <div>
            <p className="settings-title">Dark Mode</p>
            <p className="settings-subtitle">
              Switch between light and dark dashboard theme.
            </p>
          </div>

          <button type="button" className="theme-toggle" onClick={handleThemeToggle}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>

        <div className="settings-row appearance-row">
          <div>
            <p className="settings-title">
              <Palette size={16} /> Appearance Preset
            </p>
            <p className="settings-subtitle">
              FileNest automatically remembers your selected theme.
            </p>
          </div>
          <span className="settings-badge">{isDarkMode ? 'Dark Active' : 'Light Active'}</span>
        </div>
      </article>
    </motion.section>
  )
}

export default Settings
