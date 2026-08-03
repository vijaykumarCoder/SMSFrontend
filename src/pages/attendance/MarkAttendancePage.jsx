import { Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import api from '../../utils/api'
import { fetchClassSectionCatalog, getOrganizationId } from '../../utils/classSections'

function formatToday() {
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

function normalizeAttendanceRow(record, index = 0) {
  const studentEnrollId =
    record?.student_enroll_id ??
    record?.studentEnrollId ??
    record?.student_enrollId ??
    record?.enroll_id ??
    record?.id ??
    record?._id ??
    `attendance-${index}`

  return {
    id: studentEnrollId,
    student_enroll_id: studentEnrollId,
    name: String(readFirstValue(record, ['student_name', 'studentName', 'name', 'full_name'])).trim(),
    className: String(readFirstValue(record, ['class_name', 'className', 'class'])).trim(),
    section: String(readFirstValue(record, ['section_name', 'sectionName', 'section'])).trim(),
    attendanceDate: record?.attendance_date ?? record?.attendanceDate ?? null,
    status: String(readFirstValue(record, ['status'])).trim().toLowerCase(),
    raw: record ?? {},
  }
}

function extractAttendanceRows(response) {
  const candidates = [response, response?.data, response?.data?.data, response?.data?.results, response?.results]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

export function MarkAttendancePage() {
  const [rows, setRows] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [selectedDate, setSelectedDate] = useState(formatToday())
  const [catalog, setCatalog] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
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
      setError('Organization id is required to load attendance filters.')
      setLoadingCatalog(false)
      return
    }

    setLoadingCatalog(true)
    setError('')

    try {
      const rows = await fetchClassSectionCatalog(organizationId)
      setCatalog(rows)

      const firstClass = rows[0]
      const firstSection = firstClass?.sections?.[0]

      setSelectedClassId((current) => current || String(firstClass?.classId ?? ''))
      setSelectedSectionId((current) => current || String(firstSection?.sectionId ?? ''))
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load attendance filters'
      setError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setLoadingCatalog(false)
    }
  }, [notify, organizationId])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    if (!catalog.length || !selectedClassId) {
      return
    }

    const selectedClass = catalog.find((item) => String(item.classId) === String(selectedClassId))
    const sectionOptions = selectedClass?.sections ?? []

    if (!sectionOptions.length) {
      setSelectedSectionId('')
      return
    }

    const sectionExists = sectionOptions.some((section) => String(section.sectionId) === String(selectedSectionId))

    if (!sectionExists) {
      setSelectedSectionId(String(sectionOptions[0].sectionId))
    }
  }, [catalog, selectedClassId, selectedSectionId])

  const fetchAttendance = useCallback(async () => {
    if (!organizationId) {
      setRows([])
      setError('Organization id is required to load attendance records.')
      setLoadingAttendance(false)
      return
    }

    if (!selectedClassId || !selectedSectionId) {
      return
    }

    setLoadingAttendance(true)
    setError('')

    try {
      const response = await api.get(
        `/attendance/StudentAttendance/${organizationId}/${selectedClassId}/${selectedSectionId}`,
      )

      if (response?.data?.status === 'error' || response?.status === 'error') {
        throw new Error(response?.data?.message || response?.message || 'Failed to load attendance records')
      }

      const normalizedRows = extractAttendanceRows(response).map((record, index) => normalizeAttendanceRow(record, index))
      setRows(normalizedRows)
      setAttendanceMap((current) => {
        const next = {}

        normalizedRows.forEach((row) => {
          next[row.id] = current[row.id] || row.status || 'present'
        })

        return next
      })
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to load attendance records'
      setError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setLoadingAttendance(false)
    }
  }, [notify, organizationId, selectedClassId, selectedSectionId])

  useEffect(() => {
    if (!loadingCatalog) {
      fetchAttendance()
    }
  }, [fetchAttendance, loadingCatalog])

  const handleStatusChange = useCallback((studentEnrollId, status) => {
    setAttendanceMap((current) => ({
      ...current,
      [studentEnrollId]: status,
    }))
  }, [])

  const columns = useMemo(
    () => [
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
      {
        key: 'attendance',
        label: 'Attendance',
        render: (row) => {
          const selectedStatus = attendanceMap[row.id] || row.status || 'present'

          return (
            <div className="flex flex-wrap gap-3">
              {['present', 'absent'].map((option) => {
                const checked = selectedStatus === option

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleStatusChange(row.id, option)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                      checked
                        ? option === 'present'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500/30 dark:hover:text-brand-300'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-[0.2em]">{option}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        option === 'present' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          )
        },
      },
    ],
    [attendanceMap, handleStatusChange],
  )

  const classOptions = useMemo(() => catalog, [catalog])

  const selectedClass = useMemo(
    () => catalog.find((item) => String(item.classId) === String(selectedClassId)) ?? null,
    [catalog, selectedClassId],
  )

  const selectedSection = useMemo(() => {
    if (!selectedClass || !selectedSectionId) {
      return null
    }

    return (
      selectedClass.sections.find((section) => String(section.sectionId) === String(selectedSectionId)) ?? null
    )
  }, [selectedClass, selectedSectionId])

  const selectedTeacherId = useMemo(() => {
    const teacherId =
      selectedSection?.classTeacherId ??
      selectedSection?.teacherId ??
      selectedSection?.teacher_id ??
      selectedClass?.classTeacherId ??
      selectedClass?.teacherId ??
      selectedClass?.teacher_id ??
      null

    if (teacherId === null || teacherId === undefined || teacherId === '') {
      return null
    }

    return Number(teacherId)
  }, [selectedClass, selectedSection])

  const sectionOptions = useMemo(() => selectedClass?.sections ?? [], [selectedClass])

  const visibleRows = useMemo(() => {
    const hasAttendanceDates = rows.some((row) => row.attendanceDate)

    if (!hasAttendanceDates) {
      return rows
    }

    return rows.filter((row) => String(row.attendanceDate).slice(0, 10) === selectedDate)
  }, [rows, selectedDate])

  const handleSubmit = useCallback(async () => {
    if (!organizationId) {
      notify('error', 'Organization id is required to submit attendance.')
      return
    }

    if (!selectedClassId || !selectedSectionId) {
      notify('error', 'Please select a class and section first.')
      return
    }

    const payload = {
      attendance: visibleRows.map((row) => ({
        student_enroll_id: Number(row.student_enroll_id),
        status: attendanceMap[row.id] || row.status || 'present',
      })),
      organization_id: Number(organizationId),
      teacher_id: selectedTeacherId,
      class_id: Number(selectedClassId),
      section_id: Number(selectedSectionId),
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await api.post('/attendance/markStudentAttendance', payload)
      const backendMessage = response?.data?.message || response?.message || 'Attendance submitted successfully'
      notify('success', backendMessage)
      await fetchAttendance()
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.message || requestError?.message || 'Failed to submit attendance'
      setError(backendMessage)
      notify('error', backendMessage)
    } finally {
      setSubmitting(false)
    }
  }, [attendanceMap, fetchAttendance, notify, organizationId, selectedClassId, selectedSectionId, selectedTeacherId, visibleRows])

  const isLoading = loadingCatalog || loadingAttendance

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Mark Attendance</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input label="Date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <Select
            label="Class"
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(event.target.value)
              const nextClass = catalog.find((item) => String(item.classId) === String(event.target.value))
              const nextSection = nextClass?.sections?.[0]
              setSelectedSectionId(String(nextSection?.sectionId ?? ''))
            }}
            disabled={!classOptions.length}
          >
            {classOptions.map((classOption) => (
              <option key={classOption.classId} value={String(classOption.classId)}>
                {classOption.className}
              </option>
            ))}
          </Select>
          <Select
            label="Section"
            value={selectedSectionId}
            onChange={(event) => setSelectedSectionId(event.target.value)}
            disabled={!sectionOptions.length}
          >
            {sectionOptions.map((sectionOption) => (
              <option key={sectionOption.sectionId} value={String(sectionOption.sectionId)}>
                {sectionOption.sectionName}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Loading attendance records...</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please wait while the table loads.</p>
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load attendance"
              description={error}
              action={
                <Button variant="brand" onClick={fetchCatalog}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={visibleRows}
              emptyState={
                <EmptyState
                  title="No attendance records found"
                  description="The backend returned no students for this organization, class, and section."
                />
              }
            />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {visibleRows.length
              ? `Ready to submit attendance for ${visibleRows.length} students on ${selectedDate}.`
              : 'No rows to submit right now.'}
          </p>
          <Button type="button" variant="brand" onClick={handleSubmit} disabled={isLoading || submitting || !visibleRows.length}>
            <Save size={18} />
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
