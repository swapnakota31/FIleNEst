function FileListItem({ name, size, dateLabel, dateValue, actions = [] }) {
  return (
    <article className="file-item">
      <div className="file-main">
        <h3 className="file-name">{name}</h3>
        <p className="file-meta">
          {size} • {dateLabel}: {dateValue}
        </p>
      </div>

      <div className="file-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`file-action-btn ${action.variant || ''}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  )
}

export default FileListItem
