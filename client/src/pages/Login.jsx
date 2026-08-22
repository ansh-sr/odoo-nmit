import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Mail, Lock, IdCard, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [role, setRole] = useState('Employee')

  function handleSubmit(e) {
    e.preventDefault()
    // Auth isn't wired up yet — route straight to the matching dashboard
    // so the rest of the app can be demoed.
    navigate(role === 'HR' ? '/admin' : '/employee')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:col-span-2 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent">
            <Sun size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold">Dayflow</span>
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Every workday,
            <br />
            perfectly aligned.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Onboarding, attendance, leave and payroll visibility — one calm
            place for your whole team to start the day.
          </p>
        </div>

        <p className="relative text-xs text-white/40">© 2026 Dayflow HRMS · Hackathon build</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-canvas px-6 py-12 lg:col-span-3">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-accent">
              <Sun size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-ink">Dayflow</span>
          </div>

          <div className="mb-6 flex rounded-lg border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'signin' ? 'bg-ink text-white' : 'text-muted'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-ink text-white' : 'text-muted'
              }`}
            >
              Create account
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Set up your account'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin'
              ? 'Sign in to view your dashboard.'
              : 'Register with your employee ID to get started.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Employee ID</label>
                <div className="relative">
                  <IdCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="input pl-10" placeholder="EMP001" required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" className="input pl-10" placeholder="you@dayflow.io" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="password" className="input pl-10" placeholder="••••••••" required />
              </div>
            </div>

            <div>
              <label className="label">Sign in as (demo)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Employee', 'HR'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3.5 py-2.5 text-sm font-medium transition ${
                      role === r
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-surface text-muted hover:bg-canvas'
                    }`}
                  >
                    {r === 'HR' ? 'Admin / HR' : 'Employee'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-accent w-full">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
              <ArrowRight size={16} />
            </button>

            <p className="text-center text-xs text-muted">
              Authentication is UI-only for this build — any details will work.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
