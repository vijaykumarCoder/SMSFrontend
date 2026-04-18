import { useForm } from 'react-hook-form'
import { settingsCards } from '../../utils/mockData'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'

export function SettingsPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: { schoolName: 'Akademi Senior School', timezone: 'Asia/Calcutta', currency: 'USD' },
  })

  return (
    <div className="page-shell">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Settings</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Configure school preferences, admin workflows and experience controls.
            </p>
          </div>
          <div className="space-y-4">
            {settingsCards.map((card) => (
              <div key={card.title} className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="font-semibold text-slate-900 dark:text-white">{card.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="section-title">General Preferences</h3>
          <p className="section-subtitle">Profile-level settings form with reusable inputs</p>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(() => {})}>
            <Input label="School Name" {...register('schoolName')} />
            <Select label="Timezone" {...register('timezone')}>
              <option>Asia/Calcutta</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
            </Select>
            <Select label="Currency" {...register('currency')}>
              <option>USD</option>
              <option>INR</option>
              <option>EUR</option>
            </Select>
            <Input label="Academic Session" placeholder="2026 - 2027" />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="brand">Save Settings</Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  )
}
