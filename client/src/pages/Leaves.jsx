import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import LedgerTable from '../components/LedgerTable'

function fmtDateOnly(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Leaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [notice, setNotice] = useState('')
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'Casual', start_date: '', end_date: '', remarks: '' })
  const [leaveError, setLeaveError] = useState('')

  async function load() {
    const data = await api.getLeaves(user.id)
    setLeaves(data)
  }

  useEffect(() => {
    load().catch((e) => setNotice(e.message))
  }, [])

  async function submitLeave(e) {
    e.preventDefault()
    setLeaveError('')
    try {
      await api.requestLeave(user.id, leaveForm)
      setLeaveForm({ leave_type: 'Casual', start_date: '', end_date: '', remarks: '' })
      setNotice('Leave request submitted.')
      await load()
    } catch (e2) {
      setLeaveError(e2.message)
    }
  }

  const pending = leaves.filter((l) => l.status === 'Pending').length
  const approved = leaves.filter((l) => l.status === 'Approved').length

  return (
    <div className="min-h-screen bg-paper">
      <Navbar title="Leave" />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {notice && (
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-ink border border-rule px-4 py-2 inline-block">
            {notice}
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Pending" value={pending} accent={pending > 0} />
          <StatCard label="Approved" value={approved} />
          <StatCard label="Total requests" value={leaves.length} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Leave request form */}
          <section>
            <h2 className="font-display text-xl text-ink mb-3">Request leave</h2>
            <form onSubmit={submitLeave} className="border border-rule p-5 mb-5">
              <label className="block mb-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Type</span>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, leave_type: e.target.value }))}
                  className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Earned</option>
                  <option>Unpaid</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-slate">From</span>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-slate">To</span>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
                  />
                </label>
              </div>
              <label className="block mb-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Remarks</span>
                <textarea
                  value={leaveForm.remarks}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, remarks: e.target.value }))}
                  className="mt-1 w-full border border-rule bg-paper px-3 py-2 font-body text-sm focus:border-ink outline-none"
                  rows={2}
                />
              </label>
              {leaveError && <div className="mb-3 font-body text-sm text-danger">{leaveError}</div>}
              <button className="w-full bg-ink text-paper font-body text-sm py-2.5 hover:bg-signal hover:text-ink transition-colors">
                Submit request
              </button>
            </form>
          </section>

          {/* Leave history */}
          <section>
            <h2 className="font-display text-xl text-ink mb-3">Leave history</h2>
            <LedgerTable
              columns={[
                { key: 'leave_type', label: 'Type' },
                { key: 'start_date', label: 'From', render: (r) => fmtDateOnly(r.start_date) },
                { key: 'end_date', label: 'To', render: (r) => fmtDateOnly(r.end_date) },
                { key: 'remarks', label: 'Remarks' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (
                    <span className={
                      r.status === 'Approved' ? 'text-success' :
                      r.status === 'Rejected' ? 'text-danger' : 'text-slate'
                    }>
                      {r.status}
                    </span>
                  ),
                },
              ]}
              rows={leaves}
              emptyLabel="No leave requests filed."
            />
          </section>
        </div>
      </main>
    </div>
  )
}
