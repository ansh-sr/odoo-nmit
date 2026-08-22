import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getUserId } from '../lib/auth.js'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AdminLeaveApprovals() {
  const userId = getUserId()
  const [adminProfile, setAdminProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchRequests = async (status) => {
    setLoading(true)
    try {
      const url = status === 'All' ? `${apiUrl}/admin/leaves` : `${apiUrl}/admin/leaves?status=${status}`
      const res = await fetch(url)
      setRequests(res.ok ? await res.json() : [])
    } catch (err) {
      console.error('Failed to fetch leave requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetch(`${apiUrl}/profile/${userId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setAdminProfile(data))
        .catch(() => {})
    }
  }, [userId])

  useEffect(() => {
    fetchRequests(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const updateStatus = async (requestId, status) => {
    setBusyId(requestId)
    try {
      const res = await fetch(`${apiUrl}/leave/approve/${requestId}?status=${status}`, { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to update leave request')
      await fetchRequests(filter)
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  const sidebarUser = adminProfile
    ? { name: adminProfile.full_name || adminProfile.employee_id, avatar: (adminProfile.full_name || adminProfile.employee_id || '?').slice(0, 2).toUpperCase() }
    : null

  return (
    <Layout user={sidebarUser} title="Leave Approvals" subtitle="Review and act on time-off requests across the team.">
      <div className="mb-5 flex gap-2">
        {['Pending', 'Approved', 'Rejected', 'All'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
              filter === f ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-muted hover:bg-canvas'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {!loading && requests.length === 0 && <p className="text-sm text-muted">No requests in this view.</p>}
        <div className="divide-y divide-line">
          {requests.map((lr) => (
            <div key={lr.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
                  {(lr.employee_name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{lr.employee_name}</p>
                  <p className="text-xs text-muted">
                    {lr.leave_type} leave · {new Date(lr.start_date).toLocaleDateString()} → {new Date(lr.end_date).toLocaleDateString()}
                  </p>
                  {lr.remarks && <p className="mt-1 text-sm text-ink/80">{lr.remarks}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:pl-4">
                {lr.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(lr.id, 'Approved')}
                      disabled={busyId === lr.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success transition hover:bg-success hover:text-white"
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(lr.id, 'Rejected')}
                      disabled={busyId === lr.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger hover:text-white"
                    >
                      <X size={15} /> Reject
                    </button>
                  </>
                ) : (
                  <StatusBadge status={lr.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
