import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info
}

function Toast({ toasts = [], onDismiss }) {
  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info

          return (
            <motion.div
              key={toast.id}
              className={`toast-item ${toast.type || 'info'}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="toast-main">
                <Icon size={16} />
                <p>{toast.message}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default Toast
