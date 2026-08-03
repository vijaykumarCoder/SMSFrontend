import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  ShieldPlus,
  UserRound,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
const DEFAULT_ORGANIZATION_ID = localStorage.getItem("DEFAULT_ORGANIZATION_ID")

function TextAreaField({
  label,
  error,
  register,
  name,
  placeholder,
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <textarea
        {...register(name)}
        placeholder={placeholder}
        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </label>
  )
}

export function StudentRegistration() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: '',
      date_of_birth: '',
      class_name: '',
      father_name: '',
      phone_number: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      school_name: '',
      state: '',
      city: '',
      address: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const trimmedClassNumber = String(data.class_name ?? '').trim()
      const numericClassNumber = trimmedClassNumber.replace(/\D/g, '')
      const normalizedClassName = numericClassNumber ? `Class ${numericClassNumber}` : ''

      const payload = {
        organization_id: DEFAULT_ORGANIZATION_ID,
        student_name: data.full_name.trim(),
        class_name: normalizedClassName,
        father_name: data.father_name.trim(),
        father_phone_number: data.phone_number.trim(),
        emergency_name:
        data.emergency_contact_name.trim(),
        emergency_phone_number:
        data.emergency_contact_phone.trim(),
        date_of_birth: data.date_of_birth,
        
        // school_name: data.school_name.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        how_do_you_get_to_know: "Through application",
        gender:"male",
      }

      console.log('Payload =>', payload)

      const response = await axios.post(
        'http://127.0.0.1:8000/students/studentRegister/',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(response.data)

      reset()

      // navigate('/students')
    } catch (error) {
      console.error(error)

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        'Failed to register student'

      console.log(errorMessage)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_54%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">

        <div className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-brand-600 text-white">
              <ShieldPlus size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-700">
                Admissions Desk
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Student Registration Form
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Capture student and guardian information before enrollment.
              </p>
            </div>
          </div>

          <Link
            to="/registered-students"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
          >
            <ArrowLeft size={16} />
            Back to Registered students
          </Link>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

          <aside className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#1e293b_0%,#0f172a_100%)] p-6 text-white">

            <div className="space-y-4">

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <UserRound size={22} />

                <h2 className="mt-3 text-lg font-semibold">
                  Student Profile
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  Add student information and academic details.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <Users size={22} />

                <h2 className="mt-3 text-lg font-semibold">
                  Guardian Information
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  Maintain parent and emergency contact details.
                </p>
              </div>

            </div>
          </aside>

          <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)]">

            <form
              className="space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >

              <div className="grid gap-4 md:grid-cols-2">

                <Input
                  label="Full Name"
                  icon={UserRound}
                  error={errors.full_name?.message}
                  {...register('full_name', {
                    required: 'Full Name is required',
                  })}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  error={errors.date_of_birth?.message}
                  {...register('date_of_birth', {
                    required: 'Date of Birth is required',
                  })}
                />

                <Input
                  label="Class"
                  placeholder="Enter class number"
                  error={errors.class_name?.message}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  {...register('class_name', {
                    required: 'Class is required',
                    validate: (value) => {
                      const normalized = String(value ?? '').trim()
                      return normalized.length > 0 || 'Class is required'
                    },
                  })}
                />

                <Input
                  label="Father Name"
                  icon={Users}
                  error={errors.father_name?.message}
                  {...register('father_name', {
                    required: 'Father Name is required',
                  })}
                />

                <Input
                  label="Phone Number"
                  icon={Phone}
                  error={errors.phone_number?.message}
                  {...register('phone_number', {
                    required: 'Phone Number is required',
                  })}
                />

                <Input
                  label="Emergency Contact Name"
                  icon={Users}
                  error={
                    errors.emergency_contact_name?.message
                  }
                  {...register('emergency_contact_name', {
                    required:
                      'Emergency Contact Name is required',
                  })}
                />

                <Input
                  label="Emergency Contact Phone"
                  icon={Phone}
                  error={
                    errors.emergency_contact_phone?.message
                  }
                  {...register('emergency_contact_phone', {
                    required:
                      'Emergency Contact Phone is required',
                  })}
                />

                <Input
                  label="School Name"
                  icon={Building2}
                  error={errors.school_name?.message}
                  {...register('school_name', {
                    required: 'School Name is required',
                  })}
                />

                <Input
                  label="State"
                  icon={MapPin}
                  error={errors.state?.message}
                  {...register('state', {
                    required: 'State is required',
                  })}
                />

                <Input
                  label="City"
                  icon={MapPin}
                  error={errors.city?.message}
                  {...register('city', {
                    required: 'City is required',
                  })}
                />

              </div>

              <TextAreaField
                label="Address"
                name="address"
                register={register}
                error={errors.address?.message}
                placeholder="Enter complete address"
              />

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <Link
                  to="/registered-students"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium"
                >
                  Cancel
                </Link>

                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Registering...'
                    : 'Register'}

                  <ArrowRight size={16} />
                </Button>

              </div>

            </form>

          </section>

        </div>
      </div>
    </div>
  )
}
// import { ArrowLeft, ArrowRight, Building2, Phone, ShieldPlus, UserRound, Users } from 'lucide-react'
// import { Link, useNavigate } from 'react-router-dom'
// import { Button } from '../../components/ui/Button'
// import { Input } from '../../components/ui/Input'

