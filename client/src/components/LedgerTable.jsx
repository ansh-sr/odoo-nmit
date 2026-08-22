export default function LedgerTable({ columns, rows, emptyLabel = 'No entries yet' }) {
  return (
    <div className="border border-rule">
      <div className="grid ledger-rule bg-paperDim" style={{ gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' ') }}>
        {columns.map((col) => (
          <div key={col.key} className="font-mono text-[11px] uppercase tracking-widest text-slate px-4 py-3 border-t-0">
            {col.label}
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <div className="px-4 py-8 text-center font-body text-sm text-slate">{emptyLabel}</div>
      )}
      {rows.map((row, i) => (
        <div
          key={row.id ?? i}
          className="grid ledger-row"
          style={{ gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' ') }}
        >
          {columns.map((col) => (
            <div key={col.key} className="px-4 py-3 font-body text-sm text-ink flex items-center">
              {col.render ? col.render(row) : row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
