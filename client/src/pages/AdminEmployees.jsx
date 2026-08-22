import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getUserId } from '../lib/auth.js'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AdminEmployees() {
  const userId = getUserId()
  const [adminProfile, setAdminProfile] = useState(null)
  const [employees, setEmployees] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leave, setLeave] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, employeesRes] = await Promise.all([
          userId ? fetch(`${apiUrl}/profile/${userId}`) : Promise.resolve(null),
          fetch(`${apiUrl}/admin/users`),
        ])
        if (profileRes && profileRes.ok) setAdminProfile(await profileRes.json())
        const list = employeesRes.ok ? await employeesRes.json() : []
        setEmployees(list)
        if (list.length > 0) setSelectedId(list[0].user_id)
      } catch (err) {
        console.error('Failed to load employees:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  useEffect(() => {
    if (selectedId == null) {
      setAttendance([])
      setLeave([])
      return
    }
    const loadDetail = async () => {
      setDetailLoading(true)
      try {
        const [attendanceRes, leaveRes] = await Promise.all([
          fetch(`${apiUrl}/attendance/${selectedId}`),
          fetch(`${apiUrl}/leave/${selectedId}`),
        ])
        setAttendance(attendanceRes.ok ? await attendanceRes.json() : [])
        setLeave(leaveRes.ok ? await leaveRes.json() : [])
      } catch (err) {
        console.error('Failed to load employee detail:', err)
      } finally {
        setDetailLoading(false)
      }
    }
    loadDetail()
  }, [selectedId])

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase()
    return (
      (e.full_name || '').toLowerCase().includes(q) ||
      (e.job_title || '').toLowerCase().includes(q) ||
      (e.employee_id || '').toLowerCase().includes(q)
    )
  })
  const selected = employees.find((e) => e.user_id === selectedId)

  const sidebarUser = adminProfile
    ? { name: adminProfile.full_name || adminProfile.employee_id, avatar: (adminProfile.full_name || adminProfile.employee_id || '?').slice(0, 2).toUpperCase() }
    : null

  if (loading) {
    return (
      <Layout title="Employees">
        <p className="text-muted">Loading employees…</p>
      </Layout>
    )
  }

  return (
    <Layout user={sidebarUser} title="Employees" subtitle="Browse the team and switch between profiles.">
      {employees.length === 0 ? (
        <div className="card">
          <p className="text-sm text-muted">No employees have signed up yet. Generate an Employee ID to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="card lg:col-span-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input pl-10"
                placeholder="Search by name, title or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              {filtered.map((emp) => (
                <button
                  key={emp.user_id}
                  onClick={() => setSelectedId(emp.user_id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    selectedId === emp.user_id ? 'bg-ink text-white' : 'hover:bg-canvas'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      selectedId === emp.user_id ? 'bg-white/15 text-white' : 'bg-accent-soft text-accent-deep'
                    }`}
                  >
                    {(emp.full_name || emp.employee_id || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${selectedId === emp.user_id ? 'text-white' : 'text-ink'}`}>
                      {emp.full_name || emp.employee_id}
                    </p>
                    <p className={`truncate text-xs ${selectedId === emp.user_id ? 'text-white/60' : 'text-muted'}`}>
                      {emp.job_title || 'No title'} · {emp.employee_id}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            {selected && (
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent-deep">
                    {(selected.full_name || selected.employee_id || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{selected.full_name || selected.employee_id}</p>
                    <p className="text-sm text-muted">{selected.job_title || 'No title set'}</p>
                  </div>
                  <span className="ml-auto">
                    <StatusBadge status={selected.attendance_status} />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4 text-sm">
                  <div>
                    <p className="text-xs text-muted">Employee ID</p>
                    <p className="font-medium text-ink">{selected.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Email</p>
                    <p className="truncate font-medium text-ink">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Phone</p>
                    <p className="font-medium text-ink">{selected.phone || 'Not added'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Joined</p>
                    <p className="font-medium text-ink">
                      {selected.created_at
                        ? new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="font-display text-base font-semibold text-ink">Recent attendance</h3>
              <div className="mt-4 space-y-2">
                {detailLoading && <p className="text-sm text-muted">Loading…</p>}
                {!detailLoading && attendance.length === 0 && (
                  <p className="text-sm text-muted">No attendance records on file.</p>
                )}
                {attendance.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5 text-sm">
                    <span className="text-ink">
                      {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-muted">
                      {rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'} –{' '}
                      {rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                    <StatusBadge status={rec.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-display text-base font-semibold text-ink">Leave history</h3>
              <div className="mt-4 space-y-2">
                {!detailLoading && leave.length === 0 && <p className="text-sm text-muted">No leave requests on file.</p>}
                {leave.map((lr) => (
                  <div key={lr.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5 text-sm">
                    <span className="text-ink">
                      {lr.leave_type} · {new Date(lr.start_date).toLocaleDateString()} → {new Date(lr.end_date).toLocaleDateString()}
                    </span>
                    <StatusBadge status={lr.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
