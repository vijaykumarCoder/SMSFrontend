import { Children, forwardRef, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'

export function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <span
        className={cn(
          'flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus-within:ring-brand-500/20',
          error && 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100',
          className,
        )}
      >
        {Icon ? <Icon size={16} className="text-slate-400" /> : null}
        <input className="w-full bg-transparent outline-none placeholder:text-slate-400" {...props} />
      </span>
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  )
}

function createSyntheticEvent(name, value) {
  return {
    target: { name, value },
    currentTarget: { name, value },
    type: 'change',
  }
}

function extractOptions(children) {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => ({
      key: child.key ?? `${child.props.value ?? child.props.children ?? 'option'}-${index}`,
      value: child.props.value ?? child.props.children,
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }))
}

export const Select = forwardRef(function Select(
  {
    label,
    error,
    children,
    className,
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    placeholder = 'Select an option',
    disabled,
    ...props
  },
  ref,
) {
  const selectId = useId()
  const wrapperRef = useRef(null)
  const options = useMemo(() => extractOptions(children), [children])
  const initialValue = defaultValue ?? options.find((option) => !option.disabled)?.value ?? ''
  const [internalValue, setInternalValue] = useState(initialValue)
  const [open, setOpen] = useState(false)

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue
  const selectedOption = options.find((option) => option.value === selectedValue)
  const displayLabel = selectedOption?.label ?? placeholder

  useEffect(() => {
    if (isControlled) return
    if (options.some((option) => option.value === internalValue)) return

    const fallbackValue = defaultValue ?? options.find((option) => !option.disabled)?.value ?? ''
    setInternalValue(fallbackValue)
  }, [defaultValue, internalValue, isControlled, options])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }

    onChange?.(createSyntheticEvent(name, nextValue))
    onBlur?.(createSyntheticEvent(name, nextValue))
    setOpen(false)
  }

  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <div className="relative" ref={wrapperRef}>
        <select
          ref={ref}
          aria-hidden="true"
          className="sr-only"
          tabIndex={-1}
          value={selectedValue}
          name={name}
          disabled={disabled}
          onChange={() => {}}
          {...props}
        >
          {children}
        </select>
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${selectId}-listbox`}
          onClick={() => setOpen((current) => !current)}
          onBlur={() => onBlur?.(createSyntheticEvent(name, selectedValue))}
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-medium text-slate-900 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.28)] outline-none transition hover:border-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:ring-brand-500/20 dark:disabled:bg-slate-900 dark:disabled:text-slate-500',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-500/20',
            open && 'border-brand-300 ring-4 ring-brand-100 dark:ring-brand-500/20',
            className,
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-slate-400 dark:text-slate-500')}>{displayLabel}</span>
          <ChevronDown size={18} className={cn('shrink-0 text-slate-400 transition-transform dark:text-slate-500', open && 'rotate-180')} />
        </button>
        {open ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_18px_34px_-16px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950"
          >
            <ul id={`${selectId}-listbox`} role="listbox" aria-labelledby={selectId} className="max-h-64 overflow-y-auto py-1">
              {options.map((option) => {
                const selected = option.value === selectedValue

                return (
                  <li key={option.key} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'flex w-full items-center justify-between px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white dark:disabled:text-slate-600',
                        selected && 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {selected ? <Check size={16} className="shrink-0" /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  )
})
