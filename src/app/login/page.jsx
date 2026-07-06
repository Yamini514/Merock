'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import logoUrl from '../../assets/logo.png'

// One-tap sign-in for the seeded sample accounts (scripts/seed.rb).
// Shown in development, or anywhere NEXT_PUBLIC_SHOW_DEMO_LOGINS=true —
// set it to false (or remove it) before a real production deployment.
const SHOW_DEMO_LOGINS =
  process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true' ||
  process.env.NODE_ENV === 'development'

const DEMO_ACCOUNTS = [
  { group: 'Staff console', accounts: [
    { label: 'Super Admin',          email: 'owner@example.com',       password: 'owner123'   },
    { label: 'Business Owner',       email: 'admin@example.com',       password: 'admin123'   },
    { label: 'Sales Manager 1',      email: 'agent@example.com',       password: 'agent123'   },
    { label: 'Sales Manager 2',      email: 'agent2@example.com',      password: 'agent2123'  },
    { label: 'Property Manager',     email: 'propman@example.com',     password: 'propman123' },
    { label: 'Referral Coordinator', email: 'coordinator@example.com', password: 'coord1234'  },
    { label: 'Read-only Viewer',     email: 'viewer@example.com',      password: 'viewer123'  },
  ]},
  { group: 'Portal', accounts: [
    { label: 'Client', email: 'user@example.com',   password: 'user1234'  },
    { label: 'Member', email: 'member@example.com', password: 'member123' },
  ]},
]

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { user, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const expired = searchParams.get('expired')

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(expired ? 'Your session has expired or was signed in elsewhere. Please sign in again.' : '')
  const [loading, setLoading] = useState(false)
  const [demoBusy, setDemoBusy] = useState(null) // email of the demo account currently signing in

  // Single source of truth for post-login navigation: once `user` is set
  // (whether from a fresh login or from an already-authenticated visit to
  // this page), redirect from an effect rather than mid-render. Calling
  // next/navigation's redirect() conditionally in the render body raced
  // against this same effect's underlying state update and corrupted
  // React's hook bookkeeping ("Rendered more hooks than during the
  // previous render"), which silently stranded users on /login even
  // though the login API call itself had already succeeded.
  useEffect(() => {
    if (!user) return
    const dest = redirectParam || user.redirect || '/'
    router.replace(dest)
  }, [user, redirectParam, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const result = await login(form.email.trim(), form.password)
    setLoading(false)
    if (result.error) setError(result.error)
    // On success, the effect above redirects once `user` updates.
  }

  // Demo auto-pick: fill the form (so the user sees what was picked) and
  // sign in immediately. Redirect happens via the same `user` effect.
  async function demoLogin(acc) {
    if (loading || demoBusy) return
    setError('')
    setNotice('')
    setForm({ email: acc.email, password: acc.password })
    setDemoBusy(acc.email)
    const result = await login(acc.email, acc.password)
    setDemoBusy(null)
    if (result.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Hero Panel — full treatment on every screen size, condensed on mobile ── */}
      <div className="relative flex flex-col justify-between gap-6 overflow-hidden p-6 sm:p-10 lg:p-12 lg:w-[55%] lg:min-h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-950/85 to-slate-900/90" />
        </div>

        {/* Ambient glow accents — slow, subtle motion so the panel never feels static */}
        <div className="absolute -top-16 -right-16 w-56 h-56 sm:w-96 sm:h-96 sm:-top-24 sm:-right-24 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 sm:w-80 sm:h-80 sm:-bottom-32 sm:-left-16 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <img src={logoUrl.src} alt="Rerock Realty" className="w-full h-full object-contain scale-[1.3]" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-xl font-bold leading-none">Rerock</p>
            <p className="text-indigo-300 text-[10px] font-bold tracking-[0.22em] mt-1">REALTY</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg animate-slide-up">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-3 sm:mb-5">
            India's Smartest<br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Real Estate
            </span>{' '}
            Platform
          </h1>
          <p className="hidden sm:block text-slate-300 text-base leading-relaxed mb-8 max-w-md">
            10,000+ verified listings. 500+ agents. 25 cities. Find, save, and close deals faster than ever.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[{ v: '10K+', l: 'Listings' }, { v: '500+', l: 'Agents' }, { v: '98%', l: 'Satisfaction' }].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5">
                <p className="text-base sm:text-2xl font-bold text-white">{s.v}</p>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block relative z-10 text-slate-600 text-xs">© 2026 Rerock Realty Pvt. Ltd.</div>
      </div>

      {/* ── Form Panel — rises over the hero as a rounded sheet on mobile ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-14 -mt-5 lg:mt-0 rounded-t-3xl lg:rounded-none bg-white shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:shadow-none overflow-y-auto">
        <div className="max-w-sm w-full mx-auto py-10 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">
            No account?{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
              Create one free
            </Link>
            {' '}· or{' '}
            <Link href="/" className="text-indigo-600 font-semibold hover:underline">
              browse publicly
            </Link>
          </p>

          {notice && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
              <p className="text-xs text-amber-700 font-medium">{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative group transition-transform duration-150 focus-within:-translate-y-0.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError('') }}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                    error ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20'
                  )}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group transition-transform duration-150 focus-within:-translate-y-0.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError('') }}
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                    error ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20'
                  )}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                <p className="text-xs text-rose-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-md shadow-indigo-600/20"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {SHOW_DEMO_LOGINS && (
            <div className="mt-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Sparkles size={11} className="text-indigo-400" /> Demo · one-tap sign in
                </span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>

              {DEMO_ACCOUNTS.map(group => (
                <div key={group.group} className="mb-3 last:mb-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{group.group}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.accounts.map(acc => {
                      const busy = demoBusy === acc.email
                      return (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => demoLogin(acc)}
                          disabled={loading || Boolean(demoBusy)}
                          className={cn(
                            'group flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all duration-150',
                            'disabled:opacity-60 disabled:cursor-wait',
                            busy
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/60 hover:-translate-y-0.5'
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
                              {acc.label}
                            </span>
                            <span className="block text-[10px] text-slate-400 truncate">{acc.email}</span>
                          </span>
                          {busy
                            ? <span className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shrink-0" />
                            : <ArrowRight size={11} className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                          }
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                Seeded sample accounts — every role lands on its own workspace with fixture data.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-5">
            <Link href="/register" className="text-indigo-500 hover:underline font-medium">Create account</Link>
            {' '}·{' '}
            <Link href="/" className="text-indigo-500 hover:underline font-medium">Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
