import { useState, useEffect } from 'react'
import { UserPlus, Copy, Check, Trash2 } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function AdminEmployeeIds() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const fetchEntries = () => {
    setLoading(true)
    fetch(`${apiUrl}/admin/employees`)
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to fetch employee IDs:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) {
      setError('Enter a name for the employee first.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/admin/employees/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to generate Employee ID')
      }
      setFullName('')
      fetchEntries()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employeeId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/employees/${employeeId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to remove Employee ID')
      }
      fetchEntries()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCopy = (employeeId) => {
    navigator.clipboard?.writeText(employeeId)
    setCopiedId(employeeId)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <Layout
      title="Generate Employee ID"
      subtitle="Create an Employee ID and assign it a name. Share the ID with them so they can sign up with their own email."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-ink">New Employee ID</h3>
          {error && (
            <div className="mt-3 rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger">{error}</div>
          )}
          <form onSubmit={handleGenerate} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Employee name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Nair"
                className="w-full rounded-lg border border-line p-2.5 outline-none focus:border-indigo"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-accent w-full justify-center">
              <UserPlus size={16} />
              {submitting ? 'Generating…' : 'Generate ID'}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted">
            The employee signs up with this Employee ID plus their own email and password. An ID can only be used once.
          </p>
        </div>

        <div className="card lg:col-span-3">
          <h3 className="font-display text-base font-semibold text-ink">Issued Employee IDs</h3>
          <div className="mt-4 space-y-2.5">
            {loading && <p className="text-sm text-muted">Loading…</p>}
            {!loading && entries.length === 0 && (
              <p className="text-sm text-muted">No Employee IDs generated yet.</p>
            )}
            {entries.map((entry) => (
              <div
                key={entry.employee_id}
                className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-ink">{entry.employee_id}</p>
                    <button
                      onClick={() => handleCopy(entry.employee_id)}
                      className="text-muted hover:text-ink"
                      title="Copy ID"
                    >
                      {copiedId === entry.employee_id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted">{entry.full_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={entry.is_registered ? 'Present' : 'Pending'} />
                  {!entry.is_registered && (
                    <button
                      onClick={() => handleDelete(entry.employee_id)}
                      className="text-muted hover:text-danger"
                      title="Remove unused ID"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
