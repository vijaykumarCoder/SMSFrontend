import { ArrowUpRight, BusFront, Clock3, GraduationCap, Users } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useInitialLoading } from '../../hooks/useInitialLoading'
import { overviewData, performanceData, statCards } from '../../utils/mockData'
import { BarChartCard, LineChartCard } from '../../components/ui/ChartCard'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'

export function DashboardPage() {
  const loading = useInitialLoading()
  const activities = useAppStore((state) => state.activities)

  if (loading) {
    return (
      <div className="page-shell">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52 w-full" />
          ))}
        </div>
        <div className="panel-grid">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <section className="glass-panel overflow-hidden p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              Operations Center
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              School Management Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Track campus performance, attendance, finance, and upcoming activities through a modern control room.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Total Students',
                value: '2403',
                icon: GraduationCap,
                cardClass: 'bg-[#d8fff0] text-slate-900',
                iconClass: 'bg-emerald-500 text-white',
              },
              {
                label: 'Total Staffs',
                value: '19',
                icon: Users,
                cardClass: 'bg-[#dcebff] text-slate-900',
                iconClass: 'bg-sky-500 text-white',
              },
              {
                label: 'Total Vehicle',
                value: '10',
                icon: BusFront,
                cardClass: 'bg-[#fff1c9] text-slate-900',
                iconClass: 'bg-amber-400 text-white',
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-[24px] px-4 py-4 ${item.cardClass}`}>
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.iconClass}`}>
                      <item.icon size={16} />
                    </div>
                    <p className="min-w-0 text-sm font-medium text-slate-600">{item.label}</p>
                  </div>
                </div>
                <div className="mt-8 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </section>

      <section className="panel-grid">
        <LineChartCard title="School Performance" subtitle="Weekly comparison across academics and engagement" data={performanceData} />
        <BarChartCard title="Monthly Overview" subtitle="Attendance, revenue and events trend" data={overviewData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-subtitle">Operational highlights from today</p>
            </div>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
              View report
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <Clock3 size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {activity.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <h3 className="section-title">Today at a Glance</h3>
            <p className="section-subtitle">Priority tasks for the admin team</p>
          </div>
          <div className="space-y-4">
            {[
              ['Finalize bus route changes', 'Transport desk'],
              ['Publish class 12 mock results', 'Examination cell'],
              ['Send pending fee reminders', 'Accounts'],
              ['Confirm annual day vendors', 'Events committee'],
            ].map(([title, owner]) => (
              <div key={title} className="rounded-[24px] bg-gradient-to-r from-slate-50 to-brand-50 p-4 dark:from-slate-900 dark:to-brand-500/10">
                <p className="font-medium text-slate-900 dark:text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{owner}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
