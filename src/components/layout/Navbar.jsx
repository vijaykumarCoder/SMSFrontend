import { Bell, ChevronDown, Menu, MessageSquareMore, Moon, Search, SunMedium } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { Button } from '../ui/Button'

export function Navbar() {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar)

  return (
    <header className="glass-panel sticky top-0 z-20 mb-1 flex flex-wrap items-center justify-between gap-3 rounded-none px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="secondary" className="lg:hidden" onClick={toggleMobileSidebar}>
          <Menu size={18} />
        </Button>
        <div className="hidden h-9 min-w-0 items-center gap-3 rounded-2xl bg-slate-100 px-4 text-sm text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800 md:flex">
          <Search size={16} />
          <span className="truncate">Search students, teachers, reports...</span>
        </div>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-3">
        <Link
          to="/login"
          className="hidden h-11 items-center rounded-2xl bg-brand-600 px-5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:bg-brand-700 md:inline-flex"
        >
          Login
        </Link>
        <div className="flex min-w-0 items-center gap-1 rounded-[22px] bg-white px-2 py-2 text-slate-900 dark:bg-slate-900 dark:text-white sm:gap-2 sm:px-3">
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
            <Bell size={16} />
          </button>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
            <MessageSquareMore size={16} />
          </button>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <SunMedium size={16} />}
          </button>
          <div className="mx-1 hidden h-8 w-px bg-slate-200/80 dark:bg-slate-700 sm:block" />
          <div className="flex min-w-0 items-center gap-2 rounded-full pl-1 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fde68a,#0ea5e9)] text-xs font-semibold text-slate-900">
              PL
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-none">Priscilla Lily</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Admin</p>
            </div>
            <button className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:flex">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
 
