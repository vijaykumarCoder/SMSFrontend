import { Eye, Plus, Search, SquarePen, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  { key: 'subject', label: 'Subject' },
  { key: 'department', label: 'Department' },
  { key: 'contact', label: 'Contact' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge tone={row.status === 'Full Time' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
]

export function TeachersPage() {
  const teachers = useAppStore((state) => state.teachers)
  const addTeacher = useAppStore((state) => state.addTeacher)
  const removeTeacher = useAppStore((state) => state.removeTeacher)
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', subject: '', department: 'STEM', contact: '' },
  })

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesQuery = teacher.name.toLowerCase().includes(query.toLowerCase())
      const matchesDepartment = departmentFilter === 'All' || teacher.department === departmentFilter
      return matchesQuery && matchesDepartment
    })
  }, [departmentFilter, query, teachers])

  const onSubmit = (values) => {
    addTeacher(values)
    reset()
    setModalOpen(false)
  }

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Teachers</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Keep faculty details, departments and staffing status organized.
            </p>
          </div>
          <Button variant="brand" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Add Teacher
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by teacher name" icon={Search} />
          <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option>All</option>
            <option>STEM</option>
            <option>Humanities</option>
            <option>Technology</option>
          </Select>
        </div>

        <div className="mt-6">
          <Table
            columns={columns}
            rows={filteredTeachers}
            emptyState={<EmptyState title="No teachers found" description="There are no teachers matching the current filters." />}
            renderRowActions={(row) => (
              <div className="flex items-center gap-2">
                {[Eye, SquarePen].map((Icon, index) => (
                  <button key={index} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300">
                    <Icon size={16} />
                  </button>
                ))}
                <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300" onClick={() => removeTeacher(row.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Teacher" description="Create a faculty profile with assignment and contact details.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input label="Teacher Name" placeholder="Enter full name" error={errors.name?.message} {...register('name', { required: 'Teacher name is required' })} />
          <Input label="Contact" placeholder="Enter phone number" error={errors.contact?.message} {...register('contact', { required: 'Contact is required' })} />
          <Input label="Subject" placeholder="Subject handled" error={errors.subject?.message} {...register('subject', { required: 'Subject is required' })} />
          <Select label="Department" error={errors.department?.message} {...register('department', { required: 'Department is required' })}>
            <option>STEM</option>
            <option>Humanities</option>
            <option>Technology</option>
          </Select>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="brand">Save Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
