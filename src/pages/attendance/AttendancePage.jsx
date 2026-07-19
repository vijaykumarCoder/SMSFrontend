import { useCallback, useEffect, useMemo, useState } from 'react'
import { GraduationCap, UserSquare2 } from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useAppStore } from '../../store/appStore'
import api from '../../utils/api'
import { fetchClassSectionCatalog, getOrganizationId } from '../../utils/classSections'

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
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

function extractArray(response) {
  const candidates = [response?.data?.data, response?.data, response]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeComparable(value) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeTeacherLeave(record, index = 0) {
  const teacherId = record?.teacher_id ?? record?.id ?? record?.teacherId ?? `teacher-${index}`

  return {
    id: teacherId,
    teacher_id: teacherId,
    teacher_name: String(readFirstValue(record, ['teacher_name', 'teacherName', 'name'])).trim(),
    employee_id: String(readFirstValue(record, ['employee_id', 'employeeId'])).trim(),
  }
}

function normalizeStudentLeave(record, index = 0) {
  const studentId = record?.student_id ?? record?.id ?? record?.studentId ?? `student-${index}`

  return {
    id: studentId,
    student_id: studentId,
    admission_no: String(readFirstValue(record, ['admission_no', 'admissionNo'])).trim(),
    student_name: String(readFirstValue(record, ['student_name', 'studentName', 'name'])).trim(),
    roll_number: String(readFirstValue(record, ['roll_number', 'rollNumber', 'roll_no'])).trim(),
    className: String(readFirstValue(record, ['class_name', 'className'])).trim(),
    section: String(readFirstValue(record, ['section_name', 'sectionName', 'section'])).trim(),
  }
}

function extractStudentLeaveRows(response) {
  const roots = [response?.data?.data, response?.data, response]

  const flattenGroup = (group) => {
    if (!group || typeof group !== 'object') {
      return []
    }

    const className = String(group.class_name ?? group.className ?? '').trim()
    const classSections = Array.isArray(group.sections) ? group.sections : []

    if (classSections.length) {
      return classSections.flatMap((section) => {
        const sectionName = String(section.section_name ?? section.sectionName ?? section.section ?? '').trim()
        const sectionStudents = Array.isArray(section.students) ? section.students : []

        return sectionStudents.map((student, index) => ({
          ...student,
          ...normalizeStudentLeave(student, index),
          class_name: String(readFirstValue(student, ['class_name', 'className'])) || className,
          className: String(readFirstValue(student, ['class_name', 'className'])) || className,
          section_name: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
          sectionName: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
          section: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
        }))
      })
    }

    if (Array.isArray(group.students)) {
      const sectionName = String(group.section_name ?? group.sectionName ?? group.section ?? '').trim()

      return group.students.map((student, index) => ({
        ...student,
        ...normalizeStudentLeave(student, index),
        class_name: String(readFirstValue(student, ['class_name', 'className'])) || className,
        className: String(readFirstValue(student, ['class_name', 'className'])) || className,
        section_name: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
        sectionName: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
        section: String(readFirstValue(student, ['section_name', 'sectionName', 'section'])) || sectionName,
      }))
    }

    return []
  }

  for (const root of roots) {
    if (Array.isArray(root)) {
      if (root.some((item) => Array.isArray(item?.sections) || Array.isArray(item?.students))) {
        return root.flatMap(flattenGroup)
      }

      return root
    }

    if (root && typeof root === 'object') {
      if (Array.isArray(root.sections) || Array.isArray(root.students)) {
        return flattenGroup(root)
      }
    }
  }

  return []
}

function CountLine({ present, leave }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
      <span>
        Present : <span className="text-slate-900 dark:text-white">{present}</span>
      </span>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <span>
        Leave : <span className="text-slate-900 dark:text-white">{leave}</span>
      </span>
    </div>
  )
}

function LeaveSection({
  title,
  subtitle,
  icon,
  rows,
  columns,
  counts,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  retryLabel,
  onRetry,
  controls,
}) {
  const SectionIcon = icon

  return (
    <section className="w-full rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <SectionIcon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="section-title">{title}</h3>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
      </div>

      {controls ? <div className="mt-4 grid gap-3 md:grid-cols-2">{controls}</div> : null}
      <div className="mt-4">
        <CountLine present={counts.present} leave={counts.leave} />
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="rounded-[22px] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Loading records...
          </div>
        ) : error ? (
          <EmptyState
            title={emptyTitle}
            description={error}
            action={
              <Button variant="brand" onClick={onRetry}>
                {retryLabel}
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            rows={rows}
            emptyState={<EmptyState title={emptyTitle} description={emptyDescription} />}
          />
        )}
      </div>
    </section>
  )
}

