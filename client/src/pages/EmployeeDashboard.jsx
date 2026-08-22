import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, CalendarClock, FileText, ArrowRight, LogIn, LogOut, Bell } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import DayProgress from '../components/DayProgress.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getUserId } from '../lib/auth.js'

const quickLinks = [
  { to: '/employee/profile', label: 'Profile', desc: 'View your personal & job details', icon: User },
  { to: '/employee/attendance', label: 'Attendance', desc: 'Daily and weekly check-in history', icon: CalendarClock },
  { to: '/employee/leave', label: 'Leave Requests', desc: 'Apply and track time-off', icon: FileText },
]

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function EmployeeDashboard() {
  const userId = getUserId()
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const loadData = async () => {
    try {
      const [profileRes, attendanceRes, leaveRes] = await Promise.all([
        fetch(`${apiUrl}/profile/${userId}`),
        fetch(`${apiUrl}/attendance/${userId}`),
        fetch(`${apiUrl}/leave/${userId}`),
      ])
      setProfile(profileRes.ok ? await profileRes.json() : null)
      setAttendance(attendanceRes.ok ? await attendanceRes.json() : [])
      setLeaves(leaveRes.ok ? await leaveRes.json() : [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) loadData()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const todayStr = new Date().toDateString()
  const todayRecord = attendance.find((r) => new Date(r.date).toDateString() === todayStr)
  const checkedIn = Boolean(todayRecord?.check_in_time)
  const checkedOut = Boolean(todayRecord?.check_out_time)

  const handleCheckInOut = async () => {
    setBusy(true)
    try {
      if (!checkedIn) {
        await fetch(`${apiUrl}/attendance/check-in?user_id=${userId}`, { method: 'POST' })
      } else if (todayRecord) {
        await fetch(`${apiUrl}/attendance/check-out/${todayRecord.id}`, { method: 'PUT' })
      }
      await loadData()
    } catch (err) {
      console.error('Check-in/out failed:', err)
    } finally {
      setBusy(false)
    }
  }

  const displayName = profile?.full_name || profile?.employee_id || 'there'
  const sidebarUser = profile
    ? { name: profile.full_name || profile.employee_id, avatar: (profile.full_name || profile.employee_id || '?').slice(0, 2).toUpperCase() }
    : null

  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
  const recentLeave = [...leaves].sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).slice(0, 5)

  if (loading) {
    return (
      <Layout title="Dashboard">
        <p className="text-muted">Loading your dashboard…</p>
      </Layout>
    )
  }

  return (
    <Layout
      user={sidebarUser}
      title={`Good to see you, ${displayName.split(' ')[0]}`}
      subtitle="Here's what's happening in your workday."
      action={
        !checkedOut && (
          <button onClick={handleCheckInOut} disabled={busy} className={checkedIn ? 'btn-primary' : 'btn-accent'}>
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
          <h3 className="font-display text-base font-semibold text-ink">Recent attendance</h3>
          <div className="mt-4 space-y-2.5">
            {recentAttendance.length === 0 && (
              <p className="text-sm text-muted">No attendance recorded yet.</p>
            )}
            {recentAttendance.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-muted">
                    {rec.check_in_time
                      ? `${new Date(rec.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${
                          rec.check_out_time
                            ? new Date(rec.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : 'active'
                        }`
                      : 'No check-in'}
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
              <p className="text-sm text-muted">No leave activity yet.</p>
            )}
            {recentLeave.map((lr) => (
              <div key={lr.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{lr.leave_type} leave</p>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(lr.start_date).toLocaleDateString()} → {new Date(lr.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
