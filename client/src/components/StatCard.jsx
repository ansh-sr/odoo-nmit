export default function StatCard({ label, value, accent = false }) {
  return (
    <div className="bg-paper border border-rule p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-slate mb-2">{label}</div>
      <div className={`font-display text-3xl ${accent ? 'text-signal' : 'text-ink'}`}>{value}</div>
    </div>
  )
}
