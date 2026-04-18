import { useAppStore } from '../../store/appStore'
import { feeCards } from '../../utils/mockData'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'

const columns = [
  { key: 'payer', label: 'Payer' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'amount', label: 'Amount' },
  { key: 'method', label: 'Method' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge tone={row.status === 'Paid' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
]

export function FinancePage() {
  const payments = useAppStore((state) => state.payments)

  return (
    <div className="page-shell">
      <section className="grid gap-6 md:grid-cols-3">
        {feeCards.map((card) => (
          <Card key={card.title}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.subtitle}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Finance</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review fee collection health and payment timelines across the school.
          </p>
        </div>
        <Table columns={columns} rows={payments} />
      </Card>
    </div>
  )
}
