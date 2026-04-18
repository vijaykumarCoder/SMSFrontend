import { cn } from '../../utils/helpers'

const badgeVariants = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        badgeVariants[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
