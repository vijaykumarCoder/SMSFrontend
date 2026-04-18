import { Eye, Plus, Search, SquarePen, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppStore } from '../../store/appStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'className', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'contact', label: 'Contact' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge tone={row.status === 'Active' ? 'success' : row.status === 'On Leave' ? 'warning' : 'danger'}>
        {row.status}
      </Badge>
    ),
  },
]

export function StudentsPage() {
  const students = useAppStore((state) => state.students)
  const classes = useAppStore((state) => state.classes)
  const addStudent = useAppStore((state) => state.addStudent)
  const removeStudent = useAppStore((state) => state.removeStudent)
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', className: '', section: '', contact: '' },
  })

  const classOptions = useMemo(() => {
    return [...new Set(classes.map((item) => item.className))].sort((left, right) => left.localeCompare(right))
  }, [classes])

  const selectedClassName = watch('className')

  const sectionOptions = useMemo(() => {
    return [...new Set(classes.filter((item) => item.className === selectedClassName).map((item) => item.section))].sort((left, right) =>
      left.localeCompare(right),
    )
  }, [classes, selectedClassName])

  useEffect(() => {
    if (!classOptions.length) return

    const firstClassName = classOptions[0]
    const firstSection = classes.find((item) => item.className === firstClassName)?.section ?? 'A'
    setValue('className', firstClassName)
    setValue('section', firstSection)
  }, [classOptions, classes, setValue])

  useEffect(() => {
    if (!selectedClassName || !sectionOptions.length) return
    setValue('section', sectionOptions[0])
  }, [sectionOptions, selectedClassName, setValue])

  const openCreateModal = () => {
    const firstClassName = classOptions[0] ?? ''
    const firstSection = classes.find((item) => item.className === firstClassName)?.section ?? ''
    reset({ name: '', className: firstClassName, section: firstSection, contact: '' })
    setModalOpen(true)
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery = student.name.toLowerCase().includes(query.toLowerCase())
      const matchesClass = classFilter === 'All' || student.className === classFilter
      return matchesQuery && matchesClass
    })
  }, [classFilter, query, students])

  const onSubmit = (values) => {
    addStudent(values)
    reset()
    setModalOpen(false)
  }

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Students</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage enrollment records, class assignments and contact information.
            </p>
          </div>
          <Button variant="brand" onClick={openCreateModal}>
            <Plus size={18} />
            Add Student
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by student name" icon={Search} />
          <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
            <option>All</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-6">
          <Table
            columns={columns}
            rows={filteredStudents}
            emptyState={
              <EmptyState
                title="No students found"
                description="Try adjusting the search or class filter, or create a new student record."
                action={<Button variant="brand" onClick={openCreateModal}>Add Student</Button>}
              />
            }
            renderRowActions={(row) => (
              <div className="flex items-center gap-2">
                {[Eye, SquarePen].map((Icon, index) => (
                  <button key={index} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300">
                    <Icon size={16} />
                  </button>
                ))}
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300" onClick={() => removeStudent(row.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Student" description="Capture essential student details for admissions and class operations.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="Student Name" placeholder="Enter full name" error={errors.name?.message} {...register('name', { required: 'Student name is required' })} />
          <Input label="Contact" placeholder="Enter guardian contact" error={errors.contact?.message} {...register('contact', { required: 'Contact is required' })} />
          <Select label="Class" error={errors.className?.message} {...register('className', { required: 'Class is required' })}>
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </Select>
          <Select label="Section" error={errors.section?.message} {...register('section', { required: 'Section is required' })}>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brand">Save Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
