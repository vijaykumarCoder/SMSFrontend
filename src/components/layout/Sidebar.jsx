import { ChevronLeft, GraduationCap, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../utils/helpers'
import { navigationItems } from '../../utils/mockData'

export function Sidebar({ collapsed }) {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const mobileSidebarOpen = useAppStore((state) => state.mobileSidebarOpen)
  const closeMobileSidebar = useAppStore((state) => state.closeMobileSidebar)
  const desktopCollapsed = collapsed

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/35 transition-opacity duration-300 lg:hidden',
          mobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeMobileSidebar}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-white/60 bg-gradient-to-b from-brand-700 via-brand-600 to-slate-900 p-4 text-white transition-all duration-300 lg:flex',
          // 'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-white/60 bg-gradient-to-b from-brand-700 via-brand-600 to-slate-900 p-4 text-white shadow-[0_24px_80px_-25px_rgba(49,46,129,0.9)] transition-all duration-300 lg:flex',
          desktopCollapsed ? 'lg:w-[92px]' : 'lg:w-[280px]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 px-2 pb-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
              <GraduationCap size={24} />
            </div>
            {!desktopCollapsed ? (
              <div>
                <p className="text-xl font-semibold tracking-tight">Akademi</p>
                <p className="text-xs text-white/60">School OS Console</p>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 lg:hidden" onClick={closeMobileSidebar}>
              <X size={18} />
            </button>
            <button className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 lg:flex" onClick={toggleSidebar}>
              <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
            </button>
          </div>
        </div>

        <nav className="scrollbar-hidden flex-1 space-y-2 overflow-y-auto pr-1">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white',
                    isActive && 'bg-white/14 text-white shadow-lg shadow-brand-950/20',
                    desktopCollapsed && 'lg:justify-center lg:px-0',
                  )
                }
              >
                <Icon size={20} className="shrink-0" />
                {!desktopCollapsed ? <span>{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>

        {!desktopCollapsed ? (
          <div className="mt-4 rounded-[28px] bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Spring Admission Drive</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Track enquiries, callbacks and counselor follow-ups from one place.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  )
}
