import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import LedgerTable from '../components/LedgerTable'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtDateOnly(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Attendance() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function load() {
    const data = await api.getAttendance(user.id)
    setRecords(data.sort((x, y) => new Date(y.date) - new Date(x.date)))
  }

  useEffect(() => {
    load().catch((e) => setNotice(e.message))
  }, [])

  const openEntry = useMemo(
    () => records.find((r) => r.check_in_time && !r.check_out_time),
    [records],
  )

  async function handleCheckIn() {
    setBusy(true)
    setNotice('')
    try {
      await api.checkIn(user.id)
      await load()
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
      await load()
      setNotice('Stamped out.')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }

  const presentDays = records.filter((r) => r.status === 'Present').length
  const halfDays = records.filter((r) => r.status === 'Half-day').length

  return (
    <div className="min-h-screen bg-paper">
      <Navbar title="Attendance" />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {notice && (
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-ink border border-rule px-4 py-2 inline-block">
            {notice}
          </div>
        )}

        {/* Time Clock */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 border border-rule p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate mb-4">Time clock</div>
            <button
              onClick={openEntry ? handleCheckOut : handleCheckIn}
              disabled={busy}
              className={`stamp w-32 h-32 rounded-full border-4 flex items-center justify-center font-display text-lg disabled:opacity-50 transition
                ${openEntry ? 'border-danger text-danger' : 'border-success text-success'}`}
            >
              <span className={openEntry ? 'stamp-mark whitespace-pre text-center leading-tight' : 'whitespace-pre text-center leading-tight'}>
                {openEntry ? 'PUNCH\nOUT' : 'PUNCH\nIN'}
              </span>
            </button>
            <div className="font-mono text-[11px] text-slate mt-4">
              {openEntry ? `Open since ${fmtDate(openEntry.check_in_time)}` : 'Not checked in today'}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <StatCard label="Days present" value={presentDays} />
            <StatCard label="Half days" value={halfDays} accent={halfDays > 0} />
            <StatCard label="Total records" value={records.length} />
          </div>
        </section>

        {/* Attendance history */}
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Attendance history</h2>
          <LedgerTable
            columns={[
              { key: 'date', label: 'Date', render: (r) => fmtDateOnly(r.date) },
              { key: 'status', label: 'Status' },
              { key: 'check_in_time', label: 'In', render: (r) => fmtDate(r.check_in_time) },
              { key: 'check_out_time', label: 'Out', render: (r) => fmtDate(r.check_out_time) },
            ]}
            rows={records}
            emptyLabel="No attendance logged yet — punch in above."
          />
        </section>
      </main>
    </div>
  )
}
