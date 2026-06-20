import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Edit3, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useAppStore } from '../../store/appStore'
import { apiService } from '../../services/apiService'
import api from '../../utils/api'

const DEFAULT_SCHOOL_ID = 2
const DEFAULT_ACADEMIC_YEAR_ID = 1
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F']
const SECTION_ID_BY_LETTER = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
}

const formDefaults = {
  student_name: '',
  class_name: '',
  father_name: '',
  father_phone_number: '',
  emergency_name: '',
  emergency_phone_number: '',
  date_of_birth: '',
  school_name: '',
  address: '',
  city: '',
  state: '',
  how_do_you_get_to_know: 'Through application',
  school_id: DEFAULT_SCHOOL_ID,
}

function readFirstValue(record, keys) {
  return keys.reduce((value, key) => value || record?.[key], '')
}

function normalizeComparable(value) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeStudent(record, index = 0) {
  const id = record?._id ?? record?.id ?? record?.student_id ?? `registered-student-${index}`

  return {
    id,
    student_name: readFirstValue(record, ['student_name', 'full_name', 'name', 'studentName']),
    class_name: readFirstValue(record, ['class_name', 'className', 'class']),
    father_name: readFirstValue(record, ['father_name', 'fatherName']),
    father_phone_number: readFirstValue(record, ['father_phone_number', 'phone_number', 'phone', 'contact']),
    emergency_name: readFirstValue(record, ['emergency_name', 'emergency_contact_name']),
    emergency_phone_number: readFirstValue(record, ['emergency_phone_number', 'emergency_contact_phone']),
    date_of_birth: readFirstValue(record, ['date_of_birth', 'dob']),
    school_name: readFirstValue(record, ['school_name']),
    address: readFirstValue(record, ['address']),
    city: readFirstValue(record, ['city']),
    state: readFirstValue(record, ['state']),
    how_do_you_get_to_know: readFirstValue(record, ['how_do_you_get_to_know']),
    class_id: readFirstValue(record, ['class_id', 'classId']),
    section: readFirstValue(record, ['section', 'section_name', 'sectionName']),
    section_id: readFirstValue(record, ['section_id', 'sectionId']),
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

function buildClassOptions(classes = []) {
  const groupedClasses = classes.reduce((accumulator, record) => {
    const className = String(readFirstValue(record, ['class_name', 'className']) ?? '').trim()

    if (!className) {
      return accumulator
    }

    if (!accumulator.has(className)) {
      accumulator.set(className, [])
    }

    accumulator.get(className).push(record)
    return accumulator
  }, new Map())

  return [...groupedClasses.entries()]
    .map(([className, records]) => {
      const sortedRecords = [...records].sort((left, right) => {
        const leftSection = normalizeComparable(readFirstValue(left, ['section', 'section_name', 'sectionName']))
        const rightSection = normalizeComparable(readFirstValue(right, ['section', 'section_name', 'sectionName']))
        return leftSection.localeCompare(rightSection)
      })

      return {
        className,
        value: sortedRecords[0]?.id ?? sortedRecords[0]?.class_id ?? className,
        records: sortedRecords,
      }
    })
    .sort((left, right) => left.className.localeCompare(right.className))
}

function resolveClassValue(student, classOptions) {
  const normalizedClassName = normalizeComparable(student?.class_name)

  if (!normalizedClassName) {
    return classOptions[0]?.value ?? ''
  }

  const matchedClass = classOptions.find((item) => normalizeComparable(item.className) === normalizedClassName)

  if (!matchedClass) {
    return classOptions[0]?.value ?? ''
  }

  const normalizedSection = normalizeComparable(student?.section)
  const exactMatch = matchedClass.records.find(
    (record) => normalizeComparable(readFirstValue(record, ['section', 'section_name', 'sectionName'])) === normalizedSection,
  )

  return exactMatch?.id ?? exactMatch?.class_id ?? matchedClass.value
}

function resolveSectionValue(student) {
  const normalizedSection = normalizeComparable(student?.section).toUpperCase()
  return SECTION_ID_BY_LETTER[normalizedSection] ?? SECTION_ID_BY_LETTER.A
}

function buildEnrollDefaults(student, classOptions) {
  return {
    student_register_id: student?.id ?? '',
    student_name: student?.student_name ?? '',
    class_id: String(resolveClassValue(student, classOptions) ?? ''),
    section_id: String(resolveSectionValue(student) ?? ''),
    admission_no: '',
    roll_no: '',
  }
}

function toNumberIfNumeric(value) {
  if (value === null || value === undefined || value === '') {
    return value
  }

  const normalizedValue = typeof value === 'string' ? value.trim() : value
  const numericValue = Number(normalizedValue)

  return Number.isNaN(numericValue) ? normalizedValue : numericValue
}

function toPayload(values) {
  return {
    ...values,
    school_id: DEFAULT_SCHOOL_ID,
    how_do_you_get_to_know: values.how_do_you_get_to_know || 'Through application',
  }
}

const columns = [
  {
    key: 'student_name',
    label: 'Student',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{row.student_name || 'Unnamed student'}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {row.id}</p>
      </div>
    ),
  },
  { key: 'class_name', label: 'Class' },
  { key: 'father_name', label: 'Father' },
  { key: 'father_phone_number', label: 'Phone' },
  {
    key: 'location',
    label: 'Location',
    render: (row) => [row.city, row.state].filter(Boolean).join(', ') || '-',
  },
  {
    key: 'date_of_birth',
    label: 'DOB',
    render: (row) => row.date_of_birth || '-',
  },
  {
    key: 'status',
    label: 'Status',
    render: () => <Badge tone="success">Registered</Badge>,
  },
]

export function RegisteredStudentsPage() {
  const navigate = useNavigate()
  const classes = useAppStore((state) => state.classes)
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [enrollingStudent, setEnrollingStudent] = useState(null)
  const [notification, setNotification] = useState(null)
  const classOptions = useMemo(() => buildClassOptions(classes), [classes])

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: formDefaults,
  })

  const {
    control: enrollControl,
    handleSubmit: handleEnrollSubmit,
    reset: resetEnrollForm,
    register: enrollRegister,
    formState: { errors: enrollErrors, isSubmitting: isEnrolling },
  } = useForm({
    defaultValues: {
      student_register_id: '',
      student_name: '',
      class_id: '',
      section_id: '',
      admission_no: '',
      roll_no: '',
    },
  })

  useEffect(() => {
    if (!notification) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setNotification(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [notification])

  useEffect(() => {
    let active = true

    async function loadStudents() {
      setLoading(true)
      setError('')

      try {
        // const payload = await apiService.getAllRegisteredStudents(DEFAULT_SCHOOL_ID)
         const payload = await api.get(`/students/getAllRegisterdStudents/2`)

        if (payload?.status === 'error') {
          throw new Error(payload.message || 'Failed to load registered students')
        }

        const rawRows = extractStudentRows(payload)
        const rows = rawRows.map((record, index) => normalizeStudent(record, index))

        if (active) {
          setStudents(rows)
        }
      } catch (requestError) {
        if (active) {
          const backendMessage = requestError?.message
          setError(backendMessage || 'Failed to load registered students')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStudents()

    return () => {
      active = false
    }
  }, [])

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return students
    }

    return students.filter((student) => student.student_name.toLowerCase().includes(normalizedQuery))
  }, [query, students])

  const notify = (type, message) => {
    setNotification({ type, message })
  }

  const openEditModal = (student) => {
    setEnrollModalOpen(false)
    setEnrollingStudent(null)
    setEditingStudent(student)
    resetEditForm({
      ...formDefaults,
      ...student,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingStudent(null)
    resetEditForm(formDefaults)
  }

  const openEnrollModal = (student) => {
    setModalOpen(false)
    setEditingStudent(null)
    setEnrollingStudent(student)
    resetEnrollForm(buildEnrollDefaults(student, classOptions))
    setEnrollModalOpen(true)
  }

  const closeEnrollModal = () => {
    setEnrollModalOpen(false)
    setEnrollingStudent(null)
    resetEnrollForm({
      student_register_id: '',
      student_name: '',
      class_id: '',
      section_id: '',
      admission_no: '',
      roll_no: '',
    })
  }

  const onEditSubmit = async (values) => {
    if (!editingStudent?.id) {
      return
    }

    setSavingId(editingStudent.id)
    setError('')

    try {
      const payload = toPayload(values)
      // await apiService.updateRegisteredStudent(editingStudent.id, payload)
      await api.post(`/students/studentRegister/${editingStudent.id}`, payload)
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === editingStudent.id
            ? normalizeStudent({ ...student.raw, ...payload, _id: student.id })
            : student,
        ),
      )
      closeModal()
    } catch (requestError) {
      setError(requestError.message || 'Failed to update student details')
    } finally {
      setSavingId('')
    }
  }

  const onEnrollSubmit = async (values) => {
    if (!enrollingStudent?.id) {
      return
    }

    try {
      const payload = {
        student_register_id: 1,
        // student_register_id: values.student_register_id,
        student_name: values.student_name.trim(),
        school_id: DEFAULT_SCHOOL_ID,
        class_id: toNumberIfNumeric(values.class_id),
        section_id: toNumberIfNumeric(values.section_id),
        academic_year_id: DEFAULT_ACADEMIC_YEAR_ID,
        admission_no: values.admission_no.trim(),
        roll_no: values.roll_no.trim(),
        status: 'Active',
      }

      // const response = await apiService.enrollStudent(payload)
      const response = await api.post('/students/studentEnroll', payload)

      if (response?.status && response.status !== 'success') {
        throw new Error(response.message || 'student enroll faild')
      }

      if (response?.success === false) {
        throw new Error(response.message || 'student enroll faild')
      }

      notify('success', response?.message || 'student enrolled successfully')
      closeEnrollModal()
    } catch (requestError) {
      notify('error', requestError.message || 'student enroll faild')
    }
  }

  const handleDelete = async (student) => {
    const confirmed = window.confirm(`Delete ${student.student_name}?`)
    if (!confirmed) {
      return
    }

    setDeletingId(student.id)
    setError('')

    try {
      await apiService.deleteRegisteredStudent(student.id)
      setStudents((currentStudents) => currentStudents.filter((item) => item.id !== student.id))
    } catch (requestError) {
      setError(requestError.message || 'Failed to delete student')
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Admissions</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Registered students
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Browse the live registration list, search by student name, and keep records updated from one place.
            </p>
          </div>

          <Button variant="brand" onClick={() => navigate('/student-registration')}>
            <Plus size={18} />
            Register
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by student name"
            icon={Search}
          />
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Users size={16} className="mr-2 shrink-0" />
            {students.length} total students
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Loading students</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Fetching registered students from the backend.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : (
            <Table
              columns={columns}
              rows={filteredStudents}
              emptyState={
                <EmptyState
                  title="No students found"
                  description="Try a different search term or open the registration form to add a new student."
                  action={
                    <Button variant="brand" onClick={() => navigate('/student-registration')}>
                      <Plus size={18} />
                      Register
                    </Button>
                  }
                />
              }
              renderRowActions={(row) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                    aria-label={`Edit ${row.student_name}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEnrollModal(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    aria-label={`Enroll ${row.student_name}`}
                  >
                    <UserPlus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                    aria-label={`Delete ${row.student_name}`}
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
        title={editingStudent ? 'Edit student' : 'Student details'}
        description="Update the registered student record and save the latest details."
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Student Name"
            placeholder="Enter student name"
            error={errors.student_name?.message}
            {...editRegister('student_name', { required: 'Student name is required' })}
          />
          <Input
            label="Class"
            placeholder="Enter class"
            error={errors.class_name?.message}
            {...editRegister('class_name', { required: 'Class is required' })}
          />
          <Input
            label="Father Name"
            placeholder="Enter father name"
            error={errors.father_name?.message}
            {...editRegister('father_name', { required: 'Father name is required' })}
          />
          <Input
            label="Father Phone Number"
            placeholder="Enter phone number"
            error={errors.father_phone_number?.message}
            {...editRegister('father_phone_number', { required: 'Phone number is required' })}
          />
          <Input
            label="Emergency Name"
            placeholder="Enter emergency contact name"
            error={errors.emergency_name?.message}
            {...editRegister('emergency_name')}
          />
          <Input
            label="Emergency Phone Number"
            placeholder="Enter emergency phone"
            error={errors.emergency_phone_number?.message}
            {...editRegister('emergency_phone_number')}
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...editRegister('date_of_birth')}
          />
          <Input
            label="School Name"
            placeholder="Enter school name"
            error={errors.school_name?.message}
            {...editRegister('school_name')}
          />
          <Input
            label="City"
            placeholder="Enter city"
            error={errors.city?.message}
            {...editRegister('city')}
          />
          <Input
            label="State"
            placeholder="Enter state"
            error={errors.state?.message}
            {...editRegister('state')}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            error={errors.address?.message}
            className="md:col-span-2"
            {...editRegister('address')}
          />

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={isSubmitting || savingId === editingStudent?.id}
            >
              {savingId === editingStudent?.id ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={enrollModalOpen}
        onClose={closeEnrollModal}
        title="Enroll student"
        description="Select the class and section, then provide admission and roll numbers before submitting."
      >
        <form onSubmit={handleEnrollSubmit(onEnrollSubmit)} className="grid gap-4 md:grid-cols-2">
          <input
            type="hidden"
            {...enrollRegister('student_register_id', { required: 'Student id is required' })}
          />
          <Input
            label="User name"
            placeholder="Student name"
            readOnly
            error={enrollErrors.student_name?.message}
            className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-300"
            {...enrollRegister('student_name', { required: 'Student name is required' })}
          />
          <Controller
            name="class_id"
            control={enrollControl}
            rules={{ required: 'Class is required' }}
            render={({ field }) => (
              <Select
                label="Class"
                error={enrollErrors.class_id?.message}
                disabled={!classOptions.length}
                name={field.name}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              >
                <option value="">Select class</option>
                {classOptions.map((classOption) => (
                  <option key={classOption.value} value={String(classOption.value)}>
                    {classOption.className}
                  </option>
                ))}
              </Select>
            )}
          />
          <Controller
            name="section_id"
            control={enrollControl}
            rules={{ required: 'Section is required' }}
            render={({ field }) => (
              <Select
                label="Section"
                error={enrollErrors.section_id?.message}
                name={field.name}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              >
                {SECTION_OPTIONS.map((section) => (
                  <option key={section} value={String(SECTION_ID_BY_LETTER[section])}>
                    Section {section}
                  </option>
                ))}
              </Select>
            )}
          />
          <Input
            label="Admission Number"
            placeholder="Enter admission number"
            error={enrollErrors.admission_no?.message}
            {...enrollRegister('admission_no', {
              required: 'Admission number is required',
              validate: (value) => value.trim().length > 0 || 'Admission number is required',
            })}
          />
          <Input
            label="Roll Number"
            placeholder="Enter roll number"
            error={enrollErrors.roll_no?.message}
            {...enrollRegister('roll_no', {
              required: 'Roll number is required',
              validate: (value) => value.trim().length > 0 || 'Roll number is required',
            })}
          />

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeEnrollModal}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isEnrolling || !classOptions.length}>
              {isEnrolling ? 'Submitting...' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
