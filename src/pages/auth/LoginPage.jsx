import { Check, ChevronLeft, Fingerprint, LockKeyhole, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AuthShowcase } from './AuthShowcase'

export function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_22%)]" />

      <div className="relative flex h-screen overflow-hidden">
        <section className="flex h-screen w-full flex-col overflow-hidden px-5 py-4 sm:px-8 sm:py-5 lg:w-[50%] lg:px-12 lg:py-6 xl:w-[52%] xl:px-16">
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
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft size={16} />
              Back
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              Sign in
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
              Holla,
              <br />
              Welcome Back
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Hey, welcome back to your special place. Sign in to manage students, staff, reports, and campus updates.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input type="email" icon={Mail} placeholder="stanley@gmail.com" defaultValue="stanley@gmail.com" />
              <Input type="password" icon={LockKeyhole} placeholder="Enter password" defaultValue="password12345" />

              <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-slate-500">
                  <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-md bg-brand-600 text-white shadow-sm shadow-brand-500/30">
                    <input type="checkbox" defaultChecked className="peer absolute inset-0 cursor-pointer opacity-0" />
                    <Check size={14} className="pointer-events-none" />
                  </span>
                  Remember me
                </label>
                <button type="button" className="text-left font-medium text-slate-500 transition hover:text-brand-600">
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" variant="brand" className="mt-2 h-12 min-w-[132px] rounded-2xl px-8">
                Sign In
              </Button>
            </form>

            <p className="mt-8 text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-brand-600 transition hover:text-brand-700">
                Sign Up
              </Link>
            </p>
          </div>
        </section>

        <AuthShowcase />
      </div>
    </div>
  )
}
