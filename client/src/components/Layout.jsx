import Sidebar from './Sidebar.jsx'

export default function Layout({ user, title, subtitle, action, children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {(title || action) && (
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                {title && <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
              </div>
              {action}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