export function AttendancePage() {
  const students = useAppStore((state) => state.students)
  const teachers = useAppStore((state) => state.teachers)

  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate())
  const [catalog, setCatalog] = useState([])
  const [classFilter, setClassFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [teachersOnLeave, setTeachersOnLeave] = useState([])
  const [studentsOnLeave, setStudentsOnLeave] = useState([])
  const [teacherLoading, setTeacherLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [studentLoading, setStudentLoading] = useState(true)
  const [teacherError, setTeacherError] = useState('')
  const [studentError, setStudentError] = useState('')
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

  const fetchCatalog = useCallback(async () => {
    if (!organizationId) {
      setCatalog([])
      setStudentError('Organization id is required to load student leave filters.')
      setCatalogLoading(false)
      return
    }

    setCatalogLoading(true)
    setStudentError('')

    try {
      const rows = await fetchClassSectionCatalog(organizationId)
      setCatalog(rows)
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load student leave filters'
      setStudentError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setCatalogLoading(false)
    }
  }, [notify, organizationId])

  const fetchTeachersOnLeave = useCallback(async () => {
    if (!organizationId) {
      setTeachersOnLeave([])
      setTeacherError('Organization id is required to load teachers on leave.')
      setTeacherLoading(false)
      return
    }

    setTeacherLoading(true)
    setTeacherError('')

    try {
      // const response = await api.get(`/attendance/teachers/${organizationId}`)
      const response = {
        "status": "success",
        "message": "Teachers on leave fetched successfully",
        "data": [
          {
            "teacher_id": 1,
            "employee_id": "EMP001",
            "teacher_name": "James Hall"
          },
          {
            "teacher_id": 2,
            "employee_id": "EMP002",
            "teacher_name": "Emma Wright"
          }
          // },
          // {
          //   "teacher_id": 3,
          //   "employee_id": "EMP003",
          //   "teacher_name": "Wick"
          // },
          // {
          //   "teacher_id": 4,
          //   "employee_id": "EMP004",
          //   "teacher_name": "Jhon"
          // }
        ]
      }
      const rows = extractArray(response).map((record, index) => normalizeTeacherLeave(record, index))
      setTeachersOnLeave(rows)
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load teachers on leave'
      setTeacherError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setTeacherLoading(false)
    }
  }, [notify, organizationId])

  const fetchStudentsOnLeave = useCallback(async () => {
    if (!organizationId) {
      setStudentsOnLeave([])
      setStudentError('Organization id is required to load student leave records.')
      setStudentLoading(false)
      return
    }

    setStudentLoading(true)
    setStudentError('')

    try {
      const response = await api.get(
        `/students/getStudentOnLeave/${organizationId}`,
      )

      const rows = extractStudentLeaveRows(response).map((record, index) => normalizeStudentLeave(record, index))
      setStudentsOnLeave(rows)
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load students on leave'
      setStudentError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setStudentLoading(false)
    }
  }, [notify, organizationId])

  useEffect(() => {
    fetchTeachersOnLeave()
    fetchCatalog()
    fetchStudentsOnLeave()
  }, [fetchCatalog, fetchStudentsOnLeave, fetchTeachersOnLeave])

  useEffect(() => {
    if (classFilter === 'All') {
      return
    }

    const selectedClass = catalog.find((item) => normalizeComparable(item.className) === normalizeComparable(classFilter))
    const availableSections = selectedClass?.sections ?? []
    const sectionExists = availableSections.some(
      (section) => normalizeComparable(section.sectionName) === normalizeComparable(sectionFilter),
    )

    if (!sectionExists) {
      setSectionFilter('All')
    }
  }, [catalog, classFilter, sectionFilter])

  const selectedClass = useMemo(
    () => catalog.find((item) => normalizeComparable(item.className) === normalizeComparable(classFilter)) ?? null,
    [catalog, classFilter],
  )

  const classOptions = useMemo(() => {
    return ['All', ...new Set(catalog.map((item) => item.className).filter(Boolean))].sort((left, right) => {
      if (left === 'All') return -1
      if (right === 'All') return 1
      return left.localeCompare(right)
    })
  }, [catalog])

  const sectionOptions = useMemo(() => {
    if (classFilter !== 'All') {
      const selectedClassItem = catalog.find((item) => normalizeComparable(item.className) === normalizeComparable(classFilter))
      const sections = selectedClassItem?.sections ?? []
      return ['All', ...sections.map((section) => section.sectionName).filter(Boolean)]
    }

    const sections = catalog.flatMap((item) => item.sections ?? [])
    const uniqueSections = [...new Set(sections.map((section) => section.sectionName).filter(Boolean))].sort((left, right) =>
      left.localeCompare(right),
    )

    return ['All', ...uniqueSections]
  }, [catalog, classFilter])

  const teacherColumns = useMemo(
    () => [
      {
        key: 'teacher_name',
        label: 'Name',
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.teacher_name || 'Unnamed teacher'}</p>
          </div>
        ),
      },
      { key: 'employee_id', label: 'Employee ID' },
      {
        key: 'status',
        label: 'Status',
        render: () => <Badge tone="warning">On Leave</Badge>,
      },
    ],
    [],
  )

  const studentColumns = useMemo(
    () => [
      {
        key: 'student_name',
        label: 'Name',
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.student_name || 'Unnamed student'}</p>
          </div>
        ),
      },
      { key: 'admission_no', label: 'Admission No' },
      { key: 'roll_number', label: 'Roll Number' },
      {
        key: 'status',
        label: 'Status',
        render: () => <Badge tone="warning">On Leave</Badge>,
      },
    ],
    [],
  )

  const teacherTotalCount = teachers.length
  const teacherLeaveCount = teachersOnLeave.length
  const teacherPresentCount = Math.max(teacherTotalCount - teacherLeaveCount, 0)

  const selectedClassName = classFilter === 'All' ? '' : selectedClass?.className ?? ''
  const selectedSectionName = sectionFilter === 'All' ? '' : sectionFilter
  const selectedStudents = students.filter((student) => {
    const classMatches = !selectedClassName || normalizeComparable(student.className) === normalizeComparable(selectedClassName)
    const sectionMatches = !selectedSectionName || normalizeComparable(student.section) === normalizeComparable(selectedSectionName)
    return classMatches && sectionMatches
  })

  const filteredStudentsOnLeave = useMemo(() => {
    return studentsOnLeave.filter((student) => {
      const classMatches =
        classFilter === 'All' || normalizeComparable(student.className) === normalizeComparable(classFilter)
      const sectionMatches =
        sectionFilter === 'All' || normalizeComparable(student.section) === normalizeComparable(sectionFilter)

      return classMatches && sectionMatches
    })
  }, [classFilter, sectionFilter, studentsOnLeave])

  const studentLeaveCount = filteredStudentsOnLeave.length
  const studentPresentCount = Math.max(selectedStudents.length - studentLeaveCount, 0)

  const studentControls = (
    <>
      <Select
        label="Class"
        value={classFilter}
        onChange={(event) => {
          setClassFilter(event.target.value)
          setSectionFilter('All')
        }}
        disabled={!catalog.length}
      >
        {classOptions.map((className) => (
          <option key={className} value={className}>
            {className === 'All' ? 'All Classes' : className}
          </option>
        ))}
      </Select>
      <Select
        label="Section"
        value={sectionFilter}
        onChange={(event) => setSectionFilter(event.target.value)}
        disabled={!sectionOptions.length}
      >
        {sectionOptions.map((sectionName) => (
          <option key={sectionName} value={sectionName}>
            {sectionName === 'All' ? 'All Sections' : sectionName}
          </option>
        ))}
      </Select>
    </>
  )

  const isStudentSectionLoading = catalogLoading || studentLoading

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
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review teachers on leave and student leave records from the backend.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Input
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="sm:w-56"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <LeaveSection
            title="Teachers On Leave"
            subtitle={`School-wide records for ${selectedDate}`}
            icon={UserSquare2}
            rows={teachersOnLeave}
            columns={teacherColumns}
            counts={{ present: teacherPresentCount, leave: teacherLeaveCount }}
            loading={teacherLoading}
            error={teacherError}
            emptyTitle="No teachers on leave"
            emptyDescription={`No teachers are on leave for ${selectedDate}.`}
            retryLabel="Retry"
            onRetry={fetchTeachersOnLeave}
          />

          <LeaveSection
            title="Students On Leave"
            subtitle={null}
            icon={GraduationCap}
            rows={filteredStudentsOnLeave}
            columns={studentColumns}
            counts={{ present: studentPresentCount, leave: studentLeaveCount }}
            loading={isStudentSectionLoading}
            error={studentError}
            emptyTitle="No students on leave"
            emptyDescription="No student leave records were returned for the selected filters."
            retryLabel="Retry"
            onRetry={catalog.length ? fetchStudentsOnLeave : fetchCatalog}
            controls={studentControls}
          />
        </div>
      </Card>
    </div>
  )
}
