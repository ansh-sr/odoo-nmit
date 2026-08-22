import { useState } from 'react'
import { LogIn, LogOut, CalendarDays } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { currentUser, attendanceByEmployee } from '../data/mockData.js'

export default function Attendance() {
  const [records, setRecords] = useState(attendanceByEmployee[currentUser.id])
  const today = records.at(-1)
  const [checkedIn, setCheckedIn] = useState(Boolean(today?.checkIn))
  const [checkedOut, setCheckedOut] = useState(Boolean(today?.checkOut))

  const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  function handleCheckIn() {
    setCheckedIn(true)
    setRecords((prev) => {
      const copy = [...prev]
      copy[copy.length - 1] = { ...copy[copy.length - 1], checkIn: nowTime(), status: 'Present' }
      return copy
    })
  }

  function handleCheckOut() {
    setCheckedOut(true)
    setRecords((prev) => {
      const copy = [...prev]
      copy[copy.length - 1] = { ...copy[copy.length - 1], checkOut: nowTime() }
      return copy
    })
  }

  const presentCount = records.filter((r) => r.status === 'Present').length

  return (
    <Layout
      user={currentUser}
      title="Attendance"
      subtitle="Your daily check-ins and weekly summary."
      action={
        <div className="flex gap-2">
          <button onClick={handleCheckIn} disabled={checkedIn} className="btn-accent disabled:cursor-not-allowed">
            <LogIn size={16} /> Check in
          </button>
          <button onClick={handleCheckOut} disabled={!checkedIn || checkedOut} className="btn-primary disabled:cursor-not-allowed">
            <LogOut size={16} /> Check out
          </button>
        </div>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Present', value: presentCount, color: 'text-success' },
          { label: 'Absent', value: records.filter((r) => r.status === 'Absent').length, color: 'text-danger' },
          { label: 'Half-day', value: records.filter((r) => r.status === 'Half-day').length, color: 'text-accent-deep' },
          { label: 'Leave', value: records.filter((r) => r.status === 'Leave').length, color: 'text-indigo' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-accent-deep" />
          <h3 className="font-display text-base font-semibold text-ink">This week</h3>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Check-in</th>
                <th className="pb-3 font-medium">Check-out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.date} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">
                    {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="py-3 pr-4 text-muted">{rec.checkIn || '—'}</td>
                  <td className="py-3 text-muted">{rec.checkOut || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
