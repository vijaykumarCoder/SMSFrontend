import { Outlet } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../utils/helpers'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const sidebarWidth = sidebarCollapsed ? 'lg:ml-[92px]' : 'lg:ml-[280px]'

  return (
    <div className="min-h-screen pb-4 pt-0">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className={cn('transition-all duration-300', sidebarWidth)}>
        <div className="mx-auto max-w-[1600px]">
          <Navbar />
          <main className="px-4 pt-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
