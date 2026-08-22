import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'Admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-display text-4xl text-ink tracking-tight">Ledger</div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate mt-2">
            Attendance &middot; Leave &middot; Payroll
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-rule p-8 bg-paper">
          <h1 className="font-display text-xl text-ink mb-6">Sign in</h1>

          <label className="block mb-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
              placeholder="you@company.com"
            />
          </label>

          <label className="block mb-6">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="mb-4 font-body text-sm text-danger border border-danger px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-body text-sm py-2.5 hover:bg-signal hover:text-ink transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mt-6 text-center font-body text-sm text-slate">
            New here?{' '}
            <Link to="/signup" className="text-ink underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
