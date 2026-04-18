import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, title, description, onClose, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-10 px-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
