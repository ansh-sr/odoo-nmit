import { Sunrise, Sunset } from 'lucide-react'

// Signature element: a literal "day flow" bar. Maps the current time onto a
// 9am–6pm workday window so the sun marker visually shows how far through
// the workday you are — a small nod to "Every workday, perfectly aligned."
export default function DayProgress() {
  const now = new Date()
  const startHour = 9
  const endHour = 18
  const totalMinutes = (endHour - startHour) * 60
  const elapsed = (now.getHours() - startHour) * 60 + now.getMinutes()
  const percent = Math.min(100, Math.max(0, (elapsed / totalMinutes) * 100))

  const timeLabel = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="card flex items-center gap-5">
      <div className="flex items-center gap-2 text-muted">
        <Sunrise size={16} />
        <span className="text-xs font-medium">9:00</span>
      </div>

      <div className="relative h-2 flex-1 rounded-full bg-gradient-to-r from-indigo-soft via-accent-soft to-accent">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-pop transition-all"
          style={{ left: `calc(${percent}% - 7px)` }}
        />
      </div>

      <div className="flex items-center gap-2 text-muted">
        <span className="text-xs font-medium">18:00</span>
        <Sunset size={16} />
      </div>

      <div className="ml-2 hidden shrink-0 rounded-lg bg-canvas px-3 py-1.5 text-xs font-semibold text-ink sm:block">
        Now — {timeLabel}
      </div>
    </div>
  )
}
