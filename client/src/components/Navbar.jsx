import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-rule bg-paper">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight text-ink">Ledger</span>
          <span className="font-mono text-xs uppercase tracking-widest text-slate">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="font-mono text-xs text-slate">
              #{String(user.id).padStart(4, '0')} &middot; {user.role}
            </span>
          )}
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="font-body text-sm text-ink border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
