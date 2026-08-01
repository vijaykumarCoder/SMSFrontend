import { useState } from 'react'
import { ArrowRight, Building2, ChevronLeft, Fingerprint, LoaderCircle, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import api from '../../utils/api'
import { AuthShowcase } from './AuthShowcase'

const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include letters, a number, and a special character.'

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

export function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'principal',
    organization_id: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isStrongPassword(formData.password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/users/create/', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        organization_id: Number(formData.organization_id),
      })

      setSuccess('Account created successfully. Redirecting to sign in...')
      window.setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error?.message ||
        'Unable to create account. Please check the details and try again.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_22%)]" />

      <div className="relative flex min-h-screen lg:h-screen lg:overflow-hidden">
        <section className="scrollbar-hidden flex min-h-screen w-full flex-col overflow-y-auto px-5 py-4 sm:px-8 sm:py-5 lg:w-[50%] lg:px-12 lg:py-6 xl:w-[52%] xl:px-16">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600">
                <Fingerprint size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-900">Finnger</p>
                <p className="text-xs text-slate-400">Secure school access</p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft size={16} />
              Back
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 lg:py-12">
            <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              Sign up
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
              Create your
              <br />
              school account
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Create a principal account for your organization and start managing school operations securely.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input
                type="text"
                name="name"
                icon={User}
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              <Input
                type="email"
                name="email"
                icon={Mail}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <Input
                type="password"
                name="password"
                icon={LockKeyhole}
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <Input
                type="password"
                name="confirmPassword"
                icon={LockKeyhole}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="rounded-2xl border-slate-200 shadow-sm"
                required
              >
                <option value="principal">Principal</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </Select>
              <Input
                type="number"
                name="organization_id"
                icon={Building2}
                placeholder="Organization ID"
                value={formData.organization_id}
                onChange={handleChange}
                min="1"
                required
              />

              {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
              {success ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <ShieldCheck size={16} />
                  {success}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="brand"
                className="mt-2 h-12 w-full rounded-2xl px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Creating Account' : 'Create Account'}
                {!isSubmitting ? <ArrowRight size={16} /> : null}
              </Button>
            </form>

            <p className="mt-8 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">
                Sign In
              </Link>
            </p>
          </div>
        </section>

        <AuthShowcase
          variant="signup"
          message="Create your account and start managing your school securely"
        />
      </div>
    </div>
  )
}
