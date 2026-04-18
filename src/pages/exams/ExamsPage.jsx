import { useMemo, useState } from 'react'
import { CalendarRange, Check, Plus } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { classesSeed, examCards, resultsRows, studentsSeed } from '../../utils/mockData'
import { cn } from '../../utils/helpers'

const examCardThemes = [
  {
    card: 'border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-100',
    pill: 'bg-white/80 text-sky-700',
    title: 'text-slate-900',
    text: 'text-slate-600',
    track: 'bg-white',
    progress: 'bg-sky-500',
  },
  {
    card: 'border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-100',
    pill: 'bg-white/80 text-emerald-700',
    title: 'text-slate-900',
    text: 'text-slate-600',
    track: 'bg-white',
    progress: 'bg-emerald-500',
  },
  {
    card: 'border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-100',
    pill: 'bg-white/80 text-amber-700',
    title: 'text-slate-900',
    text: 'text-slate-600',
    track: 'bg-white',
    progress: 'bg-amber-500',
  },
  {
    card: 'border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-100',
    pill: 'bg-white/80 text-rose-700',
    title: 'text-slate-900',
    text: 'text-slate-600',
    track: 'bg-white',
    progress: 'bg-rose-500',
  },
]

const subjectOptions = ['Mathematics', 'Physics', 'English', 'Chemistry', 'Biology', 'History', 'Computer Science']

const initialExams = examCards.map((exam, index) => ({
  ...exam,
  startDate: index === 0 ? '2026-04-18' : index === 1 ? '2026-04-12' : '2026-04-29',
  endDate: index === 0 ? '2026-04-26' : index === 1 ? '2026-04-14' : '2026-04-30',
  classes: index === 0 ? ['Class 8', 'Class 9', 'Class 10'] : index === 1 ? ['Class 10', 'Class 11'] : ['Class 9', 'Class 12'],
  subjects: exam.subject.split(',').map((item) => item.trim()),
}))

