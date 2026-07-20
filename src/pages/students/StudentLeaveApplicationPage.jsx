import { CalendarDays, FileText, ListChecks, Save, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { getOrganizationId } from '../../utils/classSections'

const SESSION_OPTIONS = [
  { value: 'full_day', label: 'Full day' },
  { value: 'first_half', label: 'First half' },
  { value: 'second_half', label: 'Second half' },
]

const LEAVE_TYPE_OPTIONS = [
  { value: 'sick_leave', label: 'Sick leave' },
  { value: 'casual_leave', label: 'Casual leave' },
  { value: 'occasion_leave', label: 'Occasion leave' },
]

function normalizeComparable(value) {
  return String(value ?? '').trim().toLowerCase()
}

function resolveUserId(user) {
  const candidates = [
    user?.user_id,
    user?.userId,
    user?.id,
    user?.sub,
    user?.user?.id,
    user?.user?.user_id,
    user?.data?.id,
    user?.data?.user_id,
  ]

  const match = candidates.find((value) => String(value ?? '').trim() !== '')
  return String(match ?? '').trim()
}

function TextAreaField({ label, error, register, name, placeholder, rows = 5 }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-500/20"
      />
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  )
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function StudentLeaveApplicationPage() {
  const { user } = useAuth()
  const [notification, setNotification] = useState(null)
  const organizationId = useMemo(() => getOrganizationId(), [])
  const userId = useMemo(() => resolveUserId(user), [user])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      start_date: '',
      start_session: '',
      end_date: '',
      end_session: '',
      leave_type: '',
      comments: '',
    },
  })

  useEffect(() => {
    if (!notification) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setNotification(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [notification])

  const notify = useCallback((type, message) => {
    setNotification({ type, message })
  }, [])

  const sessionRank = useCallback((session) => {
    switch (session) {
      case 'full_day':
        return 0
      case 'first_half':
        return 1
      case 'second_half':
        return 2
      default:
        return 99
    }
  }, [])

  const onSubmit = async (values) => {
    clearErrors()

    if (!organizationId) {
      setError('root', {
        type: 'manual',
        message: 'Organization id is required to submit leave.',
      })
      notify('error', 'Organization id is required to submit leave.')
      return
    }

    if (!userId) {
      setError('root', {
        type: 'manual',
        message: 'Unable to determine the logged-in user.',
      })
      notify('error', 'Unable to determine the logged-in user.')
      return
    }

    if (normalizeComparable(values.start_date) > normalizeComparable(values.end_date)) {
      setError('end_date', {
        type: 'manual',
        message: 'End date must be the same as or after the start date.',
      })
      return
    }

    if (
      normalizeComparable(values.start_date) === normalizeComparable(values.end_date) &&
      sessionRank(values.start_session) > sessionRank(values.end_session)
    ) {
      setError('end_session', {
        type: 'manual',
        message: 'End session must come after the start session for the same day.',
      })
      return
    }

    const payload = {
      start_date: values.start_date,
      start_session: values.start_session,
      end_date: values.end_date,
      end_session: values.end_session,
      leave_type: values.leave_type,
      comments: values.comments.trim(),
    }

    try {
      await api.post(`/students/Leave/${organizationId}/${userId}`, payload)
      notify('success', 'Leave application submitted successfully')
      reset({
        start_date: '',
        start_session: '',
        end_date: '',
        end_session: '',
        leave_type: '',
        comments: '',
      })
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to submit leave application'
      notify('error', backendMessage)
      setError('root', {
        type: 'server',
        message: backendMessage,
      })
    }
  }

  return (
    <div className="page-shell">
      {notification ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-[60] max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_30px_-18px_rgba(15,23,42,0.45)] ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Students</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Student Leave Application
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Apply for leave by choosing the start and end sessions, leave type, and a short comment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <UserRound size={16} />
              <span>User ID: {userId || 'Not available'}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <CalendarDays size={16} />
              <span>Organization ID: {organizationId || 'Not available'}</span>
            </div>
          </div>
        </div>

        {errors.root?.message ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            {errors.root.message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <SectionCard
            icon={ListChecks}
            title="Leave Details"
            description="Fill in the leave range and leave type before submitting."
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Start Date"
                  type="date"
                  error={errors.start_date?.message}
                  {...register('start_date', {
                    required: 'Start date is required',
                  })}
                />

                <Controller
                  control={control}
                  name="start_session"
                  rules={{ required: 'Start session is required' }}
                  render={({ field }) => (
                    <Select
                      label="Start Session"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.start_session?.message}
                      placeholder="Select session"
                    >
                      <option value="" disabled>
                        Select session
                      </option>
                      {SESSION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />

                <Input
                  label="End Date"
                  type="date"
                  error={errors.end_date?.message}
                  {...register('end_date', {
                    required: 'End date is required',
                  })}
                />

                <Controller
                  control={control}
                  name="end_session"
                  rules={{ required: 'End session is required' }}
                  render={({ field }) => (
                    <Select
                      label="End Session"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.end_session?.message}
                      placeholder="Select session"
                    >
                      <option value="" disabled>
                        Select session
                      </option>
                      {SESSION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  control={control}
                  name="leave_type"
                  rules={{ required: 'Leave type is required' }}
                  render={({ field }) => (
                    <Select
                      label="Leave Type"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.leave_type?.message}
                      placeholder="Select leave type"
                    >
                      <option value="" disabled>
                        Select leave type
                      </option>
                      {LEAVE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <TextAreaField
                label="Comments"
                name="comments"
                register={register}
                placeholder="Add a short reason or any supporting details"
                error={errors.comments?.message}
                rows={6}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  All fields are required before leave can be submitted.
                </p>

                <Button type="submit" variant="brand" className="min-w-[160px]" disabled={isSubmitting}>
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Application Summary"
            description="Review what will be sent to the backend."
          >
            <div className="grid gap-4">
              <div className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">API Endpoint</p>
                <p className="mt-2 break-all text-sm font-medium text-slate-900 dark:text-white">
                  POST /students/Leave/{organizationId || '{organization_id}'}/{userId || '{user_id}'}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Payload contains only the form fields: dates, sessions, leave type, and comments.
                </p>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Required Fields</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>Start date and session</li>
                  <li>End date and session</li>
                  <li>Leave type</li>
                  <li>Comments</li>
                </ul>
              </div>

              <EmptyState
                title="Ready to submit"
                description="Once you fill the form, the app sends the full payload to the backend and clears the form on success."
              />
            </div>
          </SectionCard>
        </div>
      </Card>
    </div>
  )
}
