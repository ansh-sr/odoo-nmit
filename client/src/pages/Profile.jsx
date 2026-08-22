import { useState } from 'react'
import { Pencil, Check, FileBadge2, Briefcase, Wallet } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { currentUser, employees } from '../data/mockData.js'

export default function Profile() {
  const employee = employees.find((e) => e.id === currentUser.id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ phone: employee.phone, address: employee.address })

  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  return (
    <Layout
      user={currentUser}
      title="My Profile"
      subtitle="Personal details, job info, salary and documents."
      action={
        <button onClick={() => setEditing((v) => !v)} className={editing ? 'btn-primary' : 'btn-ghost'}>
          {editing ? <Check size={16} /> : <Pencil size={16} />}
          {editing ? 'Save changes' : 'Edit profile'}
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent-deep">
            {employee.avatar}
          </div>
          <p className="mt-4 font-display text-lg font-bold text-ink">{employee.name}</p>
          <p className="text-sm text-muted">{employee.designation}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-indigo-soft px-3 py-1 text-xs font-semibold text-indigo">
            {employee.department}
          </span>

          <div className="mt-6 w-full space-y-2 border-t border-line pt-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Employee ID</p>
            <p className="text-sm font-medium text-ink">{employee.id}</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h3 className="font-display text-base font-semibold text-ink">Personal details</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={employee.name} disabled />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={employee.email} disabled />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={form.phone}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={form.address}
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>
            {editing && (
              <p className="mt-3 text-xs text-muted">Employees can edit phone, address and profile picture only.</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-accent-deep" />
              <h3 className="font-display text-base font-semibold text-ink">Job details</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Designation</p>
                <p className="text-sm font-medium text-ink">{employee.designation}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Department</p>
                <p className="text-sm font-medium text-ink">{employee.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Joined on</p>
                <p className="text-sm font-medium text-ink">
                  {new Date(employee.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-accent-deep" />
              <h3 className="font-display text-base font-semibold text-ink">Salary structure</h3>
              <span className="ml-auto text-xs font-medium text-muted">Read-only</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted">Base</p>
                <p className="text-sm font-semibold text-ink">{currency.format(employee.salary.base)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">HRA</p>
                <p className="text-sm font-semibold text-ink">{currency.format(employee.salary.hra)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Allowances</p>
                <p className="text-sm font-semibold text-ink">{currency.format(employee.salary.allowances)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <FileBadge2 size={16} className="text-accent-deep" />
              <h3 className="font-display text-base font-semibold text-ink">Documents</h3>
            </div>
            <div className="mt-4 space-y-2">
              {['Offer letter.pdf', 'PAN card.pdf', 'Aadhaar card.pdf'].map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5 text-sm">
                  <span className="text-ink">{doc}</span>
                  <span className="text-xs text-muted">Uploaded</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
