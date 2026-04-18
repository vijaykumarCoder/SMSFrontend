import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppStore } from '../../store/appStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'

const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F']

export function ClassesPage() {
  const classes = useAppStore((state) => state.classes)
  const students = useAppStore((state) => state.students)
  const teachers = useAppStore((state) => state.teachers)
  const addClass = useAppStore((state) => state.addClass)
  const [classFilter, setClassFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [sectionSelections, setSectionSelections] = useState({})
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      className: '',
      section: 'A',
      teacherId: '',
    },
  })

  useEffect(() => {
    if (!teachers.length) return

    reset({
      className: '',
      section: 'A',
      teacherId: teachers[0].id,
    })
  }, [reset, teachers])

  const classNames = useMemo(() => {
    return [...new Set(classes.map((item) => item.className))].sort((left, right) => left.localeCompare(right))
  }, [classes])

  const openCreateModal = () => {
    clearErrors()
    reset({ className: '', section: 'A', teacherId: teachers[0]?.id ?? '' })
    setModalOpen(true)
  }

  const rows = useMemo(() => {
    const grouped = classes.reduce((accumulator, item) => {
      if (!accumulator[item.className]) {
        accumulator[item.className] = []
      }

      accumulator[item.className].push(item)
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([name, sections]) => {
        const sortedSections = [...sections].sort((left, right) => left.section.localeCompare(right.section))
        const activeSection = sectionSelections[name] ?? 'All'
        const studentCount = students.filter((student) => {
          if (student.className !== name) return false
          return activeSection === 'All' || student.section === activeSection
        }).length

        const teacherLabel =
          activeSection === 'All'
            ? [...new Set(sortedSections.map((item) => teachers.find((teacher) => teacher.id === item.teacherId)?.name).filter(Boolean))].join(', ')
            : teachers.find((teacher) => teacher.id === sortedSections.find((item) => item.section === activeSection)?.teacherId)?.name ?? 'Not assigned'

        return {
          id: name,
          className: name,
          classTeacher: teacherLabel || 'Not assigned',
          studentCount,
          availableSections: ['All', ...sortedSections.map((item) => item.section)],
          selectedSection: activeSection,
        }
      })
      .filter((item) => classFilter === 'All' || item.className === classFilter)
      .sort((left, right) => left.className.localeCompare(right.className))
  }, [classFilter, classes, sectionSelections, students, teachers])

  const columns = useMemo(
    () => [
      { key: 'className', label: 'Class Name' },
      { key: 'classTeacher', label: 'Class Teacher' },
      { key: 'studentCount', label: 'Students Count' },
      {
        key: 'selectedSection',
        label: 'Section',
        render: (row) => (
          <Select
            value={row.selectedSection}
            onChange={(event) =>
              setSectionSelections((current) => ({
                ...current,
                [row.className]: event.target.value,
              }))
            }
            className="min-w-[132px]"
          >
            {row.availableSections.map((section) => (
              <option key={section} value={section}>
                {section === 'All' ? 'All Sections' : `Section ${section}`}
              </option>
            ))}
          </Select>
        ),
      },
    ],
    [],
  )

  const onSubmit = (values) => {
    const duplicateExists = classes.some(
      (item) => item.className.trim().toLowerCase() === values.className.trim().toLowerCase() && item.section === values.section,
    )

    if (duplicateExists) {
      setError('section', { type: 'manual', message: 'This section already exists for the selected class' })
      return
    }

    addClass({
      className: values.className.trim(),
      section: values.section,
      teacherId: values.teacherId,
    })
    clearErrors()
    reset({ className: '', section: 'A', teacherId: teachers[0]?.id ?? '' })
    setModalOpen(false)
  }

  return (
    <div className="page-shell">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Classes</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Organize classes, their sections, and the teachers leading each section.
            </p>
          </div>
          <Button variant="brand" onClick={openCreateModal}>
            <Plus size={18} />
            Add Class
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px_auto]">
          <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} label="Filter By Class">
            <option value="All">All Classes</option>
            {classNames.map((className) => (
              <option key={className} value={className}>
                {className}
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
                title="No classes found"
                description="Create a class and assign sections with teachers to start organizing your school structure."
                action={
                  <Button variant="brand" onClick={openCreateModal}>
                    Add Class
                  </Button>
                }
              />
            }
          />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Class" description="Add a class section and assign its class teacher from the existing staff list.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Class Name"
            placeholder="Enter class name"
            error={errors.className?.message}
            {...register('className', {
              required: 'Class name is required',
              validate: (value) => value.trim().length > 0 || 'Class name is required',
            })}
          />
          <Select label="Section" error={errors.section?.message} {...register('section', { required: 'Section is required' })}>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </Select>
          <Select
            label="Class Teacher"
            error={errors.teacherId?.message}
            disabled={!teachers.length}
            {...register('teacherId', { required: 'Class teacher is required' })}
          >
            {teachers.length ? (
              teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))
            ) : (
              <option value="">No teachers available</option>
            )}
          </Select>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={!teachers.length}>
              Save Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
