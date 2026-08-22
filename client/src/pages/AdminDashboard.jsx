import { Link } from 'react-router-dom'
import { Users, FileText, UserCheck, UserX, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import DayProgress from '../components/DayProgress.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { employees, allPendingLeave } from '../data/mockData.js'

const adminUser = employees.find((e) => e.role === 'HR')

export default function AdminDashboard() {
  const presentToday = employees.filter((e) => e.attendanceStatus === 'Present').length
  const notPresent = employees.length - presentToday

  const stats = [
    { label: 'Total employees', value: employees.length, icon: Users, color: 'bg-indigo-soft text-indigo' },
    { label: 'Present today', value: presentToday, icon: UserCheck, color: 'bg-success-soft text-success' },
    { label: 'Not present', value: notPresent, icon: UserX, color: 'bg-danger-soft text-danger' },
    { label: 'Pending leave', value: allPendingLeave.length, icon: FileText, color: 'bg-accent-soft text-accent-deep' },
  ]

  return (
    <Layout user={adminUser} title="Admin Overview" subtitle="Team attendance and approvals at a glance.">
      <div className="mb-6">
        <DayProgress />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon size={17} />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-ink">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Team status today</h3>
            <Link to="/admin/employees" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{emp.name}</p>
                    <p className="text-xs text-muted">{emp.designation}</p>
                  </div>
                </div>
                <StatusBadge status={emp.attendanceStatus} />
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">Pending approvals</h3>
            <Link to="/admin/leave" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline">
              Review <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {allPendingLeave.length === 0 && <p className="text-sm text-muted">Nothing waiting on you right now.</p>}
            {allPendingLeave.map((lr) => (
              <div key={lr.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{lr.employeeName}</p>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {lr.type} · {lr.startDate} → {lr.endDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
