import { CalendarDays, CheckCircle2, Filter, GraduationCap, UserSquare2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { attendanceRoster, studentLeaveRecords, teacherLeaveRecords } from '../../utils/mockData'
import { useAppStore } from '../../store/appStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'

const monthLabel = 'April 2026'
const monthPrefix = '2026-04'

function formatIsoDate(day) {
  return `${monthPrefix}-${String(day).padStart(2, '0')}`
}

function getInitialSelectedDate() {
  const today = new Date().toISOString().slice(0, 10)
  return today.startsWith(monthPrefix) ? today : formatIsoDate(attendanceRoster[0]?.date ?? 1)
}

function LeaveSection({ title, subtitle, icon: Icon, rows, emptyMessage, commentLabel, renderComment }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="section-title">{title}</h3>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200/80 dark:border-slate-800">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/80 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">{commentLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone="warning">On Leave</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-600 dark:text-slate-300">{renderComment(row)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-transparent bg-slate-50/70 px-4 py-8 text-center dark:bg-slate-900/50">
            <p className="font-medium text-slate-900 dark:text-white">No leave entries</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export function AttendancePage() {
  const students = useAppStore((state) => state.students)
  const teachers = useAppStore((state) => state.teachers)
  const [classFilter, setClassFilter] = useState('Class 10')
  const [selectedDate, setSelectedDate] = useState(getInitialSelectedDate)

  const availableClasses = useMemo(() => [...new Set(students.map((student) => student.className))], [students])

  const dayDetails = useMemo(
    () => attendanceRoster.find((item) => formatIsoDate(item.date) === selectedDate) ?? null,
    [selectedDate],
  )

  const studentsOnLeave = useMemo(() => {
    return studentLeaveRecords.filter((record) => formatIsoDate(record.date) === selectedDate && record.className === classFilter)
  }, [classFilter, selectedDate])

  const teachersOnLeave = useMemo(() => {
    return teacherLeaveRecords.filter((record) => formatIsoDate(record.date) === selectedDate)
  }, [selectedDate])

  const studentSummary = useMemo(() => {
    const total = students.filter((student) => student.className === classFilter).length || 1
    const leaveCount = studentsOnLeave.length
    const presentCount = Math.max(total - leaveCount, 0)

    return {
      present: `${Math.round((presentCount / total) * 100)}%`,
      absent: `${Math.round((leaveCount / total) * 100)}%`,
      late: `${Math.max(2, dayDetails?.status === 'Late' ? 6 : 3)}%`,
      holiday: `${dayDetails?.status === 'Holiday' ? 100 : 0}%`,
    }
  }, [classFilter, dayDetails?.status, students, studentsOnLeave.length])

  const teacherSummary = useMemo(() => {
    const total = teachers.length || 1
    const leaveCount = teachersOnLeave.length
    return `${leaveCount}/${total} staff on leave`
  }, [teachers.length, teachersOnLeave.length])

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review daily leave records for students and teachers by date and class.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </Select>
            <Button variant="brand">
              <CheckCircle2 size={18} />
              Mark Attendance
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[252px_minmax(0,1fr)]">
          <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{monthLabel}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{classFilter} leave summary</p>
              </div>
            </div>

            <div className="mt-5">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                min={formatIsoDate(1)}
                max={formatIsoDate(30)}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="mt-6 space-y-3">
              {[
                ['Present', studentSummary.present],
                ['Absent', studentSummary.absent],
                ['Late', studentSummary.late],
                ['Holiday', studentSummary.holiday],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Teachers</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{teacherSummary}</p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Filter size={16} />
              Leave records update from the selected date. Class filtering applies to students only.
            </div>

            <div className="space-y-4">
              <LeaveSection
                title="Teachers On Leave"
                subtitle={`School-wide records for ${selectedDate}`}
                icon={UserSquare2}
                rows={teachersOnLeave}
                emptyMessage={`No teachers are on leave for ${selectedDate}.`}
                commentLabel="Comments"
                renderComment={(row) => `${row.subject}, ${row.department} - ${row.reason}`}
              />
              <LeaveSection
                title="Students On Leave"
                subtitle={`Showing ${classFilter} for ${selectedDate}`}
                icon={GraduationCap}
                rows={studentsOnLeave}
                emptyMessage={`No students from ${classFilter} are on leave for ${selectedDate}.`}
                commentLabel="Comments"
                renderComment={(row) => `${row.className}, Section ${row.section} - ${row.reason}`}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
