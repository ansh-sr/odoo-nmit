import Sidebar from './Sidebar';

export default function Layout({ children, user, title, subtitle, action }) {
  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">
        {(title || subtitle || action) && (
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              {title && <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>}
              {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}