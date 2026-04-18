import { CalendarDays, MapPin, Users } from 'lucide-react'
import { eventCalendarDays, eventCards } from '../../utils/mockData'
import { Card } from '../../components/ui/Card'

export function EventsPage() {
  return (
    <div className="page-shell">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Events</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Plan ceremonies, academic showcases and parent-facing activities in one view.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eventCards.map((event) => (
              <div key={event.id} className="rounded-[28px] bg-slate-50 p-5 dark:bg-slate-900/70">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <CalendarDays size={20} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  <p>{event.date} • {event.time}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} /> {event.location}</p>
                  <p className="flex items-center gap-2"><Users size={14} /> {event.attendees} attendees</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* <Card>
          <div className="mb-6">
            <h3 className="section-title">Calendar View</h3>
            <p className="section-subtitle">April 2026 highlights</p>
          </div>
          <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-3">
            {Array.from({ length: 30 }).map((_, index) => {
              const date = index + 1
              const event = eventCalendarDays.find((item) => item.date === date)

              return (
                <div key={date} className="min-h-24 rounded-[20px] border border-slate-200 bg-white p-3 text-left text-sm dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="font-semibold text-slate-900 dark:text-white">{date}</p>
                  {event ? <p className="mt-3 rounded-xl bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{event.title}</p> : null}
                </div>
              )
            })}
          </div>
        </Card> */}
      </section>
    </div>
  )
}
