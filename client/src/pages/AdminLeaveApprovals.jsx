import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { employees, leaveByEmployee } from '../data/mockData.js'

const adminUser = employees.find((e) => e.role === 'HR')

function buildRequestList(store) {
  return Object.entries(store).flatMap(([empId, reqs]) =>
    reqs.map((r) => ({ ...r, employeeId: empId, employeeName: employees.find((e) => e.id === empId)?.name })),
  )
}

export default function AdminLeaveApprovals() {
  const [store, setStore] = useState(leaveByEmployee)
  const [filter, setFilter] = useState('Pending')

  const allRequests = buildRequestList(store).sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
  const visible = filter === 'All' ? allRequests : allRequests.filter((r) => r.status === filter)

  function updateStatus(employeeId, requestId, status) {
    setStore((prev) => ({
      ...prev,
      [employeeId]: prev[employeeId].map((r) => (r.id === requestId ? { ...r, status } : r)),
    }))
  }

  return (
    <Layout user={adminUser} title="Leave Approvals" subtitle="Review and act on time-off requests across the team.">
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
        {visible.length === 0 && <p className="text-sm text-muted">No requests in this view.</p>}
        <div className="divide-y divide-line">
          {visible.map((lr) => (
            <div key={lr.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-deep">
                  {lr.employeeName?.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{lr.employeeName}</p>
                  <p className="text-xs text-muted">
                    {lr.type} leave · {lr.startDate} → {lr.endDate} · Applied {lr.appliedOn}
                  </p>
                  {lr.remarks && <p className="mt-1 text-sm text-ink/80">{lr.remarks}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:pl-4">
                {lr.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(lr.employeeId, lr.id, 'Approved')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success transition hover:bg-success hover:text-white"
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(lr.employeeId, lr.id, 'Rejected')}
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
