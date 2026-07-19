import { Eye, Search, SquarePen, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import api from '../../utils/api'
import { fetchClassSectionCatalog, getOrganizationId } from '../../utils/classSections'

const GET_STUDENTS_API = (organizationId) => `/students/getAllEnrolledStudents/${organizationId}`
const DELETE_STUDENT_API = (studentEnrollId) => `/students/deleteEnrolledStudent/${studentEnrollId}`

function normalizeComparable(value) {
  return String(value ?? '').trim().toLowerCase()
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

function normalizeStudent(record, index = 0) {
  const studentEnrollId =
    record?.student_enroll_id ??
    record?.studentEnrollId ??
    record?.student_enrollId ??
    record?.enroll_id ??
    record?.id ??
    record?._id ??
    `student-${index}`

  return {
    id: studentEnrollId,
    student_enroll_id: studentEnrollId,
    name: String(readFirstValue(record, ['student_name', 'studentName', 'name', 'full_name'])).trim(),
    className: String(readFirstValue(record, ['class_name', 'className', 'class'])).trim(),
    section: String(readFirstValue(record, ['section', 'section_name', 'sectionName'])).trim(),
    contact: String(readFirstValue(record, ['contact', 'phone_number', 'phoneNumber', 'guardian_phone'])).trim(),
    status: String(readFirstValue(record, ['status'])).trim(),
    raw: record ?? {},
  }
}

function extractStudentRows(response) {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.students,
    response?.data?.results,
    response?.students,
    response?.results,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function getStatusTone(status) {
  const normalizedStatus = String(status ?? '').trim().toLowerCase()

  if (!normalizedStatus) {
    return 'neutral'
  }

  if (normalizedStatus.includes('active')) {
    return 'success'
  }

  if (normalizedStatus.includes('leave')) {
    return 'warning'
  }

  if (normalizedStatus.includes('probation') || normalizedStatus.includes('inactive')) {
    return 'danger'
  }

  return 'info'
}

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{row.name || 'Unnamed student'}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Enrolled ID: {row.student_enroll_id}</p>
      </div>
    ),
  },
  { key: 'className', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'contact', label: 'Contact' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge tone={getStatusTone(row.status)}>{row.status || 'Unknown'}</Badge>,
  },
]

export function StudentsPage() {
  const [students, setStudents] = useState([])
  const [catalog, setCatalog] = useState([])
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [notification, setNotification] = useState(null)

  const organizationId = useMemo(() => getOrganizationId(), [])

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

  const fetchStudents = useCallback(async () => {
    if (!organizationId) {
      setStudents([])
      setError('Organization id is required to load students')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.get(GET_STUDENTS_API(organizationId))

      if (response?.data?.status === 'error' || response?.status === 'error') {
        throw new Error(response?.data?.message || response?.message || 'Failed to load students')
      }

      const rows = extractStudentRows(response).map((record, index) => normalizeStudent(record, index))
      setStudents(rows)
    } catch (requestError) {
      const backendMessage = requestError?.response?.data?.message || requestError?.message || 'Failed to load students'
      setError(backendMessage)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const fetchCatalog = useCallback(async () => {
    if (!organizationId) {
      setCatalog([])
      setCatalogLoading(false)
      return
    }

    setCatalogLoading(true)

    try {
      const rows = await fetchClassSectionCatalog(organizationId)
      setCatalog(rows)
    } catch {
      setCatalog([])
    } finally {
      setCatalogLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchStudents()
    fetchCatalog()
  }, [fetchCatalog, fetchStudents])

  useEffect(() => {
    if (classFilter === 'All') {
      return
    }

    const selectedClass = catalog.find((item) => normalizeComparable(item.className) === normalizeComparable(classFilter))
    const availableSections = selectedClass?.sections ?? []
    const sectionExists = availableSections.some((section) => normalizeComparable(section.sectionName) === normalizeComparable(sectionFilter))

    if (!sectionExists) {
      setSectionFilter('All')
    }
  }, [catalog, classFilter, sectionFilter])

  const classOptions = useMemo(() => {
    return ['All', ...new Set(catalog.map((item) => item.className).filter(Boolean))].sort((left, right) => {
      if (left === 'All') return -1
      if (right === 'All') return 1
      return left.localeCompare(right)
    })
  }, [catalog])

  const sectionOptions = useMemo(() => {
    if (classFilter !== 'All') {
      const selectedClass = catalog.find((item) => normalizeComparable(item.className) === normalizeComparable(classFilter))
      const sections = selectedClass?.sections ?? []
      return ['All', ...sections.map((section) => section.sectionName).filter(Boolean)]
    }

    const sections = catalog.flatMap((item) => item.sections ?? [])
    const uniqueSections = [...new Set(sections.map((section) => section.sectionName).filter(Boolean))].sort((left, right) =>
      left.localeCompare(right),
    )

    return ['All', ...uniqueSections]
  }, [catalog, classFilter])

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return students.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        [student.name, student.className, student.section, student.contact, student.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))

      const matchesClass = classFilter === 'All' || normalizeComparable(student.className) === normalizeComparable(classFilter)
      const matchesSection =
        sectionFilter === 'All' || normalizeComparable(student.section) === normalizeComparable(sectionFilter)

      return matchesQuery && matchesClass && matchesSection
    })
  }, [classFilter, query, sectionFilter, students])

  const handleDelete = async (student) => {
    const studentEnrollId = student.student_enroll_id ?? student.id

    if (!studentEnrollId) {
      notify('error', 'Unable to delete this student')
      return
    }

    const confirmed = window.confirm(`Delete ${student.name || 'this student'}?`)
    if (!confirmed) {
      return
    }

    setDeletingId(studentEnrollId)
    setError('')

    try {
      await api.delete(DELETE_STUDENT_API(studentEnrollId))
      notify('success', 'Student deleted successfully')
      await fetchStudents()
    } catch (requestError) {
      const backendMessage = requestError?.response?.data?.message || requestError?.message || 'Failed to delete student'
      setError(backendMessage)
      notify('error', backendMessage)
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Students</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Enrolled students</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              View the live enrolled student list and filter by class and section.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by student name, class, section, contact, or status"
            icon={Search}
          />
          <Select
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value)
              setSectionFilter('All')
            }}
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className === 'All' ? 'All Classes' : className}
              </option>
            ))}
          </Select>
          <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} disabled={catalogLoading && !catalog.length}>
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
              Loading students...
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load students"
              description={error}
              action={
                <Button variant="brand" onClick={fetchStudents}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={filteredStudents}
              emptyState={
                <EmptyState
                  title="No students found"
                  description="Try adjusting the search, class filter, or section filter."
                />
              }
              renderRowActions={(row) => (
                <div className="flex items-center gap-2">
                  {[Eye, SquarePen].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                      aria-label={`${Icon === Eye ? 'View' : 'Edit'} ${row.name || 'student'}`}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.student_enroll_id}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                    aria-label={`Delete ${row.name || 'student'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
