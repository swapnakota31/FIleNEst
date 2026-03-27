import { motion } from 'framer-motion'

function StatsCard({ label, value, icon: Icon, delay = 0, badge = '' }) {
  return (
    <motion.article
      className="stats-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="stats-top-row">
        {Icon ? <Icon size={18} className="stats-icon" /> : null}
        {badge ? <span className="stats-badge">{badge}</span> : null}
      </div>
      <p className="stats-label">{label}</p>
      <h3 className="stats-value">{value}</h3>
    </motion.article>
  )
}

export default StatsCard
