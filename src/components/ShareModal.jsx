import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, Link2, MessageCircle, X } from 'lucide-react'

function ShareModal({
  file,
  isOpen,
  isLoading,
  onClose,
  onShare,
  onUnshare,
  onCopySuccess,
  shareResult,
  shareError
}) {
  const [expiryOption, setExpiryOption] = useState('none')

  if (!isOpen || !file) {
    return null
  }

  const handleShareSubmit = async (event) => {
    event.preventDefault()
    await onShare(expiryOption)
  }

  const handleCopy = async () => {
    if (!shareResult?.shareLink) {
      return
    }

    await navigator.clipboard.writeText(shareResult.shareLink)

    if (onCopySuccess) {
      onCopySuccess()
    }
  }

  const whatsappShareUrl = shareResult?.shareLink
    ? `https://wa.me/?text=${encodeURIComponent(`File shared with you: ${shareResult.shareLink}`)}`
    : ''

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Share file">
      <motion.article
        className="modal-card"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <h3>Share File</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p className="auth-subtitle">{file.file_name}</p>

        <form className="modal-form" onSubmit={handleShareSubmit}>
          <label className="form-label" htmlFor="share-expiry">
            Link expiry
          </label>
          <select
            id="share-expiry"
            className="toolbar-select"
            value={expiryOption}
            onChange={(event) => setExpiryOption(event.target.value)}
          >
            <option value="1hour">1 hour</option>
            <option value="1day">1 day</option>
            <option value="7days">7 days</option>
            <option value="none">No expiry</option>
          </select>

          <button type="submit" className="primary-button" disabled={isLoading}>
            <Link2 size={16} />
            {isLoading ? 'Generating...' : 'Generate Share Link'}
          </button>
        </form>

        {shareError ? <p className="form-message error">{shareError}</p> : null}

        {shareResult?.shareLink ? (
          <div className="share-result-box">
            <p className="auth-subtitle">Link:</p>
            <p className="share-link-text">{shareResult.shareLink}</p>
            <p className="auth-subtitle">
              Expiry:{' '}
              {shareResult.shareExpiry
                ? new Date(shareResult.shareExpiry).toLocaleString()
                : 'No expiry'}
            </p>

            <div className="share-actions-row">
              <button type="button" className="file-action-btn" onClick={handleCopy}>
                <Copy size={14} />
                <span>Copy</span>
              </button>

              <a
                className="file-action-btn"
                href={shareResult.shareLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} />
                <span>Open Link</span>
              </a>

              <a
                className="file-action-btn"
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                className="file-action-btn danger"
                onClick={onUnshare}
                disabled={isLoading}
              >
                <span>Unshare</span>
              </button>
            </div>
          </div>
        ) : null}
      </motion.article>
    </div>
  )
}

export default ShareModal
