import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import api from '../../utils/api'

const DEFAULT_ORGANIZATION_ID = localStorage.getItem("DEFAULT_ORGANIZATION_ID")
const CLASS_COUNT_API = `http://localhost:8000/classes/totalStudent/${DEFAULT_ORGANIZATION_ID}`
const CREATE_CLASS_API = 'http://localhost:8000/classes/createClass'
const UPDATE_CLASS_API = (classId) => `http://localhost:8000/classes/${classId}`
const DELETE_CLASS_API = (classId) => `http://localhost:8000/classes/${classId}`
const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F']

function normalizeSectionName(value) {
  const rawValue = String(value ?? '').trim()

  if (!rawValue) {
    return ''
  }

  return rawValue.replace(/^section\s+/i, '').trim()
}

function normalizeSection(section, index = 0) {
  return {
    id: section?.section_id ?? section?.id ?? `section-${index}`,
    sectionId: section?.section_id ?? section?.id ?? null,
    sectionName: normalizeSectionName(section?.section_name ?? section?.sectionName),
    classTeacher: String(section?.class_teacher ?? section?.classTeacher ?? '').trim(),
    classTeacherId: section?.class_teacher_id ?? section?.classTeacherId ?? null,
    studentsCount: Number(section?.students_count ?? section?.studentsCount ?? 0) || 0,
  }
}

function normalizeClass(record, index = 0) {
  const sections = Array.isArray(record?.sections) ? record.sections.map(normalizeSection) : []

  return {
    id: record?.class_id ?? record?.id ?? record?.classId ?? `class-${index}`,
    classId: record?.class_id ?? record?.id ?? record?.classId ?? null,
    className: String(record?.class_name ?? record?.className ?? '').trim(),
    totalStudents: Number(record?.total_students ?? record?.totalStudents ?? 0) || 0,
    sections,
    raw: record ?? {},
  }
}

function getClassTeacherLabel(sections = []) {
  const teachers = [...new Set(sections.map((section) => section.classTeacher).filter(Boolean))]
  return teachers.length ? teachers.join(', ') : 'Not assigned'
}

export function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [selectedSections, setSelectedSections] = useState({})
  const [classFilter, setClassFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingClass, setEditingClass] = useState(null)
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
    defaultValues: {
      className: '',
      section: 'A',
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
      const response = await api.get(CLASS_COUNT_API)
      // const response = {
      //   "status": "success",
      //   "message": "Student count fetched successfully",
      //   "data": [
      //     {
      //       "class_id": 48,
      //       "class_name": "class 12",
      //       "total_students": 2,
      //       "sections": [
      //         {
      //           "section_id": 32,
      //           "section_name": "Section A",
      //           "class_teacher": "Test",
      //           "class_teacher_id": 1,
      //           "students_count": 1
      //         },
      //         {
      //           "section_id": 33,
      //           "section_name": "Section B",
      //           "class_teacher": "Test 2",
      //           "class_teacher_id": 2,
      //           "students_count": 1
      //         }
      //       ]
      //     },
      //     {
      //       "class_id": 49,
      //       "class_name": "class 9",
      //       "total_students": 10,
      //       "sections": [
      //         {
      //           "section_id": 33,
      //           "section_name": "A",
      //           "class_teacher": "Test 3",
      //           "class_teacher_id": 3,
      //           "students_count": 10
      //         }
      //       ]
      //     }
      //   ]
      // }
      const nextClasses = (response.data?.data ?? []).map(normalizeClass)

      if (!isMountedRef.current) return

      setClasses(nextClasses)
      setSelectedSections((current) => {
        const nextSelections = { ...current }

        nextClasses.forEach((item) => {
          if (nextSelections[item.id] == null) {
            nextSelections[item.id] = 'All'
          }
        })

        return nextSelections
      })
    } catch (fetchError) {
      if (!isMountedRef.current) return

      setError(fetchError?.response?.data?.message || 'Failed to load classes. Please try again.')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const openCreateModal = () => {
    setEditingClass(null)
    clearErrors()
    reset({
      className: '',
      section: 'A',
    })
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingClass(row)
    clearErrors()
    reset({
      className: row.className,
      section: row.selectedSection === 'All' ? row.availableSections.find((section) => section !== 'All') ?? 'A' : row.selectedSection,
    })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    setSaving(true)
    setError('')

    try {
      await api.post(CREATE_CLASS_API, {
        organization_id: DEFAULT_ORGANIZATION_ID,
        class_name: values.className.trim(),
        section_name: values.section,
      })

      notify('success', 'Saved successfully')
      setModalOpen(false)
      setEditingClass(null)
      reset({
        className: '',
        section: 'A',
      })
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
      await api.put(UPDATE_CLASS_API(editingClass.classId), {
        class_name: values.className.trim(),
        section_name: values.section,
      })

      notify('success', 'Saved successfully')
      setModalOpen(false)
      setEditingClass(null)
      reset({
        className: '',
        section: 'A',
      })
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

  useEffect(() => {
    isMountedRef.current = true
    fetchClasses()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchClasses])

  const classNames = useMemo(() => {
    return [...new Set(classes.map((item) => item.className))].sort((left, right) => left.localeCompare(right))
  }, [classes])

  const totalStudents = useMemo(() => classes.reduce((sum, item) => sum + item.totalStudents, 0), [classes])

  const rows = useMemo(() => {
    return classes
      .map((item) => {
        const selectedSection = selectedSections[item.id] ?? 'All'
        const sectionDetails = item.sections?.find((section) => section.sectionName === normalizeSectionName(selectedSection))
        const studentCount = selectedSection === 'All' ? item.totalStudents : sectionDetails?.studentsCount ?? 0
        const availableSections = ['All', ...(item.sections ?? []).map((section) => section.sectionName).filter(Boolean)]

        return {
          id: item.id,
          classId: item.classId,
          className: item.className,
          classTeacher: getClassTeacherLabel(item.sections),
          studentCount,
          availableSections,
          selectedSection,
        }
      })
      .filter((item) => classFilter === 'All' || item.className === classFilter)
      .sort((left, right) => left.className.localeCompare(right.className))
  }, [classFilter, classes, selectedSections])

  const columns = useMemo(
    () => [
      { key: 'className', label: 'Class Name' },
      { key: 'classTeacher', label: 'Class Teacher' },
      { key: 'studentCount', label: 'Students Count' },
      {
        key: 'selectedSection',
        label: 'Section',
        render: (row) => (
          <Select
            value={row.selectedSection}
            onChange={(event) =>
              setSelectedSections((current) => ({
                ...current,
                [row.id]: event.target.value,
              }))
            }
            className="min-w-[132px]"
          >
            {row.availableSections.map((section) => (
              <option key={section} value={section}>
                {section === 'All' ? 'All Sections' : `Section ${section}`}
              </option>
            ))}
          </Select>
        ),
      },
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
              View each class, its teachers, sections, and live student counts from the backend.
            </p>
          </div>
          <Button variant="brand" onClick={openCreateModal}>
            <Plus size={18} />
            Add Class
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px_auto]">
          <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} label="Filter By Class">
            <option value="All">All Classes</option>
            {classNames.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </Select>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Total students</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{totalStudents}</p>
            </div>
          </div>
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
        onClose={() => {
          setModalOpen(false)
          setEditingClass(null)
        }}
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
            {...register('className', {
              required: 'Class name is required',
              validate: (value) => value.trim().length > 0 || 'Class name is required',
            })}
          />
          <Select label="Section" error={errors.section?.message} {...register('section', { required: 'Section is required' })}>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditingClass(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={saving}>
              {saving ? 'Saving...' : 'Save Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
