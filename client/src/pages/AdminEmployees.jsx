import { useState } from 'react'
import { Search } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { employees, attendanceByEmployee, leaveByEmployee } from '../data/mockData.js'

const adminUser = employees.find((e) => e.role === 'HR')

export default function AdminEmployees() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(employees[0].id)

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()),
  )
  const selected = employees.find((e) => e.id === selectedId)
  const attendance = attendanceByEmployee[selectedId] || []
  const leave = leaveByEmployee[selectedId] || []

  return (
    <Layout user={adminUser} title="Employees" subtitle="Browse the team and switch between profiles.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-10"
              placeholder="Search by name or department"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-1.5">
            {filtered.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  selectedId === emp.id ? 'bg-ink text-white' : 'hover:bg-canvas'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    selectedId === emp.id ? 'bg-white/15 text-white' : 'bg-accent-soft text-accent-deep'
                  }`}
                >
                  {emp.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${selectedId === emp.id ? 'text-white' : 'text-ink'}`}>
                    {emp.name}
                  </p>
                  <p className={`truncate text-xs ${selectedId === emp.id ? 'text-white/60' : 'text-muted'}`}>
                    {emp.designation} · {emp.department}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent-deep">
                {selected.avatar}
              </div>
              <div>
                <p className="font-display text-lg font-bold text-ink">{selected.name}</p>
                <p className="text-sm text-muted">
                  {selected.designation} · {selected.department}
                </p>
              </div>
              <span className="ml-auto">
                <StatusBadge status={selected.attendanceStatus} />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4 text-sm">
              <div>
                <p className="text-xs text-muted">Employee ID</p>
                <p className="font-medium text-ink">{selected.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="truncate font-medium text-ink">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Phone</p>
                <p className="font-medium text-ink">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Joined</p>
                <p className="font-medium text-ink">
                  {new Date(selected.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-base font-semibold text-ink">Recent attendance</h3>
            <div className="mt-4 space-y-2">
              {attendance.map((rec) => (
                <div key={rec.date} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5 text-sm">
                  <span className="text-ink">
                    {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-muted">{rec.checkIn || '—'} – {rec.checkOut || '—'}</span>
                  <StatusBadge status={rec.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-base font-semibold text-ink">Leave history</h3>
            <div className="mt-4 space-y-2">
              {leave.length === 0 && <p className="text-sm text-muted">No leave requests on file.</p>}
              {leave.map((lr) => (
                <div key={lr.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5 text-sm">
                  <span className="text-ink">{lr.type} · {lr.startDate} → {lr.endDate}</span>
                  <StatusBadge status={lr.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
