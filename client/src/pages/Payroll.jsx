import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
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

export default function Payroll() {
  const { user } = useAuth()
  const [payroll, setPayroll] = useState([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.getPayroll(user.id)
      .then((data) => setPayroll(data))
      .catch((e) => setNotice(e.message))
  }, [])

  const baseTotal = payroll.reduce((sum, p) => sum + Number(p.base_salary || 0), 0)
  const latest = payroll.length > 0 ? payroll[payroll.length - 1] : null

  return (
    <div className="min-h-screen bg-paper">
      <Navbar title="Payroll" />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {notice && (
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-ink border border-rule px-4 py-2 inline-block">
            {notice}
          </div>
        )}

        <div className="mb-6 font-mono text-[11px] uppercase tracking-widest text-slate flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-success" />
          Read-only view — employee
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Latest net salary" value={latest ? money(latest.net_salary) : '—'} />
          <StatCard label="Total earnings" value={money(baseTotal)} />
          <StatCard label="Total deductions" value={money(payroll.reduce((s, p) => s + Number(p.deductions || 0), 0))} accent />
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-3">Payroll history</h2>
          <LedgerTable
            columns={[
              { key: 'payment_date', label: 'Date', render: (r) => fmtDateOnly(r.payment_date) },
              { key: 'base_salary', label: 'Base', render: (r) => money(r.base_salary) },
              { key: 'bonuses', label: 'Bonus', render: (r) => money(r.bonuses) },
              { key: 'deductions', label: 'Deductions', render: (r) => `\u2212${money(r.deductions)}` },
              { key: 'net_salary', label: 'Net', render: (r) => <strong>{money(r.net_salary)}</strong> },
            ]}
            rows={payroll}
            emptyLabel="No payroll entries yet."
          />
        </section>
      </main>
    </div>
  )
}
