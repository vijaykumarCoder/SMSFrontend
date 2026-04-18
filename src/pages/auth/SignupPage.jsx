import { ArrowRight, Check, ChevronLeft, Fingerprint, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AuthShowcase } from './AuthShowcase'

export function SignupPage() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/dashboard')
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
              Set up your workspace to manage students, teachers, schedules, reports, and campus communication in one place.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input type="text" icon={User} placeholder="Full name" defaultValue="Stanley Morgan" />
              <Input type="email" icon={Mail} placeholder="School email" defaultValue="stanley@gmail.com" />
              <Input type="tel" icon={Phone} placeholder="Phone number" defaultValue="+91 98765 43210" />
              <Input type="password" icon={LockKeyhole} placeholder="Create password" defaultValue="password12345" />
              <Input type="password" icon={LockKeyhole} placeholder="Confirm password" defaultValue="password12345" />

              <label className="inline-flex items-start gap-3 text-sm text-slate-500">
                <span className="relative mt-0.5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-md bg-brand-600 text-white shadow-sm shadow-brand-500/30">
                  <input type="checkbox" defaultChecked className="peer absolute inset-0 cursor-pointer opacity-0" />
                  <Check size={14} className="pointer-events-none" />
                </span>
                I agree to the terms of service and privacy policy for secure school access.
              </label>

              <Button type="submit" variant="brand" className="mt-2 h-12 w-full rounded-2xl px-8">
                Create Account
                <ArrowRight size={16} />
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
