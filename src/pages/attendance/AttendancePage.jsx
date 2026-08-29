import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Edit3, GraduationCap, UserSquare2, X } from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
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

function extractLeaveDetailsResponse(response) {
  const data = response?.data?.data ?? response?.data ?? response ?? {}
  return {
    students: Array.isArray(data.students) ? data.students : [],
    teachers: Array.isArray(data.teachers) ? data.teachers : [],
  }
}

function normalizeLeaveStatus(status) {
  const normalized = normalizeComparable(status)

  if (normalized.includes('approve')) {
    return 'APPROVED'
  }

  if (normalized.includes('reject')) {
    return 'REJECTED'
  }

  if (normalized.includes('pending')) {
    return 'PENDING'
  }

  return String(status ?? '').trim().toUpperCase()
}

function getLeaveStatusTone(status) {
  const normalized = normalizeComparable(status)

  if (!normalized) {
    return 'neutral'
  }

  if (normalized.includes('pending')) {
    return 'warning'
  }

  if (normalized.includes('approve')) {
    return 'success'
  }

  if (normalized.includes('reject')) {
    return 'danger'
  }

  return 'info'
}

function formatStatusLabel(status) {
  const normalized = String(status ?? '').trim()
  if (!normalized) {
    return '-'
  }

  return normalized
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
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
    leave_id: record?.leave_id ?? record?.leaveId ?? null,
    leave_type: String(readFirstValue(record, ['leave_type', 'leaveType'])).trim(),
    from_date: String(readFirstValue(record, ['from_date', 'fromDate'])).trim(),
    to_date: String(readFirstValue(record, ['to_date', 'toDate'])).trim(),
    start_session: String(readFirstValue(record, ['start_session', 'startSession'])).trim(),
    end_session: String(readFirstValue(record, ['end_session', 'endSession'])).trim(),
    leave_status: String(readFirstValue(record, ['leave_status', 'leaveStatus', 'status'])).trim(),
    reason: String(readFirstValue(record, ['reason', 'remarks', 'comment'])).trim(),
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
    leave_id: record?.leave_id ?? record?.leaveId ?? null,
    leave_type: String(readFirstValue(record, ['leave_type', 'leaveType'])).trim(),
    from_date: String(readFirstValue(record, ['from_date', 'fromDate'])).trim(),
    to_date: String(readFirstValue(record, ['to_date', 'toDate'])).trim(),
    start_session: String(readFirstValue(record, ['start_session', 'startSession'])).trim(),
    end_session: String(readFirstValue(record, ['end_session', 'endSession'])).trim(),
    leave_status: String(readFirstValue(record, ['leave_status', 'leaveStatus', 'status'])).trim(),
    reason: String(readFirstValue(record, ['reason', 'remarks', 'comment'])).trim(),
  }
}

