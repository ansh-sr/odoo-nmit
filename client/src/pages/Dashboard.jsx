import { Link } from 'react-router-dom'
import {
  Clock,
  CalendarDays,
  Wallet,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sunrise,
  Sunset,
} from 'lucide-react'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { currentUser, attendanceByEmployee, leaveByEmployee } from '../data/mockData'

function DayProgress() {
  const now = new Date()
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  const elapsed = (now.getHours() - startHour) * 60 + now.getMinutes()
  const percent = Math.min(100, Math.max(0, (elapsed / totalMinutes) * 100))
  const timeLabel = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#374151]">Workday Progress</h3>
        <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#4F46E5]">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#9CA3AF]">
          <Sunrise size={14} />
          <span className="text-xs font-medium">9:00</span>
        </div>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#818CF8] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-[#4F46E5] shadow-md"
            style={{ left: `calc(${percent}% - 7px)` }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-[#9CA3AF]">
          <span className="text-xs font-medium">18:00</span>
          <Sunset size={14} />
        </div>
        <span className="rounded-lg bg-[#F9FAFB] px-2.5 py-1 text-xs font-semibold text-[#374151]">
          {timeLabel}
        </span>
      </div>
    </div>
  )
}

const quickLinks = [
  { to: '/attendance', label: 'Attendance', desc: 'Track daily check-ins', icon: Clock, color: 'bg-[#EEF2FF] text-[#4F46E5]' },
  { to: '/leaves', label: 'Leave Requests', desc: 'Apply for time off', icon: CalendarDays, color: 'bg-[#FEF3C7] text-[#B45309]' },
  { to: '/payroll', label: 'Payroll', desc: 'View salary history', icon: Wallet, color: 'bg-[#ECFDF5] text-[#059669]' },
]

export default function Dashboard() {
  const todayRecord = (attendanceByEmployee[currentUser.id] || []).at(-1)
  const pendingLeaves = (leaveByEmployee[currentUser.id] || []).filter(
    (l) => l.status === 'Pending'
  )
  const recentLeave = (leaveByEmployee[currentUser.id] || []).slice(-3).reverse()
  const weekAttendance = (attendanceByEmployee[currentUser.id] || []).slice(-5)
  const presentDays = weekAttendance.filter((r) => r.status === 'Present').length

  return (
    <Layout title={`Good morning, ${currentUser.name.split(' ')[0]}`} subtitle="Here's your workday overview.">
      <DayProgress />

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map(({ to, label, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#D1D5DB]"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111827]">{label}</p>
              <p className="text-xs text-[#6B7280]">{desc}</p>
            </div>
            <ArrowRight
              size={16}
              className="text-[#D1D5DB] transition group-hover:translate-x-0.5 group-hover:text-[#6B7280]"
            />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* This week's attendance */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">This Week&apos;s Attendance</h3>
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
              {presentDays}/{weekAttendance.length} days
            </span>
          </div>
          <div className="mt-4 space-y-2.5">
            {weekAttendance.map((rec) => (
              <div
                key={rec.date}
                className="flex items-center justify-between rounded-lg border border-[#F3F4F6] px-4 py-3 transition hover:bg-[#F9FAFB]"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date(rec.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {rec.checkIn ? `${rec.checkIn} – ${rec.checkOut || 'active'}` : 'No check-in'}
                  </p>
                </div>
                <StatusBadge status={rec.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick stats */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#111827]">Quick Stats</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#059669]" />
                  <span className="text-sm text-[#374151]">Days Present</span>
                </div>
                <span className="text-sm font-bold text-[#111827]">{presentDays}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-[#D97706]" />
                  <span className="text-sm text-[#374151]">Pending Leaves</span>
                </div>
                <span className="text-sm font-bold text-[#111827]">{pendingLeaves.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-[#4F46E5]" />
                  <span className="text-sm text-[#374151]">Attendance Rate</span>
                </div>
                <span className="text-sm font-bold text-[#111827]">
                  {weekAttendance.length > 0
                    ? Math.round((presentDays / weekAttendance.length) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Recent leave activity */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">Recent Leave Activity</h3>
              <Link to="/leaves" className="text-xs font-medium text-[#4F46E5] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {recentLeave.length === 0 ? (
                <p className="text-xs text-[#9CA3AF]">No leave activity yet.</p>
              ) : (
                recentLeave.map((lr) => (
                  <div key={lr.id} className="rounded-lg border border-[#F3F4F6] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#111827]">{lr.type} leave</p>
                      <StatusBadge status={lr.status} />
                    </div>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      {lr.startDate} → {lr.endDate}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
