import { useState, useEffect } from 'react'
import { Pencil, Check, Briefcase, Wallet } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { getUserId } from '../lib/auth.js'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function Profile() {
  const userId = getUserId()
  const [profile, setProfile] = useState(null)
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ phone: '', address: '' })
  const [error, setError] = useState('')

  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  const loadProfile = async () => {
    try {
      const [profileRes, payrollRes] = await Promise.all([
        fetch(`${apiUrl}/profile/${userId}`),
        fetch(`${apiUrl}/payroll/${userId}`),
      ])
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
        setForm({ phone: data.phone || '', address: data.address || '' })
      }
      setPayroll(payrollRes.ok ? await payrollRes.json() : [])
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) loadProfile()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${apiUrl}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      const data = await res.json()
      setProfile(data)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEdit = () => {
    if (editing) {
      handleSave()
    } else {
      setEditing(true)
    }
  }

  if (loading) {
    return (
      <Layout title="My Profile">
        <p className="text-muted">Loading your profile…</p>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout title="My Profile">
        <p className="text-muted">We couldn't find a profile for this account yet.</p>
      </Layout>
    )
  }

  const avatar = (profile.full_name || profile.employee_id || '?').slice(0, 2).toUpperCase()
  const latestPayroll = [...payroll].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0]

  return (
    <Layout
      user={{ name: profile.full_name || profile.employee_id, avatar }}
      title="My Profile"
      subtitle="Personal details and job info."
      action={
        <button onClick={handleToggleEdit} disabled={saving} className={editing ? 'btn-primary' : 'btn-ghost'}>
          {editing ? <Check size={16} /> : <Pencil size={16} />}
          {editing ? (saving ? 'Saving…' : 'Save changes') : 'Edit profile'}
        </button>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent-deep">
            {avatar}
          </div>
          <p className="mt-4 font-display text-lg font-bold text-ink">{profile.full_name || 'Name not set'}</p>
          <p className="text-sm text-muted">{profile.job_title || 'Job title not set'}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-indigo-soft px-3 py-1 text-xs font-semibold text-indigo">
            {profile.role}
          </span>

          <div className="mt-6 w-full space-y-2 border-t border-line pt-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Employee ID</p>
            <p className="text-sm font-medium text-ink">{profile.employee_id}</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h3 className="font-display text-base font-semibold text-ink">Personal details</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={profile.full_name || ''} disabled />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={profile.email} disabled />
              </div>
              <div>
                <label className="label">Mobile number</label>
                <input
                  className="input"
                  value={form.phone}
                  placeholder="Not added yet"
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={form.address}
                  placeholder="Not added yet"
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
            {editing && (
              <p className="mt-3 text-xs text-muted">You can edit your mobile number and address here.</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-accent-deep" />
              <h3 className="font-display text-base font-semibold text-ink">Job details</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Job title</p>
                <p className="text-sm font-medium text-ink">{profile.job_title || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Role</p>
                <p className="text-sm font-medium text-ink">{profile.role}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Joined on</p>
                <p className="text-sm font-medium text-ink">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-accent-deep" />
              <h3 className="font-display text-base font-semibold text-ink">Latest payroll</h3>
            </div>
            {latestPayroll ? (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted">Base</p>
                  <p className="text-sm font-semibold text-ink">{currency.format(latestPayroll.base_salary)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Bonuses</p>
                  <p className="text-sm font-semibold text-ink">{currency.format(latestPayroll.bonuses)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Net salary</p>
                  <p className="text-sm font-semibold text-ink">{currency.format(latestPayroll.net_salary)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No payroll records added yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
