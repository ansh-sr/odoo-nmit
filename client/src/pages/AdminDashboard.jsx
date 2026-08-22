import { useEffect, useState } from 'react'
import { api } from '../api'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import LedgerTable from '../components/LedgerTable'

function fmtDateOnly(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
function money(v) {
  return `$${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard() {
  const [structure, setStructure] = useState([])
  const [allPayroll, setAllPayroll] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [payForm, setPayForm] = useState({
    user_id: '', base_salary: '', bonuses: '', deductions: '', payment_date: '',
  })
  const [updateForm, setUpdateForm] = useState({
    payroll_id: '', base_salary: '', bonuses: '', deductions: '', payment_date: '',
  })
  const [leaveForm, setLeaveForm] = useState({ leave_id: '', status: 'Approved' })

  async function loadAll() {
    const [s, p] = await Promise.all([api.getSalaryStructure(), api.getAllPayroll()])
    setStructure(s)
    setAllPayroll(p.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)))
  }

  useEffect(() => {
    loadAll().catch((e) => setError(e.message))
  }, [])

  async function handleCreatePayroll(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.createPayroll(Number(payForm.user_id), {
        base_salary: Number(payForm.base_salary),
        bonuses: Number(payForm.bonuses || 0),
        deductions: Number(payForm.deductions || 0),
        payment_date: payForm.payment_date,
      })
      setNotice('Payroll entry created.')
      setPayForm({ user_id: '', base_salary: '', bonuses: '', deductions: '', payment_date: '' })
      await loadAll()
    } catch (e2) {
      setError(e2.message)
    }
  }

  async function handleUpdatePayroll(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.updatePayroll(Number(updateForm.payroll_id), {
        base_salary: Number(updateForm.base_salary),
        bonuses: Number(updateForm.bonuses || 0),
        deductions: Number(updateForm.deductions || 0),
        payment_date: updateForm.payment_date,
      })
      setNotice('Payroll entry updated.')
      setUpdateForm({ payroll_id: '', base_salary: '', bonuses: '', deductions: '', payment_date: '' })
      await loadAll()
    } catch (e2) {
      setError(e2.message)
    }
  }

  async function handleLeaveStatus(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.updateLeaveStatus(Number(leaveForm.leave_id), leaveForm.status)
      setNotice(`Leave #${leaveForm.leave_id} marked ${leaveForm.status}.`)
      setLeaveForm({ leave_id: '', status: 'Approved' })
    } catch (e2) {
      setError(e2.message)
    }
  }

  const totalNet = allPayroll.reduce((sum, p) => sum + Number(p.net_salary || 0), 0)

  return (
    <div className="min-h-screen bg-paper">
      <Navbar title="Admin" />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {(notice || error) && (
          <div
            className={`mb-6 font-mono text-xs uppercase tracking-widest px-4 py-2 inline-block border ${
              error ? 'border-danger text-danger' : 'border-ink text-ink'
            }`}
          >
            {error || notice}
          </div>
        )}

        <section className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Employees on payroll" value={structure.length} />
          <StatCard label="Payroll entries" value={allPayroll.length} />
          <StatCard label="Total net disbursed" value={money(totalNet)} accent />
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl text-ink mb-3">Salary structure (latest per employee)</h2>
          <LedgerTable
            columns={[
              { key: 'employee_id', label: 'Employee' },
              { key: 'base_salary', label: 'Base', render: (r) => money(r.base_salary) },
              { key: 'bonuses', label: 'Bonus', render: (r) => money(r.bonuses) },
              { key: 'deductions', label: 'Deductions', render: (r) => `−${money(r.deductions)}` },
              { key: 'net_salary', label: 'Net', render: (r) => <strong>{money(r.net_salary)}</strong> },
              { key: 'payment_date', label: 'As of', render: (r) => fmtDateOnly(r.payment_date) },
            ]}
            rows={structure}
            emptyLabel="No payroll records yet."
          />
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl text-ink mb-3">All payroll entries</h2>
          <LedgerTable
            columns={[
              { key: 'id', label: 'ID', width: '70px' },
              { key: 'user_id', label: 'User' },
              { key: 'base_salary', label: 'Base', render: (r) => money(r.base_salary) },
              { key: 'net_salary', label: 'Net', render: (r) => <strong>{money(r.net_salary)}</strong> },
              { key: 'payment_date', label: 'Date', render: (r) => fmtDateOnly(r.payment_date) },
            ]}
            rows={allPayroll}
            emptyLabel="No payroll records yet."
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section>
            <h2 className="font-display text-lg text-ink mb-3">New payroll entry</h2>
            <form onSubmit={handleCreatePayroll} className="border border-rule p-5 space-y-3">
              <Field label="User ID" value={payForm.user_id} onChange={(v) => setPayForm((f) => ({ ...f, user_id: v }))} type="number" required />
              <Field label="Base salary" value={payForm.base_salary} onChange={(v) => setPayForm((f) => ({ ...f, base_salary: v }))} type="number" step="0.01" required />
              <Field label="Bonuses" value={payForm.bonuses} onChange={(v) => setPayForm((f) => ({ ...f, bonuses: v }))} type="number" step="0.01" />
              <Field label="Deductions" value={payForm.deductions} onChange={(v) => setPayForm((f) => ({ ...f, deductions: v }))} type="number" step="0.01" />
              <Field label="Payment date" value={payForm.payment_date} onChange={(v) => setPayForm((f) => ({ ...f, payment_date: v }))} type="date" required />
              <button className="w-full bg-ink text-paper font-body text-sm py-2.5 hover:bg-signal hover:text-ink transition-colors">
                Create entry
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-3">Update payroll entry</h2>
            <form onSubmit={handleUpdatePayroll} className="border border-rule p-5 space-y-3">
              <Field label="Payroll ID" value={updateForm.payroll_id} onChange={(v) => setUpdateForm((f) => ({ ...f, payroll_id: v }))} type="number" required />
              <Field label="Base salary" value={updateForm.base_salary} onChange={(v) => setUpdateForm((f) => ({ ...f, base_salary: v }))} type="number" step="0.01" required />
              <Field label="Bonuses" value={updateForm.bonuses} onChange={(v) => setUpdateForm((f) => ({ ...f, bonuses: v }))} type="number" step="0.01" />
              <Field label="Deductions" value={updateForm.deductions} onChange={(v) => setUpdateForm((f) => ({ ...f, deductions: v }))} type="number" step="0.01" />
              <Field label="Payment date" value={updateForm.payment_date} onChange={(v) => setUpdateForm((f) => ({ ...f, payment_date: v }))} type="date" required />
              <button className="w-full border border-ink text-ink font-body text-sm py-2.5 hover:bg-ink hover:text-paper transition-colors">
                Update entry
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-display text-lg text-ink mb-3">Set leave status</h2>
            <form onSubmit={handleLeaveStatus} className="border border-rule p-5 space-y-3">
              <Field label="Leave ID" value={leaveForm.leave_id} onChange={(v) => setLeaveForm((f) => ({ ...f, leave_id: v }))} type="number" required />
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Status</span>
                <select
                  value={leaveForm.status}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
                >
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Pending</option>
                </select>
              </label>
              <button className="w-full border border-ink text-ink font-body text-sm py-2.5 hover:bg-ink hover:text-paper transition-colors">
                Apply status
              </button>
              <p className="font-body text-xs text-slate">
                Ask the employee for their leave request ID, shown on their dashboard once filed.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', step, required }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-widest text-slate">{label}</span>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
      />
    </label>
  )
}