// function TextAreaField({ label, ...props }) {
//   return (
//     <label className="block space-y-2">
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//       <textarea
//         className="min-h-[128px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
//         {...props}
//       />
//     </label>
//   )
// }

// export function StudentRegistration() {
//   const navigate = useNavigate()

//   const handleSubmit = (event) => {
//     event.preventDefault()
//     navigate('/students')
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_54%,#ffffff_100%)]">
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%)]" />
//       <div className="pointer-events-none absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-brand-100/70 blur-3xl" />
//       <div className="pointer-events-none absolute bottom-8 right-[-4rem] h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />

//       <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
//         <div className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur sm:p-6 lg:flex-row lg:items-center lg:justify-between">
//           <div className="flex items-start gap-4">
//             <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-brand-600 text-white shadow-lg shadow-brand-500/25">
//               <ShieldPlus size={24} />
//             </div>
//             <div>
//               <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-700">Admissions Desk</p>
//               <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
//                 Student registration form
//               </h1>
//               <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
//                 Capture essential student and guardian details before assigning them to the academic system.
//               </p>
//             </div>
//           </div>

//           <Link
//             to="/students"
//             className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
//           >
//             <ArrowLeft size={16} />
//             Back to students
//           </Link>
//         </div>

//         <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
//           <aside className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#1e293b_0%,#0f172a_100%)] p-6 text-white shadow-[0_28px_70px_-34px_rgba(15,23,42,0.6)]">
//             <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
//               Registration notes
//             </span>

//             <div className="mt-8 space-y-4">
//               <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
//                   <UserRound size={20} />
//                 </div>
//                 <h2 className="mt-4 text-lg font-semibold">Student profile</h2>
//                 <p className="mt-2 text-sm leading-6 text-slate-300">
//                   Add the student name, class, school, and address so the profile is ready for enrollment review.
//                 </p>
//               </div>

//               <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
//                   <Users size={20} />
//                 </div>
//                 <h2 className="mt-4 text-lg font-semibold">Guardian contacts</h2>
//                 <p className="mt-2 text-sm leading-6 text-slate-300">
//                   Keep primary and emergency contacts complete so the school can reach the family quickly when needed.
//                 </p>
//               </div>

//               <div className="rounded-[24px] border border-dashed border-white/15 bg-brand-500/10 p-4">
//                 <p className="text-sm font-medium text-white">Recommended flow</p>
//                 <p className="mt-2 text-sm leading-6 text-slate-300">
//                   Review phone numbers before submitting. The class field is intentionally a free text input.
//                 </p>
//               </div>
//             </div>
//           </aside>

//           <section className="rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)] backdrop-blur sm:p-6 lg:p-8">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Student details</p>
//                 <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">New admission entry</h2>
//               </div>
//               <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
//                 <Building2 size={14} />
//                 School intake
//               </div>
//             </div>

//             <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//               <div className="grid gap-4 md:grid-cols-2">
//                 <Input label="Full name" type="text" icon={UserRound} name="fullName" placeholder="Enter student full name" />
//                 <Input label="Class" type="text" name="className" placeholder="Example: Class 8" />
//                 <Input label="Father name" type="text" icon={Users} name="fatherName" placeholder="Enter father name" />
//                 <Input label="Phone number" type="tel" icon={Phone} name="phoneNumber" placeholder="+91 98765 43210" />
//                 <Input label="Emergency contact name" type="text" icon={Users} name="emergencyName" placeholder="Enter emergency contact name" />
//                 <Input label="Emergency contact phone" type="tel" icon={Phone} name="emergencyPhone" placeholder="+91 98765 43210" />
//                 <Input label="School code" type="text" icon={Building2} name="schoolName" placeholder="Enter school code" />
//                 {/* <Input label="School name" type="text" icon={Building2} name="schoolName" placeholder="Enter school name" /> */}
//               </div>

//               <TextAreaField label="Address" name="address" placeholder="Enter full home address" />

//               <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
//                 <p className="text-sm text-slate-500"></p>
//                 <div className="flex flex-col gap-3 sm:flex-row">
//                   <Link
//                     to="/students"
//                     className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
//                   >
//                     Cancel
//                   </Link>
//                   <Button type="submit" variant="brand" className="h-11 rounded-2xl px-6">
//                     Save Registration
//                     <ArrowRight size={16} />
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </section>
//         </div>
//       </div>
//     </div>
//   )
// }
