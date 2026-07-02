'use client'

import { useState } from 'react'
import { useRouter, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Eye, EyeOff, Lock, Mail, Phone, User,
  ArrowRight, Users, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const ROLE_OPTIONS = [
  {
    value: 'client',
    label: 'Property Buyer / Tenant',
    description: 'Browse listings, save favourites, get alerts',
    icon: User,
    gradient: 'from-emerald-500 to-teal-600',
    activeBorder: 'border-emerald-400',
    activeBg: 'bg-emerald-50',
  },
  {
    value: 'member',
    label: 'Referral Member',
    description: 'Earn rewards by referring buyers & tenants',
    icon: Users,
    gradient: 'from-amber-500 to-orange-500',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-50',
  },
]

function passwordStrength(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score: 1, label: 'Weak',        bar: 'bg-rose-500',    text: 'text-rose-600'    }
  if (score === 2) return { score: 2, label: 'Fair',        bar: 'bg-amber-500',   text: 'text-amber-600'   }
  if (score === 3) return { score: 3, label: 'Good',        bar: 'bg-blue-500',    text: 'text-blue-600'    }
  if (score === 4) return { score: 4, label: 'Strong',      bar: 'bg-emerald-500', text: 'text-emerald-600' }
  return              { score: 5, label: 'Very Strong',  bar: 'bg-emerald-600', text: 'text-emerald-700' }
}

function inputCls(hasError) {
  return cn(
    'w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/20'
      : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20',
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const { user, register } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '',
    role: '', terms: false,
  })
  const [showPw, setShowPw]            = useState(false)
  const [showConfirm, setShowConfirm]  = useState(false)
  const [errors, setErrors]            = useState({})
  const [loading, setLoading]          = useState(false)
  const [success, setSuccess]          = useState(false)

  if (user) redirect(user.redirect || '/')

  const strength = passwordStrength(form.password)

  function setField(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }))
  }

  function validate() {
    const e = {}
    const name = form.name.trim()
    if (!name) e.name = 'Full name is required.'
    else if (name.length < 2) e.name = 'Name must be at least 2 characters.'
    else if (!/^[A-Za-z\s]+$/.test(name)) e.name = 'Name can only contain letters and spaces.'

    if (!form.email.trim()) e.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'

    const phone = form.phone.trim()
    if (!phone) e.phone = 'Phone number is required.'
    else if (!/^[6-9]\d{9}$/.test(phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.'

    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    else if (strength && strength.score < 2) e.password = 'Too weak — add uppercase letters or numbers.'

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'

    if (!form.role) e.role = 'Please select an account type.'
    if (!form.terms) e.terms = 'You must accept the terms to continue.'
    return e
  }

  async function handleSubmit(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
    })
    setLoading(false)

    if (result.error) {
      setErrors({ email: result.error })
      return
    }

    setSuccess(true)
    await new Promise(r => setTimeout(r, 1400))
    router.replace(result.user.redirect || '/')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="text-center px-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-500 text-sm mb-4">Welcome aboard. Redirecting to your dashboard…</p>
          <span className="inline-block w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-violet-950/85 to-slate-900/90" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-xl font-bold leading-none">Merock</p>
            <p className="text-indigo-400 text-[10px] font-bold tracking-widest mt-0.5">REALTY</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
            Join India's<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Fastest Growing
            </span>
            <br />Real Estate Community
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
            Create your free account and start exploring premium properties across 25+ cities.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🏠', text: 'Access 10,000+ verified property listings' },
              { icon: '🔔', text: 'Set custom price & location alerts' },
              { icon: '💰', text: 'Earn rewards through our referral program' },
              { icon: '📊', text: 'Track all enquiries from one dashboard' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-3">
                <span className="text-xl shrink-0">{b.icon}</span>
                <p className="text-slate-300 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-600 text-xs">© 2024 Merock Realty Pvt. Ltd.</div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 lg:px-14 bg-white overflow-y-auto">
        <div className="max-w-lg w-full mx-auto py-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Merock</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-7">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in →
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name}>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={inputCls(errors.name)}
                  />
                </div>
              </Field>

              <Field label="Phone Number" error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value.replace(/\D/g, ''))}
                    className={inputCls(errors.phone)}
                  />
                </div>
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className={inputCls(errors.email)}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  className={cn(inputCls(errors.password), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && strength && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          strength.score >= i ? strength.bar : 'bg-slate-100',
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn('text-xs font-semibold', strength.text)}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={e => setField('confirmPassword', e.target.value)}
                  className={cn(inputCls(errors.confirmPassword), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirmPassword && form.password && !errors.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-600 font-medium">Passwords match</p>
                </div>
              )}
            </Field>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Account Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  const active = form.role === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('role', opt.value)}
                      className={cn(
                        'text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                        active
                          ? `${opt.activeBorder} ${opt.activeBg}`
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70',
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2.5 shadow-sm',
                        opt.gradient,
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.description}</p>
                    </button>
                  )
                })}
              </div>
              {errors.role && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-600 font-medium">{errors.role}</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div>
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setField('terms', !form.terms)}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all',
                    form.terms
                      ? 'bg-indigo-600 border-indigo-600'
                      : errors.terms
                        ? 'border-rose-400 bg-white'
                        : 'border-slate-300 bg-white hover:border-indigo-400',
                  )}
                >
                  {form.terms && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-600 leading-relaxed select-none">
                  I agree to the{' '}
                  <span className="text-indigo-600 font-semibold">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-indigo-600 font-semibold">Privacy Policy</span>
                </span>
              </div>
              {errors.terms && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-600 font-medium">{errors.terms}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            <Link href="/" className="text-indigo-500 hover:underline font-medium">← Back to website</Link>
            {' '}· No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}