function extractStudentLeaveRows(groups) {
  if (!Array.isArray(groups)) {
    return []
  }

  return groups.flatMap((group) => {
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
  })
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
  const { user } = useAuth()
  const students = useAppStore((state) => state.students)
  const teachers = useAppStore((state) => state.teachers)

  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate())
  const [catalog, setCatalog] = useState([])
  const [classFilter, setClassFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [teachersOnLeave, setTeachersOnLeave] = useState([])
  const [studentsOnLeave, setStudentsOnLeave] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [leaveError, setLeaveError] = useState('')
  const [notification, setNotification] = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionLeave, setActionLeave] = useState(null)
  const [actionReason, setActionReason] = useState('')
  const [updatingLeaveId, setUpdatingLeaveId] = useState('')

  const organizationId = useMemo(() => getOrganizationId(), [])
  const loggedInUserId = useMemo(() => resolveUserId(user), [user])

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
      setLeaveError('Organization id is required to load student leave filters.')
      setCatalogLoading(false)
      return
    }

    setCatalogLoading(true)
    setLeaveError('')

    try {
      const rows = await fetchClassSectionCatalog(organizationId)
      setCatalog(rows)
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load student leave filters'
      setLeaveError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setCatalogLoading(false)
    }
  }, [notify, organizationId])

  const fetchLeaveDetails = useCallback(async () => {
    if (!organizationId) {
      setTeachersOnLeave([])
      setStudentsOnLeave([])
      setLeaveError('Organization id is required to load leave details.')
      setLeaveLoading(false)
      return
    }

    setLeaveLoading(true)
    setLeaveError('')

    try {
      const response = await api.post('/students/getLeaveDetails', {
        organization_id: organizationId,
        leave_date: selectedDate,
      })

      const { students, teachers } = extractLeaveDetailsResponse(response)
      const teacherRows = teachers.map((record, index) => normalizeTeacherLeave(record, index))
      const studentRows = extractStudentLeaveRows(students).map((record, index) => normalizeStudentLeave(record, index))

      setTeachersOnLeave(teacherRows)
      setStudentsOnLeave(studentRows)
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load leave details'
      setLeaveError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setLeaveLoading(false)
    }
  }, [notify, organizationId, selectedDate])

  const openActionModal = useCallback((leave) => {
    setActionLeave(leave)
    setActionReason('')
    setActionModalOpen(true)
  }, [])

  const closeActionModal = useCallback(() => {
    setActionModalOpen(false)
    setActionLeave(null)
    setActionReason('')
  }, [])

  const updateLeaveStatus = useCallback(
    async (leave, status, remarks) => {
      const leaveId = leave?.leave_id ?? leave?.leaveId ?? leave?.id

      if (!leaveId) {
        notify('error', 'Unable to update this leave request.')
        return
      }

      if (!loggedInUserId) {
        notify('error', 'Unable to determine the logged-in user.')
        return
      }

      setUpdatingLeaveId(leaveId)

      try {
        const response = await api.put('/leaves/ApproveLeave', {
          leave_id: leaveId,
          approved_by_teacher_id: loggedInUserId,
          approved_by_user_id: loggedInUserId,
          status,
          remarks: remarks?.trim() || '',
        })

        notify('success', response?.data?.message || `Leave ${status.toLowerCase()} successfully`)
        closeActionModal()
        await fetchLeaveDetails()
      } catch (requestError) {
        const backendMessage =
          requestError?.response?.data?.message || requestError?.message || 'Failed to update leave status'
        notify('error', backendMessage)
      } finally {
        setUpdatingLeaveId('')
      }
    },
    [closeActionModal, fetchLeaveDetails, loggedInUserId, notify],
  )

  const submitLeaveAction = useCallback(
    (status) => {
      if (!actionLeave) {
        notify('error', 'No leave request selected.')
        return
      }

      if (!actionReason.trim()) {
        notify('error', 'Please enter a reason before continuing.')
        return
      }

      updateLeaveStatus(actionLeave, status, actionReason)
    },
    [actionLeave, actionReason, notify, updateLeaveStatus],
  )

  useEffect(() => {
    fetchLeaveDetails()
    fetchCatalog()
  }, [fetchCatalog, fetchLeaveDetails])

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
      { key: 'teacher_id', label: 'ID' },
      {
        key: 'teacher_name',
        label: 'Name',
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.teacher_name || 'Unnamed teacher'}</p>
          </div>
        ),
      },
      // { key: 'from_date', label: 'Start Date' },
      // { key: 'start_session', label: 'Start Date' },
      // { key: 'to_date', label: 'End Date' },
      // { key: 'end_session', label: 'End Date' },
      // {
      //   key: 'status',
      //   label: 'Status',
      //   render: (row) => <Badge tone="warning">{row.leave_status}</Badge>,
      // },
      { key: 'from_date', label: 'Start Date' },
      { key: 'start_session', label: 'Session' },
      { key: 'to_date', label: 'End Date' },
      { key: 'end_session', label: 'Session' },
      { key: 'reason', label: 'Reason' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          const status = normalizeLeaveStatus(row.leave_status || row.status || 'PENDING')
          const isPending = status === 'PENDING'

          return (
            <div className="flex flex-col gap-2">
              <Badge tone={getLeaveStatusTone(status)}>{formatStatusLabel(status)}</Badge>
              {isPending ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => openActionModal(row)}
                  disabled={updatingLeaveId === row.leave_id}
                  className="w-fit"
                >
                  <Edit3 size={14} />
                  Edit
                </Button>
              ) : null}
            </div>
          )
        },
      }
    ],
    [openActionModal, updatingLeaveId],
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
      { key: 'admission_no', label: 'Adm.No' },
      { key: 'roll_number', label: 'Ro.No' },
      { key: 'from_date', label: 'Start Date' },
      { key: 'start_session', label: 'Session' },
      { key: 'to_date', label: 'End Date' },
      { key: 'end_session', label: 'Session' },
      { key: 'reason', label: 'Reason' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => {
          const status = normalizeLeaveStatus(row.leave_status || row.status || 'PENDING')
          const isPending = status === 'PENDING'

          return (
            <div className="flex flex-col gap-2">
              <Badge tone={getLeaveStatusTone(status)}>{formatStatusLabel(status)}</Badge>
              {isPending ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => openActionModal(row)}
                  disabled={updatingLeaveId === row.leave_id}
                  className="w-fit"
                >
                  <Edit3 size={14} />
                  Edit
                </Button>
              ) : null}
            </div>
          )
        },
      }
    ],
    [openActionModal, updatingLeaveId],
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

  const isStudentSectionLoading = catalogLoading || leaveLoading

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
            loading={leaveLoading}
            error={leaveError}
            emptyTitle="No teachers on leave"
            emptyDescription={`No teachers are on leave for ${selectedDate}.`}
            retryLabel="Retry"
            onRetry={fetchLeaveDetails}
          />

          <LeaveSection
            title="Students On Leave"
            subtitle={null}
            icon={GraduationCap}
            rows={filteredStudentsOnLeave}
            columns={studentColumns}
            counts={{ present: studentPresentCount, leave: studentLeaveCount }}
            loading={isStudentSectionLoading}
            error={leaveError}
            emptyTitle="No students on leave"
            emptyDescription="No student leave records were returned for the selected filters."
            retryLabel="Retry"
            onRetry={catalog.length ? fetchLeaveDetails : fetchCatalog}
            controls={studentControls}
          />
        </div>
      </Card>

      <Modal
        open={actionModalOpen}
        onClose={closeActionModal}
        title="Review Pending Leave"
        description="Add a reason, then choose whether to approve or reject the leave request."
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-white">
              {actionLeave?.student_name || actionLeave?.teacher_name || 'Selected leave'}
            </p>
            <p className="mt-1">
              Pending leave from {actionLeave?.from_date || '-'} to {actionLeave?.to_date || '-'}
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Reason</span>
            <textarea
              value={actionReason}
              onChange={(event) => setActionReason(event.target.value)}
              rows={4}
              placeholder="Enter the reason for this action"
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-brand-500/20"
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeActionModal}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => submitLeaveAction('REJECTED')}
              disabled={updatingLeaveId === (actionLeave?.leave_id ?? actionLeave?.leaveId ?? actionLeave?.id)}
            >
              <X size={16} />
              {updatingLeaveId === (actionLeave?.leave_id ?? actionLeave?.leaveId ?? actionLeave?.id)
                ? 'Saving...'
                : 'Reject Leave'}
            </Button>
            <Button
              type="button"
              variant="brand"
              onClick={() => submitLeaveAction('APPROVED')}
              disabled={updatingLeaveId === (actionLeave?.leave_id ?? actionLeave?.leaveId ?? actionLeave?.id)}
            >
              <Check size={16} />
              {updatingLeaveId === (actionLeave?.leave_id ?? actionLeave?.leaveId ?? actionLeave?.id)
                ? 'Saving...'
                : 'Approve Leave'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
