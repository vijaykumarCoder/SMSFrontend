export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
