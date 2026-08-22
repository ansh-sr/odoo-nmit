import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payroll, setPayroll] = useState([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadAll() {
    const [a, l, p] = await Promise.all([
      api.getAttendance(user.id),
      api.getLeaves(user.id),
      api.getPayroll(user.id),
    ])
    setAttendance(a.sort((x, y) => new Date(y.date) - new Date(x.date)))
    setLeaves(l)
    setPayroll(p)
  }

  useEffect(() => {
    loadAll().catch((e) => setNotice(e.message))
  }, [])

  const openEntry = useMemo(
    () => attendance.find((row) => row.check_in_time && !row.check_out_time),
    [attendance],
  )

  async function handleCheckIn() {
    setBusy(true)
    setNotice('')
    try {
      await api.checkIn(user.id)
      await loadAll()
      setNotice('Stamped in.')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleCheckOut() {
    if (!openEntry) return
    setBusy(true)
    setNotice('')
    try {
      await api.checkOut(openEntry.id)
      await loadAll()
      setNotice('Stamped out.')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }

  const netTotal = payroll.reduce((sum, p) => sum + Number(p.net_salary || 0), 0)
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length

  const sections = [
    { to: '/attendance', label: 'Attendance', desc: 'Punch in/out and view history' },
    { to: '/leaves', label: 'Leave Requests', desc: 'Apply for time off' },
    { to: '/payroll', label: 'Payroll', desc: 'View salary history' },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <Navbar title="Employee" />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {notice && (
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-ink border border-rule px-4 py-2 inline-block">
            {notice}
          </div>
        )}

        {/* Time Clock + Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 border border-rule p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate mb-4">Time clock</div>
            <button
              onClick={openEntry ? handleCheckOut : handleCheckIn}
              disabled={busy}
              className={`stamp w-32 h-32 rounded-full border-4 flex items-center justify-center font-display text-lg disabled:opacity-50 transition
                ${openEntry ? 'border-danger text-danger' : 'border-success text-success'}`}
            >
              <span className="whitespace-pre text-center leading-tight">
                {openEntry ? 'PUNCH\nOUT' : 'PUNCH\nIN'}
              </span>
            </button>
            <div className="font-mono text-[11px] text-slate mt-4">
              {openEntry ? `Open since ${fmtDate(openEntry.check_in_time)}` : 'Not checked in today'}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <StatCard label="Records logged" value={attendance.length} />
            <StatCard label="Pending leave" value={pendingLeaves} accent={pendingLeaves > 0} />
            <StatCard label="Net paid to date" value={`$${netTotal.toLocaleString()}`} />
          </div>
        </section>

        {/* Quick links to sections */}
        <section>
          <h2 className="font-display text-xl text-ink mb-4">Quick access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="border border-rule p-5 hover:border-ink transition-colors group"
              >
                <div className="font-display text-lg text-ink group-hover:text-signal transition-colors">{label}</div>
                <div className="font-body text-sm text-slate mt-1">{desc}</div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-slate mt-3">→ Open</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
