import { useState } from 'react'
import { Send } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { currentUser, leaveByEmployee } from '../data/mockData.js'

const LEAVE_TYPES = ['Paid', 'Sick', 'Unpaid']

export default function Leave() {
  const [requests, setRequests] = useState(leaveByEmployee[currentUser.id])
  const [form, setForm] = useState({ type: 'Paid', startDate: '', endDate: '', remarks: '' })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.startDate || !form.endDate) return

    const newRequest = {
      id: `LR${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      ...form,
      status: 'Pending',
      appliedOn: new Date().toISOString().slice(0, 10),
    }
    setRequests((prev) => [newRequest, ...prev])
    setForm({ type: 'Paid', startDate: '', endDate: '', remarks: '' })
  }

  return (
    <Layout user={currentUser} title="Leave Requests" subtitle="Apply for time-off and track approval status.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="card lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-ink">Apply for leave</h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Leave type</label>
              <div className="grid grid-cols-3 gap-2">
                {LEAVE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      form.type === t ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-muted hover:bg-canvas'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start date</label>
                <input
                  type="date"
                  className="input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">End date</label>
                <input
                  type="date"
                  className="input"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Remarks</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="Reason for leave (optional)"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-accent w-full">
              <Send size={16} />
              Submit request
            </button>
          </div>
        </form>

        <div className="card lg:col-span-3">
          <h3 className="font-display text-base font-semibold text-ink">Your requests</h3>
          <div className="mt-4 space-y-3">
            {requests.length === 0 && <p className="text-sm text-muted">No leave requests yet.</p>}
            {requests.map((lr) => (
              <div key={lr.id} className="rounded-lg border border-line px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{lr.type} leave</p>
                  <StatusBadge status={lr.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {lr.startDate} → {lr.endDate} · Applied {lr.appliedOn}
                </p>
                {lr.remarks && <p className="mt-2 text-sm text-ink/80">{lr.remarks}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
