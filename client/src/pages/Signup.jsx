import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

const RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), label: 'One special character' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ employeeId: '', email: '', password: '', role: 'Employee' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.signup(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-display text-4xl text-ink tracking-tight">Ledger</div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate mt-2">New account</div>
        </div>

        <form onSubmit={handleSubmit} className="border border-rule p-8 bg-paper">
          <h1 className="font-display text-xl text-ink mb-6">Create account</h1>

          <label className="block mb-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Employee ID</span>
            <input
              required
              value={form.employeeId}
              onChange={(e) => update('employeeId', e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
              placeholder="EMP-1042"
            />
          </label>

          <label className="block mb-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
              placeholder="you@company.com"
            />
          </label>

          <label className="block mb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
              placeholder="••••••••"
            />
          </label>

          <ul className="mb-4 mt-2 space-y-1">
            {RULES.map((rule) => {
              const pass = rule.test(form.password)
              return (
                <li key={rule.label} className={`font-mono text-[11px] flex items-center gap-2 ${pass ? 'text-success' : 'text-slate'}`}>
                  <span>{pass ? '✓' : '·'}</span> {rule.label}
                </li>
              )
            })}
          </ul>

          <label className="block mb-6">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Role</span>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink outline-none"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          {error && (
            <div className="mb-4 font-body text-sm text-danger border border-danger px-3 py-2">{error}</div>
          )}
          {success && (
            <div className="mb-4 font-body text-sm text-success border border-success px-3 py-2">
              Account created. Redirecting to sign in…
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-body text-sm py-2.5 hover:bg-signal hover:text-ink transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div className="mt-6 text-center font-body text-sm text-slate">
            Already have an account?{' '}
            <Link to="/login" className="text-ink underline underline-offset-2">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
