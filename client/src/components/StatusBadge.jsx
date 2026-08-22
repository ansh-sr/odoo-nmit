const STYLES = {
  Present: 'bg-success-soft text-success',
  Approved: 'bg-success-soft text-success',
  Absent: 'bg-danger-soft text-danger',
  Rejected: 'bg-danger-soft text-danger',
  'Half-day': 'bg-accent-soft text-accent-deep',
  Pending: 'bg-accent-soft text-accent-deep',
  Leave: 'bg-indigo-soft text-indigo',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-canvas text-muted'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}
