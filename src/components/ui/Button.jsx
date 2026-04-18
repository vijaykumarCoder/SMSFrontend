import { cn } from '../../utils/helpers'

const variants = {
  primary:
    'bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
  brand:
    'bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-700 shadow-lg shadow-brand-500/20',
  secondary:
    'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
}

export function Button({ children, className, variant = 'primary', size = 'md', ...props }) {
  const sizeClass = size === 'sm' ? 'h-10 px-4 text-sm' : 'h-11 px-5 text-sm'

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizeClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
