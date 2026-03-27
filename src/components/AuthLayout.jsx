function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <header className="auth-header">
          <h1 className="app-name">FileNest</h1>
          <p className="app-subtitle">Store, manage and share your files</p>
          <h2 className="auth-title">{title}</h2>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </main>
  )
}

export default AuthLayout
