import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import api from '../../utils/api'

const DEFAULT_ORGANIZATION_ID = localStorage.getItem("DEFAULT_ORGANIZATION_ID")
const CREATE_TEACHER_API = '/teachers/createTeacher'
const GET_TEACHERS_APIS = [
  `/teachers/getAllTeachers/${DEFAULT_ORGANIZATION_ID}`,
  `/teachers/getAllTeachers${DEFAULT_ORGANIZATION_ID}`,
  `/teachers/getAllTeachers?organization_id=${DEFAULT_ORGANIZATION_ID}`,
]
const UPDATE_TEACHER_API = (teacherId) => `/teachers/updateTeacher/${teacherId}`
const DELETE_TEACHER_API = (teacherId) => `/teachers/deleteTeacher/${teacherId}`

const formDefaults = {
  teacher_name: '',
  phone_number: '',
  status: 'Contract',
  type: 'Full',
  subject: '',
  years_of_experience: '',
  address: '',
  additional_details: '',
  organization_id: DEFAULT_ORGANIZATION_ID,
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

function normalizeTeacher(record, index = 0) {
  const id = record?.teacher_id ?? record?.id ?? record?._id ?? `teacher-${index}`

  return {
    id,
    teacherId: record?.teacher_id ?? record?.id ?? record?._id ?? null,
    organization_id: Number(readFirstValue(record, ['organization_id', 'organizationId'])) || DEFAULT_ORGANIZATION_ID,
    teacher_name: String(readFirstValue(record, ['teacher_name', 'teacherName', 'name'])).trim(),
    phone_number: String(readFirstValue(record, ['phone_number', 'phoneNumber', 'contact'])).trim(),
    status: String(readFirstValue(record, ['status'])).trim(),
    type: String(readFirstValue(record, ['type'])).trim(),
    subject: String(readFirstValue(record, ['subject'])).trim(),
    years_of_experience: readFirstValue(record, ['years_of_experience', 'yearsOfExperience', 'experience']),
    address: String(readFirstValue(record, ['address'])).trim(),
    additional_details: String(readFirstValue(record, ['additional_details', 'additionalDetails', 'notes'])).trim(),
    raw: record ?? {},
  }
}

function extractTeacherRows(response) {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.teachers,
    response?.data?.results,
    response?.teachers,
    response?.results,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getStatusTone(status) {
  const normalizedStatus = normalizeText(status)

  if (!normalizedStatus) {
    return 'neutral'
  }

  if (normalizedStatus.includes('contract')) {
    return 'warning'
  }

  if (normalizedStatus.includes('full') || normalizedStatus.includes('active') || normalizedStatus.includes('permanent')) {
    return 'success'
  }

  return 'info'
}

async function requestWithFallbacks(requestFactories) {
  let lastError = null

  for (const createRequest of requestFactories) {
    try {
      return await createRequest()
    } catch (error) {
      lastError = error

      const status = error?.response?.status
      if (status && status !== 404 && status !== 405) {
        throw error
      }
    }
  }

  throw lastError
}

const columns = [
  {
    key: 'teacher_name',
    label: 'Teacher',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{row.teacher_name || 'Unnamed teacher'}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {row.id}</p>
      </div>
    ),
  },
  { key: 'subject', label: 'Subject' },
  { key: 'type', label: 'Type' },
  {
    key: 'years_of_experience',
    label: 'Experience',
    render: (row) => `${row.years_of_experience || 0} years`,
  },
  { key: 'phone_number', label: 'Phone' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge tone={getStatusTone(row.status)}>{row.status || 'Unknown'}</Badge>,
  },
]

export function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [notification, setNotification] = useState(null)
  const isMountedRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: formDefaults,
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

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await requestWithFallbacks(
        GET_TEACHERS_APIS.map((endpoint) => () => api.get(endpoint)),
      )

      const nextTeachers = extractTeacherRows(response).map((record, index) => normalizeTeacher(record, index))

      if (!isMountedRef.current) {
        return
      }

      setTeachers(nextTeachers)
    } catch (fetchError) {
      if (!isMountedRef.current) {
        return
      }

      setError(fetchError?.response?.data?.message || fetchError?.message || 'Failed to load teachers')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    fetchTeachers()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchTeachers])

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    return teachers
      .filter((teacher) => {
        if (!normalizedQuery) {
          return true
        }

        const searchableValues = [
          teacher.teacher_name,
          teacher.phone_number,
          teacher.subject,
          teacher.type,
          teacher.status,
          teacher.address,
        ]

        return searchableValues.some((value) => normalizeText(value).includes(normalizedQuery))
      })
      .sort((left, right) => left.teacher_name.localeCompare(right.teacher_name))
  }, [query, teachers])

  const openCreateModal = () => {
    setEditingTeacher(null)
    clearErrors()
    reset(formDefaults)
    setModalOpen(true)
  }

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher)
    clearErrors()
    reset({
      teacher_name: teacher.teacher_name ?? '',
      phone_number: teacher.phone_number ?? '',
      status: teacher.status || 'Contract',
      type: teacher.type || 'Full',
      subject: teacher.subject ?? '',
      years_of_experience: teacher.years_of_experience ?? '',
      address: teacher.address ?? '',
      additional_details: teacher.additional_details ?? '',
      organization_id: teacher.organization_id ?? DEFAULT_ORGANIZATION_ID,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTeacher(null)
    clearErrors()
    reset(formDefaults)
  }

  const buildPayload = (values) => ({
    organization_id: DEFAULT_ORGANIZATION_ID,
    teacher_name: values.teacher_name.trim(),
    phone_number: values.phone_number.trim(),
    status: values.status,
    type: values.type,
    subject: values.subject.trim(),
    years_of_experience: Number(values.years_of_experience),
    address: values.address.trim(),
    additional_details: values.additional_details.trim(),
  })

  const onSubmit = async (values) => {
    setSaving(true)
    setError('')

    try {
      const payload = buildPayload(values)

      if (editingTeacher?.teacherId) {
        await requestWithFallbacks([
          () => api.put(UPDATE_TEACHER_API(editingTeacher.teacherId), payload),
          () => api.put(`/teachers/${editingTeacher.teacherId}`, payload),
        ])
        notify('success', 'Teacher updated successfully')
      } else {
        await api.post(CREATE_TEACHER_API, payload)
        notify('success', 'Teacher created successfully')
      }

      closeModal()
      await fetchTeachers()
    } catch (submitError) {
      const backendMessage = submitError?.response?.data?.message || submitError?.message || 'Failed to save teacher'
      setFormError('teacher_name', {
        type: 'server',
        message: backendMessage,
      })
      notify('error', backendMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (teacher) => {
    const confirmed = window.confirm(`Delete ${teacher.teacher_name}?`)
    if (!confirmed) {
      return
    }

    const teacherId = teacher.teacherId ?? teacher.id
    if (!teacherId) {
      notify('error', 'Unable to delete this teacher')
      return
    }

    setDeletingId(teacher.id)
    setError('')

    try {
      await requestWithFallbacks([
        () => api.delete(DELETE_TEACHER_API(teacherId)),
        () => api.delete(`/teachers/${teacherId}`),
      ])
      notify('success', 'Teacher deleted successfully')
      await fetchTeachers()
    } catch (deleteError) {
      const backendMessage = deleteError?.response?.data?.message || deleteError?.message || 'Failed to delete teacher'
      notify('error', backendMessage)
      setError(backendMessage)
    } finally {
      setDeletingId('')
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Faculty</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Teachers</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Manage teacher records from the backend and keep the table in sync after every create, edit, or delete.
            </p>
          </div>

          <Button variant="brand" onClick={openCreateModal}>
            <Plus size={18} />
            Add Teacher
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by teacher name, subject, phone, or status"
            icon={Search}
          />
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Total teachers</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{teachers.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              Loading teachers...
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load teachers"
              description={error}
              action={
                <Button variant="brand" onClick={fetchTeachers}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={filteredTeachers}
              emptyState={<EmptyState title="No teachers found" description="No teacher data was returned from the server." />}
              renderRowActions={(row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                    aria-label={`Edit ${row.teacher_name}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                    aria-label={`Delete ${row.teacher_name}`}
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
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        description={
          editingTeacher
            ? 'Update the teacher record and save the latest values to the backend.'
            : 'Create a new teacher profile and refresh the live list automatically.'
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Teacher Name"
            placeholder="Enter teacher name"
            error={errors.teacher_name?.message}
            {...register('teacher_name', {
              required: 'Teacher name is required',
              validate: (value) => value.trim().length > 0 || 'Teacher name is required',
            })}
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            error={errors.phone_number?.message}
            {...register('phone_number', {
              required: 'Phone number is required',
              validate: (value) => value.trim().length > 0 || 'Phone number is required',
            })}
          />
          <Select label="Status" error={errors.status?.message} {...register('status', { required: 'Status is required' })}>
            <option value="Contract">Contract</option>
            <option value="Permanent">Permanent</option>
            <option value="Probation">Probation</option>
            <option value="Active">Active</option>
          </Select>
          <Select label="Type" error={errors.type?.message} {...register('type', { required: 'Type is required' })}>
            <option value="Full">Full</option>
            <option value="Part">Part</option>
          </Select>
          <Input
            label="Subject"
            placeholder="Enter subject"
            error={errors.subject?.message}
            {...register('subject', {
              required: 'Subject is required',
              validate: (value) => value.trim().length > 0 || 'Subject is required',
            })}
          />
          <Input
            label="Years of Experience"
            type="number"
            min="0"
            step="1"
            placeholder="Enter years of experience"
            error={errors.years_of_experience?.message}
            {...register('years_of_experience', {
              required: 'Years of experience is required',
              validate: (value) => {
                if (value === '') return 'Years of experience is required'
                const numericValue = Number(value)
                return Number.isFinite(numericValue) && numericValue >= 0 ? true : 'Enter a valid experience value'
              },
            })}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            error={errors.address?.message}
            className="md:col-span-2"
            {...register('address', {
              required: 'Address is required',
              validate: (value) => value.trim().length > 0 || 'Address is required',
            })}
          />
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Additional Details</span>
            <textarea
              rows={4}
              placeholder="Enter additional details"
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-500/20"
              {...register('additional_details', {
                required: 'Additional details are required',
                validate: (value) => value.trim().length > 0 || 'Additional details are required',
              })}
            />
            {errors.additional_details?.message ? (
              <span className="text-xs font-medium text-rose-500">{errors.additional_details.message}</span>
            ) : null}
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={saving}>
              {saving ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Save Teacher'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
