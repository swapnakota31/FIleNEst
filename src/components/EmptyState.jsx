import { motion } from 'framer-motion'
import { Archive } from 'lucide-react'

function EmptyState({
  icon: Icon = Archive,
  title = 'Nothing here yet',
  description = 'Try a different action to get started.'
}) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="empty-state-icon">
        <Icon size={20} />
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.div>
  )
}

export default EmptyState
