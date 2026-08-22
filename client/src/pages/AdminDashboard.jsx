import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, UserCheck, UserX, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import DayProgress from '../components/DayProgress.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getUserId } from '../lib/auth.js'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AdminDashboard() {
  const userId = getUserId()
  const [adminProfile, setAdminProfile] = useState(null)
  const [employees, setEmployees] = useState([])
  const [pendingLeave, setPendingLeave] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, employeesRes, leavesRes] = await Promise.all([
          userId ? fetch(`${apiUrl}/profile/${userId}`) : Promise.resolve(null),
          fetch(`${apiUrl}/admin/users`),
          fetch(`${apiUrl}/admin/leaves?status=Pending`),
        ])
        if (profileRes && profileRes.ok) setAdminProfile(await profileRes.json())
        setEmployees(employeesRes.ok ? await employeesRes.json() : [])
        setPendingLeave(leavesRes.ok ? await leavesRes.json() : [])
      } catch (err) {
        console.error('Failed to load admin dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <Layout title="Admin Overview">
        <p className="text-muted">Loading dashboard…</p>
      </Layout>
    )
  }

  const presentToday = employees.filter((e) => e.attendance_status === 'Present').length
  const notPresent = employees.length - presentToday

  const stats = [
    { label: 'Total employees', value: employees.length, icon: Users, color: 'bg-indigo-soft text-indigo' },
    { label: 'Present today', value: presentToday, icon: UserCheck, color: 'bg-success-soft text-success' },
    { label: 'Not present', value: notPresent, icon: UserX, color: 'bg-danger-soft text-danger' },
    { label: 'Pending leave', value: pendingLeave.length, icon: FileText, color: 'bg-accent-soft text-accent-deep' },
  ]

  const sidebarUser = adminProfile
    ? { name: adminProfile.full_name || adminProfile.employee_id, avatar: (adminProfile.full_name || adminProfile.employee_id || '?').slice(0, 2).toUpperCase() }
    : null

  return (
    <Layout user={sidebarUser} title="Admin Overview" subtitle="Team attendance and approvals at a glance.">
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
            {employees.length === 0 && <p className="text-sm text-muted">No employees have signed up yet.</p>}
            {employees.map((emp) => (
              <div key={emp.user_id} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
                    {(emp.full_name || emp.employee_id || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{emp.full_name || emp.employee_id}</p>
                    <p className="text-xs text-muted">{emp.job_title || 'No job title set'}</p>
                  </div>
                </div>
                <StatusBadge status={emp.attendance_status} />
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
            {pendingLeave.length === 0 && <p className="text-sm text-muted">Nothing waiting on you right now.</p>}
            {pendingLeave.map((lr) => (
              <div key={lr.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{lr.employee_name}</p>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {lr.leave_type} · {new Date(lr.start_date).toLocaleDateString()} → {new Date(lr.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
