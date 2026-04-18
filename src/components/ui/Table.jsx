export function Table({ columns, rows, emptyState, renderRowActions }) {
  if (!rows.length) return emptyState ?? null

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
              {renderRowActions ? <th className="px-5 py-4 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white/80 text-sm dark:divide-slate-800 dark:bg-slate-950/50">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {renderRowActions ? <td className="px-5 py-4">{renderRowActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
