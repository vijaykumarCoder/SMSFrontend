import { FileText, Folder, UploadCloud } from 'lucide-react'
import { fileItems } from '../../utils/mockData'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function FileManagerPage() {
  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">File Manager</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Browse folders, uploaded reports and shared academic assets.
            </p>
          </div>
          <Button variant="brand">
            <UploadCloud size={18} />
            Upload File
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fileItems.map((item) => {
            const Icon = item.type === 'Folder' ? Folder : FileText

            return (
              <div key={item.id} className="rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.size}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Updated {item.updated}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