const resultsColumns = [
  { key: 'student', label: 'Student' },
  { key: 'exam', label: 'Exam' },
  { key: 'marks', label: 'Marks' },
  { key: 'grade', label: 'Grade' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge tone={row.status === 'Published' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
]

function formatTimeline(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return `${start.toLocaleString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`
}

function calculateGrade(marks) {
  if (marks >= 90) return 'A+'
  if (marks >= 80) return 'A'
  if (marks >= 70) return 'B+'
  if (marks >= 60) return 'B'
  if (marks >= 50) return 'C'
  return 'D'
}

function MultiSelect({ label, options, values, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const displayValue = values.length ? values.join(', ') : placeholder

  const toggleValue = (value) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-auto min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.28)] transition hover:border-slate-400"
        >
          <span className={cn('truncate', !values.length && 'text-slate-400')}>{displayValue}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{values.length} selected</span>
        </button>
        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_34px_-16px_rgba(15,23,42,0.35)]">
            <div className="space-y-1">
              {options.map((option) => {
                const selected = values.includes(option)

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleValue(option)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50',
                      selected && 'bg-brand-50 text-brand-700',
                    )}
                  >
                    <span>{option}</span>
                    {selected ? <Check size={16} /> : null}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 border-t border-slate-100 pt-2">
              <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ExamsPage() {
  const [exams, setExams] = useState(initialExams)
  const [results, setResults] = useState(resultsRows)
  const [examModalOpen, setExamModalOpen] = useState(false)
  const [newExam, setNewExam] = useState({
    title: '',
    startDate: '',
    endDate: '',
    classes: [],
    subjects: [],
  })
  const [marksFilters, setMarksFilters] = useState({
    className: 'all',
    section: 'all',
    studentSearch: '',
    exam: initialExams[0]?.title ?? 'all',
    subject: subjectOptions[0],
  })
  const [marksDrafts, setMarksDrafts] = useState({})

  const classOptions = useMemo(() => [...new Set(classesSeed.map((item) => item.className))], [])
  const sectionOptions = useMemo(() => {
    if (marksFilters.className === 'all') {
      return [...new Set(classesSeed.map((item) => item.section))]
    }

    return [...new Set(classesSeed.filter((item) => item.className === marksFilters.className).map((item) => item.section))]
  }, [marksFilters.className])

  const filteredStudents = useMemo(() => {
    return studentsSeed.filter((student) => {
      const matchesClass = marksFilters.className === 'all' || student.className === marksFilters.className
      const matchesSection = marksFilters.section === 'all' || student.section === marksFilters.section
      const matchesSearch = student.name.toLowerCase().includes(marksFilters.studentSearch.toLowerCase())

      return matchesClass && matchesSection && matchesSearch
    })
  }, [marksFilters.className, marksFilters.section, marksFilters.studentSearch])

  const marksRows = useMemo(() => {
    return filteredStudents.map((student) => ({
      id: student.id,
      student: student.name,
      className: student.className,
      section: student.section,
      exam: marksFilters.exam,
      subject: marksFilters.subject,
      marks: marksDrafts[student.id] ?? '',
    }))
  }, [filteredStudents, marksDrafts, marksFilters.exam, marksFilters.subject])

  const marksColumns = [
    { key: 'student', label: 'Student Name' },
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'exam', label: 'Exam' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'marks',
      label: 'Marks Entry',
      render: (row) => (
        <input
          type="number"
          min="0"
          max="100"
          value={row.marks}
          onChange={(event) => {
            const value = event.target.value
            setMarksDrafts((current) => ({ ...current, [row.id]: value }))
          }}
          placeholder="Enter marks"
          className="h-11 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      ),
    },
  ]

  const handleExamFieldChange = (field, value) => {
    setNewExam((current) => ({ ...current, [field]: value }))
  }

  const handleCreateExam = (event) => {
    event.preventDefault()

    if (!newExam.title || !newExam.startDate || !newExam.endDate || !newExam.classes.length || !newExam.subjects.length) {
      return
    }

    const examEntry = {
      id: Date.now(),
      title: newExam.title,
      subject: newExam.subjects.join(', '),
      timeline: formatTimeline(newExam.startDate, newExam.endDate),
      students: studentsSeed.filter((student) => newExam.classes.includes(student.className)).length,
      progress: 0,
      startDate: newExam.startDate,
      endDate: newExam.endDate,
      classes: newExam.classes,
      subjects: newExam.subjects,
    }

    setExams((current) => [examEntry, ...current])
    setMarksFilters((current) => ({
      ...current,
      exam: examEntry.title,
      subject: examEntry.subjects[0] ?? current.subject,
    }))
    setNewExam({ title: '', startDate: '', endDate: '', classes: [], subjects: [] })
    setExamModalOpen(false)
  }

  const handleSaveAllMarks = () => {
    const updatedRows = filteredStudents
      .map((student) => {
        const marks = Number(marksDrafts[student.id])

        if (Number.isNaN(marks)) return null

        return {
          id: `${student.id}-${marksFilters.exam}-${marksFilters.subject}`,
          student: student.name,
          exam: marksFilters.exam,
          marks,
          grade: calculateGrade(marks),
          status: 'Pending Review',
        }
      })
      .filter(Boolean)

    if (!updatedRows.length) return

    setResults((current) => {
      const nextRows = current.filter((row) => !updatedRows.some((entry) => entry.id === row.id))
      return [...updatedRows, ...nextRows]
    })
  }

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Exams</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage exam schedules and enter marks for an entire filtered class list from one table.
            </p>
          </div>
          <Button variant="brand" onClick={() => setExamModalOpen(true)}>
            <Plus size={16} />
            Create New Exam
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam, index) => {
            const theme = examCardThemes[index % examCardThemes.length]

            return (
              <div key={exam.id} className={cn('rounded-[26px] p-5', theme.card)}>
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', theme.pill)}>
                    {exam.subject}
                  </span>
                  <CalendarRange size={18} className="text-slate-400" />
                </div>
                <h3 className={cn('mt-4 text-xl font-semibold', theme.title)}>{exam.title}</h3>
                <p className={cn('mt-2 text-sm', theme.text)}>{exam.timeline}</p>
                <p className={cn('mt-2 text-sm', theme.text)}>
                  {exam.classes?.join(', ') || 'All classes'} • {exam.subjects?.join(', ') || exam.subject}
                </p>
                <div className={cn('mt-5 h-2 rounded-full', theme.track)}>
                  <div className={cn('h-2 rounded-full', theme.progress)} style={{ width: `${exam.progress}%` }} />
                </div>
                <div className={cn('mt-4 flex items-center justify-between text-sm', theme.text)}>
                  <span>{exam.students} students</span>
                  <span>{exam.progress}% ready</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="section-title">Marks Entry</h3>
            <p className="section-subtitle">Filter by class, section, exam, and subject, then enter marks for every student from the table below.</p>
          </div>
          <Button variant="brand" onClick={handleSaveAllMarks}>Save All Marks</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Select
            label="Class"
            value={marksFilters.className}
            onChange={(event) => {
              const className = event.target.value
              setMarksFilters((current) => ({
                ...current,
                className,
                section: 'all',
              }))
            }}
          >
            <option value="all">All Classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </Select>

          <Select
            label="Section"
            value={marksFilters.section}
            onChange={(event) => setMarksFilters((current) => ({ ...current, section: event.target.value }))}
          >
            <option value="all">All Sections</option>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </Select>

          <Input
            label="Student Name"
            placeholder="Search student"
            value={marksFilters.studentSearch}
            onChange={(event) => setMarksFilters((current) => ({ ...current, studentSearch: event.target.value }))}
          />

          <Select
            label="Exam"
            value={marksFilters.exam}
            onChange={(event) => setMarksFilters((current) => ({ ...current, exam: event.target.value }))}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.title}>{exam.title}</option>
            ))}
          </Select>

          <Select
            label="Subject"
            value={marksFilters.subject}
            onChange={(event) => setMarksFilters((current) => ({ ...current, subject: event.target.value }))}
          >
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </Select>
        </div>

        <div className="mt-6">
          <Table
            columns={marksColumns}
            rows={marksRows}
            emptyState={
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                No students matched the current filters.
              </div>
            }
          />
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="section-title">Results Overview</h3>
          <p className="section-subtitle">Latest published and draft result entries</p>
        </div>
        <Table columns={resultsColumns} rows={results} />
      </Card>

      <Modal
        open={examModalOpen}
        title="Create New Exam"
        description="Set the schedule and assign one exam to multiple classes and subjects."
        onClose={() => setExamModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleCreateExam}>
          <Input
            label="Exam Name"
            placeholder="Enter exam name"
            value={newExam.title}
            onChange={(event) => handleExamFieldChange('title', event.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Start Date"
              type="date"
              value={newExam.startDate}
              onChange={(event) => handleExamFieldChange('startDate', event.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={newExam.endDate}
              onChange={(event) => handleExamFieldChange('endDate', event.target.value)}
            />
          </div>

          <MultiSelect
            label="Classes"
            options={classOptions}
            values={newExam.classes}
            onChange={(values) => handleExamFieldChange('classes', values)}
            placeholder="Select classes"
          />

          <MultiSelect
            label="Subjects"
            options={subjectOptions}
            values={newExam.subjects}
            onChange={(values) => handleExamFieldChange('subjects', values)}
            placeholder="Select subjects"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setExamModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brand">Create Exam</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
