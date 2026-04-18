import { cn } from '../../utils/helpers'

export function Card({ children, className }) {
  return <section className={cn('glass-panel p-6', className)}>{children}</section>
}
