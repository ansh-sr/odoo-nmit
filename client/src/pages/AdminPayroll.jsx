import { useState } from 'react'
import { Pencil, Check, X, AlertTriangle, Search, Download } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { employees, payrollByEmployee } from '../data/mockData.js'

const adminUser = employees.find((e) => e.role === 'HR')
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function AdminPayroll() {
  const [store, setStore] = useState(payrollByEmployee)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ bonuses: '', deductions: '' })
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'salary' | 'accuracy'

  // Flatten and filter
  const allRecords = Object.entries(store).flatMap(([empId, records]) =>
    records.map((r) => ({
      ...r,
      employeeName: employees.find((e) => e.id === empId)?.name,
      employeeId: empId,
      department: employees.find((e) => e.id === empId)?.department,
    })),
  )

  const filtered = allRecords.filter(
    (r) =>
      r.employeeName?.toLowerCase().includes(query.toLowerCase()) ||
      r.employeeId?.toLowerCase().includes(query.toLowerCase()),
  )

  // Salary structure view — one entry per employee with latest salary
  const salaryStructure = employees
    .filter((e) => e.role !== 'HR')
    .map((emp) => {
      const records = store[emp.id] || []
      const latest = records[records.length - 1]
      return {
        ...emp,
        baseSalary: emp.salary?.base || latest?.baseSalary || 0,
        hra: emp.salary?.hra || 0,
        allowances: emp.salary?.allowances || 0,
        latestRecord: latest,
      }
    })

  // Accuracy check — flag records where net ≠ base + bonuses - deductions
  const accuracyIssues = allRecords.filter(
    (r) => Math.abs(r.netSalary - (r.baseSalary + r.bonuses - r.deductions)) > 0.01,
  )

  function startEdit(record) {
    setEditingId(record.id)
    setEditForm({ bonuses: String(record.bonuses), deductions: String(record.deductions) })
  }

  function saveEdit(empId, recordId) {
    const bonuses = parseFloat(editForm.bonuses) || 0
    const deductions = parseFloat(editForm.deductions) || 0
    setStore((prev) => ({
      ...prev,
      [empId]: prev[empId].map((r) =>
        r.id === recordId
          ? { ...r, bonuses, deductions, netSalary: r.baseSalary + bonuses - deductions }
          : r,
      ),
    }))
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function fixAccuracy(empId, recordId) {
    setStore((prev) => ({
      ...prev,
      [empId]: prev[empId].map((r) =>
        r.id === recordId ? { ...r, netSalary: r.baseSalary + r.bonuses - r.deductions } : r,
      ),
    }))
  }

  const tabs = [
    { key: 'all', label: 'All Records' },
    { key: 'salary', label: 'Salary Structure' },
    { key: 'accuracy', label: `Accuracy (${accuracyIssues.length})` },
  ]

  return (
    <Layout user={adminUser} title="Payroll Management" subtitle="View and manage payroll across the team.">
      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
              activeTab === key
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-surface text-muted hover:bg-canvas'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Export */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Search by name or employee ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn-ghost text-xs">
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* All Records Tab */}
      {activeTab === 'all' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/50">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Employee</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Payment Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Base Salary</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Bonuses</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Deductions</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Net Salary</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">No payroll records found.</td>
                  </tr>
                )}
                {filtered.map((rec) => {
                  const isEditing = editingId === rec.id
                  return (
                    <tr key={rec.id} className="hover:bg-canvas/30 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{rec.employeeName}</p>
                        <p className="text-xs text-muted">{rec.employeeId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {new Date(rec.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-ink">{currency.format(rec.baseSalary)}</td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.bonuses}
                            onChange={(e) => setEditForm({ ...editForm, bonuses: e.target.value })}
                            className="w-24 rounded border border-line px-2 py-1 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                          />
                        ) : (
                          <span className="text-success">+{currency.format(rec.bonuses)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.deductions}
                            onChange={(e) => setEditForm({ ...editForm, deductions: e.target.value })}
                            className="w-24 rounded border border-line px-2 py-1 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                          />
                        ) : (
                          <span className="text-danger">-{currency.format(rec.deductions)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-ink">{currency.format(rec.netSalary)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => saveEdit(rec.employeeId, rec.id)} className="rounded-lg bg-success-soft p-1.5 text-success transition hover:bg-success hover:text-white">
                              <Check size={14} />
                            </button>
                            <button onClick={cancelEdit} className="rounded-lg bg-danger-soft p-1.5 text-danger transition hover:bg-danger hover:text-white">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(rec)} className="rounded-lg p-1.5 text-muted transition hover:bg-canvas hover:text-ink">
                            <Pencil size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary Structure Tab */}
      {activeTab === 'salary' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/50">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Employee</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Department</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Base Salary</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">HRA</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Allowances</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {salaryStructure.map((emp) => (
                  <tr key={emp.id} className="hover:bg-canvas/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-deep">
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{emp.name}</p>
                          <p className="text-xs text-muted">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{emp.department}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{currency.format(emp.baseSalary)}</td>
                    <td className="px-5 py-3.5 text-muted">{currency.format(emp.hra)}</td>
                    <td className="px-5 py-3.5 text-muted">{currency.format(emp.allowances)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-ink">
                      {currency.format(emp.baseSalary + emp.hra + emp.allowances)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accuracy Tab */}
      {activeTab === 'accuracy' && (
        <div className="card">
          {accuracyIssues.length === 0 ? (
            <div className="py-12 text-center">
              <Check size={40} className="mx-auto text-success" />
              <p className="mt-3 text-sm font-semibold text-ink">All payroll records are accurate</p>
              <p className="mt-1 text-xs text-muted">Net salary calculations match base + bonuses − deductions.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3">
                <AlertTriangle size={16} className="text-warning" />
                <p className="text-sm font-medium text-ink">{accuracyIssues.length} record(s) have salary calculation mismatches.</p>
              </div>
              <div className="divide-y divide-line">
                {accuracyIssues.map((rec) => {
                  const expected = rec.baseSalary + rec.bonuses - rec.deductions
                  return (
                    <div key={rec.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{rec.employeeName} ({rec.employeeId})</p>
                        <p className="text-xs text-muted">
                          Expected {currency.format(expected)} but recorded {currency.format(rec.netSalary)} — difference of {currency.format(Math.abs(expected - rec.netSalary))}
                        </p>
                      </div>
                      <button
                        onClick={() => fixAccuracy(rec.employeeId, rec.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success transition hover:bg-success hover:text-white"
                      >
                        <Check size={14} /> Fix
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </Layout>
  )
}
