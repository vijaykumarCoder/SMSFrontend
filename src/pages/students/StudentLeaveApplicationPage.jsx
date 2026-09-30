import { CalendarDays, Edit3, Plus, Save, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
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

const DEFAULT_FORM_VALUES = {
  start_date: '',
  start_session: '',
  end_date: '',
  end_session: '',
  leave_type: '',
  comments: '',
}

const CREATE_LEAVE_API = '/leaves/createLeave'
const UPDATE_LEAVE_API = '/leaves/updateLeave'
const DELETE_LEAVE_API = (leaveId) => `/leaves/${leaveId}`
const GET_TEACHER_LEAVES_API = '/leaves/getTeacherLeaves'

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

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

function readFirstValue(record, keys) {
  for (const key of keys) {
    const value = record?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return ''
}

function toInputDate(value) {
  if (!value) {
    return ''
  }

  const text = String(value).trim()
  if (!text) {
    return ''
  }

  const dateMatch = text.match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    return dateMatch[1]
  }

  const parsedDate = new Date(text)
  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toISOString().slice(0, 10)
}

function formatDisplayDate(value) {
  const dateValue = toInputDate(value)
  if (!dateValue) {
    return '-'
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function formatLabel(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatSession(value) {
  const normalized = normalizeText(value)

  switch (normalized) {
    case 'full_day':
      return 'Full day'
    case 'first_half':
      return 'First half'
    case 'second_half':
      return 'Second half'
    default:
      return formatLabel(value) || '-'
  }
}

function getLeaveStatusTone(status) {
  const normalized = normalizeText(status)

  if (!normalized) {
    return 'neutral'
  }

  if (normalized.includes('pending')) {
    return 'warning'
  }

  if (normalized.includes('approved') || normalized.includes('accept')) {
    return 'success'
  }

  if (normalized.includes('reject') || normalized.includes('cancel') || normalized.includes('declin')) {
    return 'danger'
  }

  return 'info'
}

function getApiMessage(payload, fallback = '') {
  return payload?.data?.message || payload?.message || payload?.response?.data?.message || payload?.response?.message || fallback
}

function extractLeaveRows(response) {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.leaves,
    response?.data?.results,
    response?.data?.leaveRecords,
    response?.leaves,
    response?.results,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeLeave(record, index = 0) {
  const id = readFirstValue(record, ['leave_id', 'leaveId', 'id', '_id']) || `leave-${index}`
  const studentId = String(readFirstValue(record, ['student_id', 'studentId', 'user_id', 'userId'])).trim()

  return {
    id,
    leaveId: readFirstValue(record, ['leave_id', 'leaveId', 'id', '_id']) || null,
    studentId,
    leave_type: String(readFirstValue(record, ['leave_type', 'leaveType', 'type'])).trim(),
    from_date: toInputDate(readFirstValue(record, ['from_date', 'fromDate', 'start_date', 'startDate'])),
    start_session: String(readFirstValue(record, ['start_session', 'startSession'])).trim(),
    to_date: toInputDate(readFirstValue(record, ['to_date', 'toDate', 'end_date', 'endDate'])),
    end_session: String(readFirstValue(record, ['end_session', 'endSession'])).trim(),
    status: String(readFirstValue(record, ['status'])).trim(),
    comments: String(readFirstValue(record, ['comments', 'comment', 'reason', 'description'])).trim(),
    raw: record ?? {},
  }
}

function isPendingLeave(leave) {
  return normalizeComparable(leave?.status).includes('pending')
}

export function StudentLeaveApplicationPage() {
  const { user } = useAuth()
  const organizationId = useMemo(() => getOrganizationId(), [])
  const userId = useMemo(() => resolveUserId(user), [user])
  const isMountedRef = useRef(false)

  const [notification, setNotification] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLeave, setEditingLeave] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError: setFormError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
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

  const fetchLeaves = useCallback(async () => {
    if (!organizationId) {
      setLeaves([])
      setError('Organization id is required to load leaves.')
      setLoading(false)
      return
    }

    if (!userId) {
      setLeaves([])
      setError('Teacher id is required to load leaves.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post(GET_TEACHER_LEAVES_API, {
        organization_id: organizationId,
        teacher_id: 5,
      })

      const mappedLeaves = extractLeaveRows(response).map((record, index) => normalizeLeave(record, index))

      if (!isMountedRef.current) {
        return
      }

      setLeaves(mappedLeaves)
    } catch (fetchError) {
      if (!isMountedRef.current) {
        return
      }

      setError(fetchError?.response?.data?.message || fetchError?.message || 'Failed to load leave applications')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [organizationId, userId])

  useEffect(() => {
    isMountedRef.current = true
    fetchLeaves()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchLeaves])

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

  const openCreateModal = () => {
    setEditingLeave(null)
    clearErrors()
    reset(DEFAULT_FORM_VALUES)
    setModalOpen(true)
  }

  const openEditModal = (leave) => {
    if (!isPendingLeave(leave)) {
      notify('error', 'Only pending leave requests can be updated.')
      return
    }

    setEditingLeave(leave)
    clearErrors()
    reset({
      start_date: leave.from_date || '',
      start_session: leave.start_session || '',
      end_date: leave.to_date || '',
      end_session: leave.end_session || '',
      leave_type: leave.leave_type || '',
      comments: leave.comments || '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingLeave(null)
    clearErrors()
    reset(DEFAULT_FORM_VALUES)
  }

  const buildPayload = (values) => ({
    ...(editingLeave?.leaveId ? { leave_id: editingLeave.leaveId } : {}),
    ...(editingLeave?.id && !editingLeave?.leaveId ? { id: editingLeave.id } : {}),
    organization_id: organizationId,
    teacher_id: 5,
    leave_type: values.leave_type,
    from_date: values.start_date,
    to_date: values.end_date,
    start_session: values.start_session,
    end_session: values.end_session,
    reason: values.comments.trim(),
    status: editingLeave?.status || 'PENDING',
  })

  const onSubmit = async (values) => {
    clearErrors()

    if (!organizationId) {
      setFormError('root', {
        type: 'manual',
        message: 'Organization id is required to submit leave.',
      })
      notify('error', 'Organization id is required to submit leave.')
      return
    }

    if (!userId) {
      setFormError('root', {
        type: 'manual',
        message: 'Unable to determine the logged-in user.',
      })
      notify('error', 'Unable to determine the logged-in user.')
      return
    }

    if (normalizeComparable(values.start_date) > normalizeComparable(values.end_date)) {
      setFormError('end_date', {
        type: 'manual',
        message: 'End date must be the same as or after the start date.',
      })
      return
    }

    if (
      normalizeComparable(values.start_date) === normalizeComparable(values.end_date) &&
      sessionRank(values.start_session) > sessionRank(values.end_session)
    ) {
      setFormError('end_session', {
        type: 'manual',
        message: 'End session must come after the start session for the same day.',
      })
      return
    }

    const payload = buildPayload(values)
    setSaving(true)

    try {
      if (editingLeave) {
        const response = await api.put(UPDATE_LEAVE_API, payload)
        notify('success', getApiMessage(response, 'Leave application updated successfully'))
      } else {
        const response = await api.post(CREATE_LEAVE_API, payload)
        notify('success', getApiMessage(response, 'Leave application submitted successfully'))
      }

      closeModal()
      await fetchLeaves()
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to save leave application'
      setFormError('root', {
        type: 'server',
        message: backendMessage,
      })
      notify('error', backendMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (leave) => {
    const confirmed = window.confirm('Delete this leave request?')
    if (!confirmed) {
      return
    }

    const leaveId = leave.leaveId ?? leave.id
    if (!leaveId) {
      notify('error', 'Unable to delete this leave request.')
      return
    }

    setDeletingId(leave.id)
    setError('')

    try {
      const response = await api.delete(DELETE_LEAVE_API(leaveId))
      notify('success', getApiMessage(response, 'Leave application deleted successfully'))
      await fetchLeaves()
    } catch (deleteError) {
      const backendMessage = deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete leave'
      setError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setDeletingId('')
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'leave_type',
        label: 'Leave Type',
        render: (row) => <span className="font-medium text-slate-900 dark:text-white">{formatLabel(row.leave_type) || '-'}</span>,
      },
      { key: 'from_date', label: 'From Date', render: (row) => formatDisplayDate(row.from_date) },
      { key: 'start_session', label: 'Start Session', render: (row) => formatSession(row.start_session) },
      { key: 'to_date', label: 'End Date', render: (row) => formatDisplayDate(row.to_date) },
      { key: 'end_session', label: 'End Session', render: (row) => formatSession(row.end_session) },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <Badge tone={getLeaveStatusTone(row.status)}>{formatLabel(row.status) || 'Unknown'}</Badge>,
      },
      {
        key: 'comments',
        label: 'Comments',
        render: (row) => (
          <span className="block max-w-[320px] whitespace-normal break-words text-slate-600 dark:text-slate-300">
            {row.comments || '-'}
          </span>
        ),
      },
    ],
    [],
  )

  const visibleLeaves = useMemo(() => {
    return [...leaves].sort((left, right) => {
      const leftDate = `${left.from_date || ''}${left.to_date || ''}`
      const rightDate = `${right.from_date || ''}${right.to_date || ''}`
      return rightDate.localeCompare(leftDate)
    })
  }, [leaves])

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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Students</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Student Leave Application
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Review your leave requests in the table below and use the Apply Leave button to open the form in a modal.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <Button variant="brand" onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus size={18} />
              Apply Leave
            </Button>

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
        </div>

        {errors.root?.message ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            {errors.root.message}
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              Loading leave applications...
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load leave applications"
              description={error}
              action={
                <Button variant="brand" onClick={fetchLeaves}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={visibleLeaves}
              emptyState={
                <EmptyState
                  title="No leave applications found"
                  description="Create your first leave request using the Apply Leave button."
                  action={
                    <Button variant="brand" onClick={openCreateModal}>
                      Apply Leave
                    </Button>
                  }
                />
              }
              renderRowActions={(row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(row)}
                    disabled={!isPendingLeave(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-brand-100 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                    aria-label={`Edit leave ${row.id}`}
                    title={isPendingLeave(row) ? 'Edit leave' : 'Only pending leave can be updated'}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                    aria-label={`Delete leave ${row.id}`}
                    title="Delete leave"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingLeave ? 'Update Leave' : 'Apply Leave'}
        description={
          editingLeave
            ? 'Update the pending leave request and save the changes to the backend.'
            : 'Create a new leave request without leaving the table view.'
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="From Date"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date', {
              required: 'From date is required',
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

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Comments</span>
            <textarea
              rows={5}
              placeholder="Add a short reason or supporting details"
              className="min-h-[130px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-500/20"
              {...register('comments', {
                required: 'Comments are required',
                validate: (value) => value.trim().length > 0 || 'Comments are required',
              })}
            />
            {errors.comments?.message ? <span className="text-xs font-medium text-rose-500">{errors.comments.message}</span> : null}
          </label>

          {errors.root?.message ? (
            <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {errors.root.message}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={saving || isSubmitting}>
              <Save size={16} />
              {saving || isSubmitting ? 'Saving...' : editingLeave ? 'Update Leave' : 'Submit Leave'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
