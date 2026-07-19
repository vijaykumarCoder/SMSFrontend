import axios from 'axios'
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Mail,
    MapPin,
    Phone,
    School,
    ShieldPlus,
    UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

function TextAreaField({
    label,
    error,
    register,
    name,
    placeholder,
}) {
    return (<label className="block space-y-2"> <span className="text-sm font-medium text-slate-700">
        {label} </span>


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

export function SchoolRegistration() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            school_name: '',
            registration_code: '',
            email: '',
            phone: '',
            state: '',
            city: '',
            zipcode: '',
            address: '',
        },
    })

    const onSubmit = async (data) => {
        try {
            const payload = {
                school_name: data.school_name.trim(),
                school_code: data.registration_code.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone.trim(),
                state: data.state.trim(),
                city: data.city.trim(),
                zipcode: data.zipcode.trim(),
                school_address: data.address.trim(),
            }


            console.log('Payload =>', payload)

            const response = await axios.post(
                'http://127.0.0.1:8000/organizations/createOrganization',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            console.log(response.data)

            // alert('School registered successfully')

            reset()

            navigate('/schools')
        } catch (error) {
            console.error(error)

            const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                'Failed to register school'

            console.log(errorMessage)
        }


    }

    return (<div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_54%,#ffffff_100%)]">


        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">

            <div className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-brand-600 text-white">
                        <School size={24} />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-700">
                            School Onboarding
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                            School Registration Form
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                            Register a new school and configure the institution profile.
                        </p>
                    </div>
                </div>

                <Link
                    to="/schools"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
                >
                    <ArrowLeft size={16} />
                    Back to Schools
                </Link>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">

                <aside className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#1e293b_0%,#0f172a_100%)] p-6 text-white">

                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                            <Building2 size={22} />
                            <h2 className="mt-3 text-lg font-semibold">
                                School Information
                            </h2>
                            <p className="mt-2 text-sm text-slate-300">
                                Add institution details and contact information.
                            </p>
                        </div>

                        {/* <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                            <UserRound size={22} />
                            <h2 className="mt-3 text-lg font-semibold">
                                Principal Details
                            </h2>
                            <p className="mt-2 text-sm text-slate-300">
                                Configure the school administrator account.
                            </p>
                        </div> */}
                    </div>
                </aside>

                <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.24)]">

                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >

                        <div className="grid gap-4 md:grid-cols-2">

                            <Input
                                label="School Name"
                                icon={Building2}
                                error={errors.school_name?.message}
                                {...register('school_name', {
                                    required: 'School name is required',
                                })}
                            />

                            <Input
                                label="School Registration Number"
                                icon={School}
                                error={errors.registration_code?.message}
                                {...register('registration_code', {
                                    required: 'School Registration Number is required',
                                })}
                            />

                            <Input
                                label="Email"
                                icon={Mail}
                                type="email"
                                error={errors.email?.message}
                                {...register('email', {
                                    required: 'Email is required',
                                })}
                            />

                            <Input
                                label="Phone Number"
                                icon={Phone}
                                error={errors.phone?.message}
                                {...register('phone', {
                                    required: 'Phone number is required',
                                })}
                            />

                            <Input
                                label="State"
                                icon={MapPin}
                                error={errors.state?.message}
                                {...register('state', {
                                    required: 'state is required',
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

                            <Input
                                label="Zip Code"
                                icon={MapPin}
                                error={errors.zipcode?.message}
                                {...register('zipcode', {
                                    required: 'Zip code is required',
                                })}
                            />

                        </div>

                        <TextAreaField
                            label="School Address"
                            name="address"
                            register={register}
                            error={errors.address?.message}
                            placeholder="Enter complete school address"
                        />

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                            <Link
                                to="/schools"
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
                                    : 'Register School'}

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
