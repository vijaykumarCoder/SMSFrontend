import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Edit3, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import api from '../../utils/api'
import { fetchClassSectionCatalog, getOrganizationId } from '../../utils/classSections'

const CREATE_CLASS_API = 'http://localhost:8000/classes/createClass'
const UPDATE_CLASS_API = (classId) => `http://localhost:8000/classes/update Class/${classId}`
const DELETE_CLASS_API = (classId) => `http://localhost:8000/classes/deleteClass/${classId}`
const GET_TEACHERS_API = (organizationId) => `http://localhost:8000/teachers/getAllTeachers/${organizationId}`
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F']

function normalizeSectionValue(value) {
  const rawValue = String(value ?? '').trim()

  if (!rawValue) {
    return 'A'
  }

  return rawValue.replace(/^section\s+/i, '').trim() || 'A'
}

function getSectionTeacherLabel(sections = []) {
  const teachers = [...new Set(sections.map((section) => section.classTeacher).filter(Boolean))]
  return teachers.length ? teachers.join(', ') : 'Not assigned'
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

function extractTeacherRows(response) {
  const candidates = [response, response?.data, response?.data?.data, response?.data?.teachers, response?.teachers, response?.results]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeTeacher(record, index = 0) {
  const teacherId = record?.teacher_id ?? record?.teacherId ?? record?.id ?? record?._id ?? `teacher-${index}`

  return {
    id: teacherId,
    teacherId: record?.teacher_id ?? record?.teacherId ?? record?.id ?? record?._id ?? null,
    teacher_name: String(readFirstValue(record, ['teacher_name', 'teacherName', 'name'])).trim(),
    subject: String(readFirstValue(record, ['subject'])).trim(),
    raw: record ?? {},
  }
}

function getUniqueSections(classes = [], classFilter = 'All') {
  const candidateClasses =
    classFilter === 'All' ? classes : classes.filter((item) => String(item.className) === String(classFilter))

  const sections = candidateClasses.flatMap((item) => item.sections ?? [])
  const uniqueSections = [...new Map(sections.map((section) => [section.sectionName, section])).values()]

  return uniqueSections.sort((left, right) => left.sectionName.localeCompare(right.sectionName))
}

export function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classFilter, setClassFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [error, setError] = useState('')
  const [teacherError, setTeacherError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingClass, setEditingClass] = useState(null)
  const [notification, setNotification] = useState(null)
  const isMountedRef = useRef(false)
  const organizationId = getOrganizationId()

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      className: '',
      section: 'A',
      teacherId: '',
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

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const nextClasses = await fetchClassSectionCatalog(organizationId)

      if (!isMountedRef.current) {
        return
      }

      setClasses(nextClasses)
    } catch (fetchError) {
      if (!isMountedRef.current) {
        return
      }

      setError(fetchError?.response?.data?.message || fetchError?.message || 'Failed to load classes. Please try again.')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [organizationId])

  const fetchTeachers = useCallback(async () => {
    if (!organizationId) {
      setTeachers([])
      setTeacherError('Organization id is required to load teachers')
      setTeachersLoading(false)
      return
    }

    setTeachersLoading(true)
    setTeacherError('')

    try {
      const response = await api.get(GET_TEACHERS_API(organizationId))
      const nextTeachers = extractTeacherRows(response)
        .map((record, index) => normalizeTeacher(record, index))
        .sort((left, right) => left.teacher_name.localeCompare(right.teacher_name))

      if (!isMountedRef.current) {
        return
      }

      setTeachers(nextTeachers)
    } catch (fetchError) {
      if (!isMountedRef.current) {
        return
      }

      const backendMessage = fetchError?.response?.data?.message || fetchError?.message || 'Failed to load teachers'
      setTeachers([])
      setTeacherError(backendMessage)
    } finally {
      if (isMountedRef.current) {
        setTeachersLoading(false)
      }
    }
  }, [organizationId])

  useEffect(() => {
    isMountedRef.current = true
    fetchClasses()
    fetchTeachers()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchClasses, fetchTeachers])

  useEffect(() => {
    if (sectionFilter === 'All') {
      return
    }

    const sectionOptions = getUniqueSections(classes, classFilter)
    const sectionExists = sectionOptions.some((section) => section.sectionName === sectionFilter)

    if (!sectionExists) {
      setSectionFilter('All')
    }
  }, [classFilter, classes, sectionFilter])

  const classOptions = useMemo(() => {
    return ['All', ...new Set(classes.map((item) => item.className).filter(Boolean))].sort((left, right) => {
      if (left === 'All') return -1
      if (right === 'All') return 1
      return left.localeCompare(right)
    })
  }, [classes])

  const sectionOptions = useMemo(() => {
    const options = getUniqueSections(classes, classFilter)

    return ['All', ...options.map((section) => section.sectionName)]
  }, [classFilter, classes])

  const openCreateModal = () => {
    setEditingClass(null)
    clearErrors()
    reset({
      className: '',
      section: 'A',
      teacherId: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingClass(row)
    clearErrors()
    reset({
      className: row.className,
      section: normalizeSectionValue(row.sectionName || row.primarySection),
      teacherId: row.classTeacherId ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingClass(null)
    clearErrors()
    reset({
      className: '',
      section: 'A',
      teacherId: '',
    })
  }

  const buildClassPayload = (values, classNameOverride = '') => {
    const selectedTeacherId = String(values.teacherId ?? '').trim()
    const resolvedClassName = String(classNameOverride || values.className || '').trim()

    return {
      organization_id: organizationId,
      class_name: resolvedClassName.startsWith('Class ') ? resolvedClassName : `Class ${resolvedClassName}`,
      section_name: `Section ${String(values.section ?? '').trim()}`,
      class_teacher_id: selectedTeacherId,
      teacher_id: selectedTeacherId,
    }
  }

  const onSubmit = async (values) => {
    if (!organizationId) {
      setFormError('className', {
        type: 'server',
        message: 'Organization id is required to save classes',
      })
      notify('error', 'Organization id is required to save classes')
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.post(CREATE_CLASS_API, buildClassPayload(values))

      notify('success', 'Saved successfully')
      closeModal()
      await fetchClasses()
    } catch (submitError) {
      if (submitError?.response?.status === 409) {
        setFormError('section', {
          type: 'server',
          message: 'This section already exists for the selected class',
        })
      } else {
        setFormError('className', {
          type: 'server',
          message: submitError?.response?.data?.message || 'Failed to create class section',
        })
      }

      notify('error', submitError?.response?.data?.message || 'Failed to save class')
    } finally {
      setSaving(false)
    }
  }

  const onEditSubmit = async (values) => {
    if (!editingClass?.classId) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.put(UPDATE_CLASS_API(editingClass.classId), buildClassPayload(values, editingClass.className))

      notify('success', 'Saved successfully')
      closeModal()
      await fetchClasses()
    } catch (updateError) {
      notify('error', updateError?.response?.data?.message || 'Failed to save class')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!row?.classId) {
      notify('error', 'Unable to delete this class')
      return
    }

    const confirmed = window.confirm(`Delete ${row.className}?`)
    if (!confirmed) {
      return
    }

    setDeletingId(row.id)
    setError('')

    try {
      await api.delete(DELETE_CLASS_API(row.classId))
      notify('success', 'Deleted successfully')
      await fetchClasses()
    } catch (deleteError) {
      notify('error', deleteError?.response?.data?.message || 'Failed to delete class')
    } finally {
      setDeletingId('')
    }
  }

  const rows = useMemo(() => {
    return classes
      .filter((item) => classFilter === 'All' || item.className === classFilter)
      .filter((item) => {
        if (sectionFilter === 'All') {
          return true
        }

        return (item.sections ?? []).some((section) => section.sectionName === sectionFilter)
      })
      .map((item) => ({
        id: item.id,
        classId: item.classId,
        className: item.className,
        classTeacher: getSectionTeacherLabel(item.sections),
        primarySection: item.sections?.[0]?.sectionName ?? '',
        sectionName: item.sections?.[0]?.sectionName ?? '',
        classTeacherId: item.sections?.[0]?.classTeacherId ?? '',
      }))
      .sort((left, right) => left.className.localeCompare(right.className))
  }, [classFilter, classes, sectionFilter])

  const columns = useMemo(
    () => [
      { key: 'className', label: 'Class Name' },
      { key: 'classTeacher', label: 'Class Teacher' },
    ],
    [],
  )

  return (
    <div className="page-shell">
      {notification ? (
        <div
          role="alert"
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
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Classes</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              View each class, its teachers, and the sections returned by the backend.
            </p>
          </div>
          <Button variant="brand" onClick={openCreateModal}>
            <Plus size={18} />
            Add Class
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px_220px]">
          <Select
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value)
              setSectionFilter('All')
            }}
            label="Filter By Class"
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className === 'All' ? 'All Classes' : className}
              </option>
            ))}
          </Select>
          <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} label="Filter By Section">
            {sectionOptions.map((sectionName) => (
              <option key={sectionName} value={sectionName}>
                {sectionName === 'All' ? 'All Sections' : sectionName}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              Loading classes...
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load classes"
              description={error}
              action={
                <Button variant="brand" onClick={fetchClasses}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={rows}
              emptyState={<EmptyState title="No classes found" description="No class data was returned from the server." />}
              renderRowActions={(row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                    aria-label={`Edit ${row.className}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                    aria-label={`Delete ${row.className}`}
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
        title={editingClass ? 'Edit Class' : 'Create New Class'}
        description={
          editingClass
            ? 'Update the class details and save the latest values to the backend.'
            : 'Add a new class section and then refresh the live list from the backend.'
        }
      >
        <form onSubmit={handleSubmit(editingClass ? onEditSubmit : onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Class Name"
            placeholder="Enter class name"
            error={errors.className?.message}
            type="number"
            disabled={Boolean(editingClass)}
            {...register('className', {
              required: 'Class name is required',
              validate: (value) => value.trim().length > 0 || 'Class name is required',
            })}
          />
          <Controller
            name="section"
            control={control}
            rules={{ required: 'Section is required' }}
            render={({ field }) => (
              <Select label="Section" error={errors.section?.message} placeholder="Select section" {...field}>
                {SECTION_OPTIONS.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </Select>
            )}
          />
          <Controller
            name="teacherId"
            control={control}
            rules={{ required: 'Teacher is required' }}
            render={({ field }) => (
              <Select
                label="Teacher"
                error={errors.teacherId?.message || teacherError || undefined}
                placeholder={teachersLoading ? 'Loading teachers...' : 'Select teacher'}
                disabled={teachersLoading || !teachers.length}
                {...field}
              >
                <option value="" disabled>
                  {teachersLoading ? 'Loading teachers...' : teachers.length ? 'Select teacher' : 'No teachers available'}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.teacherId ?? teacher.id}>
                    {teacher.teacher_name}
                    {teacher.subject ? ` - ${teacher.subject}` : ''}
                  </option>
                ))}
              </Select>
            )}
          />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={saving || teachersLoading || !teachers.length}>
              {saving ? 'Saving...' : 'Save Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
