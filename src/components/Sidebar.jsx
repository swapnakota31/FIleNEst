import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

function Sidebar({ items, collapsed, mobileOpen, onClose }) {
  const desktopWidth = collapsed ? 92 : 250

  return (
    <>
      {mobileOpen ? <div className="sidebar-backdrop" onClick={onClose} /> : null}
      <motion.aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
        animate={{ width: desktopWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Sparkles size={14} />
          </div>
          <div className="brand-text-wrap">
            <p className="brand-title">{collapsed ? 'FN' : 'FileNest'}</p>
            {!collapsed ? <p className="brand-subtitle">Cloud Workspace</p> : null}
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">
                <item.icon size={18} />
              </span>
              <span className="sidebar-link-label">
                {collapsed ? item.shortLabel : item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  )
}

export default Sidebar
