import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

function FileItem({
  name,
  size,
  dateLabel,
  dateValue,
  tag = '',
  fileIcon: FileIcon = FileText,
  actions = []
}) {
  return (
    <motion.article
      className="file-item"
      whileHover={{ y: -3, scale: 1.002 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className="file-main">
        <div className="file-title-row">
          <FileIcon size={18} className="file-type-icon" />
          <h3 className="file-name">{name}</h3>
        </div>
        <p className="file-meta">
          {size} • {dateLabel}: {dateValue}
        </p>
        {tag ? <span className="file-tag">{tag}</span> : null}
      </div>

      <div className="file-actions">
        {actions.map((action) => (
          action.href ? (
            <motion.a
              key={action.label}
              className={`file-action-btn ${action.variant || ''}`}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {action.icon ? <action.icon size={14} /> : null}
              <span>{action.label}</span>
            </motion.a>
          ) : (
            <motion.button
              key={action.label}
              type="button"
              className={`file-action-btn ${action.variant || ''}`}
              onClick={action.onClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {action.icon ? <action.icon size={14} /> : null}
              <span>{action.label}</span>
            </motion.button>
          )
        ))}
      </div>
    </motion.article>
  )
}

export default FileItem
