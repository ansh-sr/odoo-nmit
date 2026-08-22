import { useState, useEffect } from 'react'
import { Search, Wallet, Pencil, X, Check } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { getUserId } from '../lib/auth.js'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const todayStr = () => new Date().toISOString().slice(0, 10)

const emptyPayForm = { base_salary: '', bonuses: '', deductions: '', payment_date: todayStr() }

export default function AdminPayroll() {
  const userId = getUserId()
  const [adminProfile, setAdminProfile] = useState(null)
  const [employees, setEmployees] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)

  const [showPayForm, setShowPayForm] = useState(false)
  const [payForm, setPayForm] = useState(emptyPayForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyPayForm)

  const loadEmployees = async () => {
    try {
      const [profileRes, employeesRes] = await Promise.all([
        userId ? fetch(`${apiUrl}/profile/${userId}`) : Promise.resolve(null),
        fetch(`${apiUrl}/admin/payroll`),
      ])
      if (profileRes && profileRes.ok) setAdminProfile(await profileRes.json())
      const list = employeesRes.ok ? await employeesRes.json() : []
      setEmployees(list)
      setSelectedId((prev) => prev ?? (list.length > 0 ? list[0].user_id : null))
    } catch (err) {
      console.error('Failed to load employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async (id) => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`${apiUrl}/payroll/${id}`)
      setHistory(res.ok ? await res.json() : [])
    } catch (err) {
      console.error('Failed to load payroll history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (selectedId == null) {
      setHistory([])
      return
    }
    setShowPayForm(false)
    setEditingId(null)
    loadHistory(selectedId)
  }, [selectedId])

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase()
    return (
      (e.full_name || '').toLowerCase().includes(q) ||
      (e.job_title || '').toLowerCase().includes(q) ||
      (e.employee_id || '').toLowerCase().includes(q)
    )
  })
  const selected = employees.find((e) => e.user_id === selectedId)

  const sidebarUser = adminProfile
    ? { name: adminProfile.full_name || adminProfile.employee_id, avatar: (adminProfile.full_name || adminProfile.employee_id || '?').slice(0, 2).toUpperCase() }
    : null

  const openPayForm = () => {
    setEditingId(null)
    setFormError('')
    setPayForm(emptyPayForm)
    setShowPayForm(true)
  }

  const submitPay = async (e) => {
    e.preventDefault()
    setFormError('')
    const base = parseFloat(payForm.base_salary)
    const bonuses = parseFloat(payForm.bonuses || 0)
    const deductions = parseFloat(payForm.deductions || 0)
    if (isNaN(base) || base < 0) {
      setFormError('Enter a valid base salary')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/payroll/create?user_id=${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_salary: base,
          bonuses: isNaN(bonuses) ? 0 : bonuses,
          deductions: isNaN(deductions) ? 0 : deductions,
          payment_date: payForm.payment_date,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to pay salary')
      }
      setShowPayForm(false)
      await Promise.all([loadHistory(selectedId), loadEmployees()])
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (record) => {
    setShowPayForm(false)
    setEditingId(record.id)
    setEditForm({
      base_salary: String(record.base_salary),
      bonuses: String(record.bonuses),
      deductions: String(record.deductions),
      payment_date: record.payment_date.slice(0, 10),
    })
  }

  const submitEdit = async (id) => {
    setFormError('')
    const base = parseFloat(editForm.base_salary)
    const bonuses = parseFloat(editForm.bonuses || 0)
    const deductions = parseFloat(editForm.deductions || 0)
    if (isNaN(base) || base < 0) {
      setFormError('Enter a valid base salary')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/payroll/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_salary: base,
          bonuses: isNaN(bonuses) ? 0 : bonuses,
          deductions: isNaN(deductions) ? 0 : deductions,
          payment_date: editForm.payment_date,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to update salary')
      }
      setEditingId(null)
      await Promise.all([loadHistory(selectedId), loadEmployees()])
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Payroll">
        <p className="text-muted">Loading employees…</p>
      </Layout>
    )
  }

  return (
    <Layout user={sidebarUser} title="Payroll" subtitle="Select an employee to view, pay, or update their salary.">
      {employees.length === 0 ? (
        <div className="card">
          <p className="text-sm text-muted">No employees have signed up yet. Generate an Employee ID to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="card lg:col-span-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input pl-10"
                placeholder="Search by name, title or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              {filtered.map((emp) => (
                <button
                  key={emp.user_id}
                  onClick={() => setSelectedId(emp.user_id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    selectedId === emp.user_id ? 'bg-ink text-white' : 'hover:bg-canvas'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      selectedId === emp.user_id ? 'bg-white/15 text-white' : 'bg-accent-soft text-accent-deep'
                    }`}
                  >
                    {(emp.full_name || emp.employee_id || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${selectedId === emp.user_id ? 'text-white' : 'text-ink'}`}>
                      {emp.full_name || emp.employee_id}
                    </p>
                    <p className={`truncate text-xs ${selectedId === emp.user_id ? 'text-white/60' : 'text-muted'}`}>
                      {emp.job_title || 'No title'} · {emp.employee_id}
                    </p>
                  </div>
                  <div className={`shrink-0 text-right text-xs ${selectedId === emp.user_id ? 'text-white/70' : 'text-muted'}`}>
                    {emp.latest_net_salary != null ? `$${emp.latest_net_salary.toLocaleString()}` : '—'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            {selected && (
              <div className="card">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent-deep">
                    {(selected.full_name || selected.employee_id || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{selected.full_name || selected.employee_id}</p>
                    <p className="text-sm text-muted">{selected.job_title || 'No title set'} · {selected.employee_id}</p>
                  </div>
                  <button onClick={openPayForm} className="btn-accent ml-auto">
                    <Wallet size={15} /> Pay Salary
                  </button>
                </div>

                {showPayForm && (
                  <form onSubmit={submitPay} className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
                    <div>
                      <label className="label">Base Salary</label>
                      <input
                        type="number" min="0" step="0.01" required
                        className="input"
                        value={payForm.base_salary}
                        onChange={(e) => setPayForm({ ...payForm, base_salary: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Bonuses</label>
                      <input
                        type="number" min="0" step="0.01"
                        className="input"
                        value={payForm.bonuses}
                        onChange={(e) => setPayForm({ ...payForm, bonuses: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Deductions</label>
                      <input
                        type="number" min="0" step="0.01"
                        className="input"
                        value={payForm.deductions}
                        onChange={(e) => setPayForm({ ...payForm, deductions: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Payment Date</label>
                      <input
                        type="date" required
                        className="input"
                        value={payForm.payment_date}
                        onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
                      />
                    </div>
                    {formError && <p className="col-span-full text-sm text-danger">{formError}</p>}
                    <div className="col-span-full flex gap-2">
                      <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving…' : 'Confirm Payment'}
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setShowPayForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div className="card overflow-hidden !p-0">
              <h3 className="font-display text-base font-semibold text-ink px-6 pt-6">Salary history</h3>
              <div className="mt-4">
                {historyLoading ? (
                  <p className="px-6 pb-6 text-sm text-muted">Loading…</p>
                ) : history.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-muted">No payroll records yet. Use "Pay Salary" to add one.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-canvas/50">
                      <tr className="border-b border-line text-muted">
                        <th className="p-4 font-medium">Payment Date</th>
                        <th className="p-4 font-medium">Base Salary</th>
                        <th className="p-4 font-medium">Bonuses</th>
                        <th className="p-4 font-medium">Deductions</th>
                        <th className="p-4 font-medium text-right text-indigo">Net Salary</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record) =>
                        editingId === record.id ? (
                          <tr key={record.id} className="border-b border-line/50 last:border-0 bg-canvas/30">
                            <td className="p-3">
                              <input type="date" className="input" value={editForm.payment_date}
                                onChange={(e) => setEditForm({ ...editForm, payment_date: e.target.value })} />
                            </td>
                            <td className="p-3">
                              <input type="number" min="0" step="0.01" className="input" value={editForm.base_salary}
                                onChange={(e) => setEditForm({ ...editForm, base_salary: e.target.value })} />
                            </td>
                            <td className="p-3">
                              <input type="number" min="0" step="0.01" className="input" value={editForm.bonuses}
                                onChange={(e) => setEditForm({ ...editForm, bonuses: e.target.value })} />
                            </td>
                            <td className="p-3">
                              <input type="number" min="0" step="0.01" className="input" value={editForm.deductions}
                                onChange={(e) => setEditForm({ ...editForm, deductions: e.target.value })} />
                            </td>
                            <td className="p-3 text-right text-muted">—</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => submitEdit(record.id)}
                                  disabled={saving}
                                  className="rounded-lg bg-success-soft p-2 text-success hover:bg-success hover:text-white"
                                  title="Save"
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="rounded-lg bg-canvas p-2 text-muted hover:bg-line"
                                  title="Cancel"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={record.id} className="border-b border-line/50 last:border-0 hover:bg-canvas/30">
                            <td className="p-4">{new Date(record.payment_date).toLocaleDateString()}</td>
                            <td className="p-4">${record.base_salary.toLocaleString()}</td>
                            <td className="p-4 text-success">+${record.bonuses.toLocaleString()}</td>
                            <td className="p-4 text-danger">-${record.deductions.toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-ink">${record.net_salary.toLocaleString()}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => startEdit(record)}
                                className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink"
                                title="Update salary"
                              >
                                <Pencil size={15} />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
                {editingId != null && formError && (
                  <p className="px-6 pb-4 text-sm text-danger">{formError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
