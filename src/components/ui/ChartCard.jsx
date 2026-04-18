import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from './Card'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    </div>
  )
}

export function LineChartCard({ title, subtitle, data }) {
  return (
    <Card className="h-full">
      <div className="mb-6">
        <h3 className="section-title">{title}</h3>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="current" stroke="#4f46e5" strokeWidth={3} dot={false} name="This Week" />
            <Line type="monotone" dataKey="previous" stroke="#fb923c" strokeWidth={3} dot={false} name="Last Week" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function BarChartCard({ title, subtitle, data }) {
  return (
    <Card className="h-full">
      <div className="mb-6">
        <h3 className="section-title">{title}</h3>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="attendance" fill="#4f46e5" radius={[8, 8, 0, 0]} name="Attendance" />
            <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} name="Revenue" />
            <Bar dataKey="events" fill="#fb7185" radius={[8, 8, 0, 0]} name="Events" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
