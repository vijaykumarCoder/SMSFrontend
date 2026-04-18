import { CalendarCheck2, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'

function formatToday() {
  return new Date().toISOString().slice(0, 10)
}

export function MarkAttendancePage() {
  const students = useAppStore((state) => state.students)
  const [selectedDate, setSelectedDate] = useState(formatToday)
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [attendanceMap, setAttendanceMap] = useState({})
  const [saveMessage, setSaveMessage] = useState('')

  const classes = useMemo(() => ['All', ...new Set(students.map((student) => student.className))], [students])

  const sections = useMemo(() => {
    const eligibleStudents =
      selectedClass === 'All'
        ? students
        : students.filter((student) => student.className === selectedClass)

    return ['All', ...new Set(eligibleStudents.map((student) => student.section))]
  }, [selectedClass, students])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass = selectedClass === 'All' || student.className === selectedClass
      const matchesSection = selectedSection === 'All' || student.section === selectedSection
      return matchesClass && matchesSection
    })
  }, [selectedClass, selectedSection, students])

  useEffect(() => {
    if (selectedSection !== 'All' && !sections.includes(selectedSection)) {
      setSelectedSection('All')
    }
  }, [sections, selectedSection])

  useEffect(() => {
    setAttendanceMap((current) => {
      const next = { ...current }

      filteredStudents.forEach((student) => {
        if (!next[student.id]) {
          next[student.id] = 'Present'
        }
      })

      return next
    })
  }, [filteredStudents])

  const rows = useMemo(() => {
    return filteredStudents.map((student) => ({
      ...student,
      attendance: attendanceMap[student.id] ?? 'Present',
    }))
  }, [attendanceMap, filteredStudents])

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'className', label: 'Class' },
      { key: 'section', label: 'Section' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Badge tone={row.status === 'Active' ? 'success' : row.status === 'On Leave' ? 'warning' : 'danger'}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: 'attendance',
        label: 'Attendance',
        render: (row) => (
          <div className="flex flex-wrap gap-3">
            {['Present', 'Absent'].map((option) => {
              const checked = (attendanceMap[row.id] ?? 'Present') === option

              return (
                <label
                  key={option}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    checked
                      ? option === 'Present'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                      : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                    checked={checked}
                    onChange={() =>
                      setAttendanceMap((current) => ({
                        ...current,
                        [row.id]: option,
                      }))
                    }
                  />
                  {option}
                </label>
              )
            })}
          </div>
        ),
      },
    ],
    [attendanceMap],
  )

  const handleSave = () => {
    setSaveMessage(`Attendance saved for ${rows.length} students on ${selectedDate}.`)
  }

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Mark Attendance</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Filter by date, class, and section to record daily student attendance in one table view.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <CalendarCheck2 size={20} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input label="Date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <Select label="Class" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </Select>
          <Select label="Section" value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-6">
          <Table
            columns={columns}
            rows={rows}
            emptyState={
              <EmptyState
                title="No students found"
                description="Adjust the date, class, or section filters to load student rows for attendance."
              />
            }
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {saveMessage || `Ready to save attendance for ${rows.length} students.`}
          </p>
          <Button variant="brand" onClick={handleSave}>
            <Save size={18} />
            Save Attendance
          </Button>
        </div>
      </Card>
    </div>
  )
}
