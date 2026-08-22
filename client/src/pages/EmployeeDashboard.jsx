import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, CalendarClock, FileText, ArrowRight, LogIn, LogOut, Bell } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import DayProgress from '../components/DayProgress.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { currentUser, attendanceByEmployee, leaveByEmployee } from '../data/mockData.js'

const quickLinks = [
  { to: '/employee/profile', label: 'Profile', desc: 'View your personal & job details', icon: User },
  { to: '/employee/attendance', label: 'Attendance', desc: 'Daily and weekly check-in history', icon: CalendarClock },
  { to: '/employee/leave', label: 'Leave Requests', desc: 'Apply and track time-off', icon: FileText },
]

export default function EmployeeDashboard() {
  const todayRecord = attendanceByEmployee[currentUser.id].at(-1)
  const [checkedIn, setCheckedIn] = useState(Boolean(todayRecord?.checkIn))
  const [checkedOut, setCheckedOut] = useState(Boolean(todayRecord?.checkOut))

  const recentLeave = leaveByEmployee[currentUser.id]

  return (
    <Layout
      user={currentUser}
      title={`Good to see you, ${currentUser.name.split(' ')[0]}`}
      subtitle="Here's what's happening in your workday."
      action={
        !checkedOut && (
          <button
            onClick={() => (checkedIn ? setCheckedOut(true) : setCheckedIn(true))}
            className={checkedIn ? 'btn-primary' : 'btn-accent'}
          >
            {checkedIn ? <LogOut size={16} /> : <LogIn size={16} />}
            {checkedIn ? 'Check out' : 'Check in'}
          </button>
        )
      }
    >
      <div className="mb-6">
        <DayProgress />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="card group transition hover:shadow-pop">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
              <Icon size={18} />
            </div>
            <p className="mt-4 font-display text-base font-semibold text-ink">{label}</p>
            <p className="mt-1 text-sm text-muted">{desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <h3 className="font-display text-base font-semibold text-ink">This week's attendance</h3>
          <div className="mt-4 space-y-2.5">
            {attendanceByEmployee[currentUser.id].map((rec) => (
              <div key={rec.date} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-muted">
                    {rec.checkIn ? `${rec.checkIn} – ${rec.checkOut || 'active'}` : 'No check-in'}
                  </p>
                </div>
                <StatusBadge status={rec.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-accent-deep" />
            <h3 className="font-display text-base font-semibold text-ink">Recent activity</h3>
          </div>
          <div className="mt-4 space-y-3">
            {recentLeave.length === 0 && (
              <p className="text-sm text-muted">No leave activity yet this month.</p>
            )}
            {recentLeave.map((lr) => (
              <div key={lr.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{lr.type} leave</p>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {lr.startDate} → {lr.endDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
