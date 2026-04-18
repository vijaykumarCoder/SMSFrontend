export function StatCard({ item }) {
  const Icon = item.icon

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          {item.change}
        </span>
      </div>
      <div className="mt-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{item.value}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.caption}</p>
      </div>
    </div>
  )
}
