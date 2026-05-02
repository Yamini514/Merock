import { useState } from 'react'
import { useNavigate, Navigate, useSearchParams, Link } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, Shield, User, ArrowRight, Users, Star } from 'lucide-react'
import { useAuth, CREDENTIALS } from '../context/AuthContext'
import { cn } from '../utils/cn'

const ROLE_META = {
  admin:  { color: 'from-indigo-600 to-violet-600', badge: 'bg-indigo-100 text-indigo-700', icon: Shield,  label: 'Admin' },
  agent:  { color: 'from-blue-600 to-cyan-600',     badge: 'bg-blue-100 text-blue-700',     icon: Star,    label: 'Agent' },
  client: { color: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-100 text-emerald-700', icon: User,  label: 'Client' },
  member: { color: 'from-amber-500 to-orange-500',  badge: 'bg-amber-100 text-amber-700',   icon: Users,   label: 'Member' },
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    const dest = redirectParam || user.redirect || '/'
    return <Navigate to={dest} replace />
  }

  function fillDemo(cred) {
    setForm({ email: cred.email, password: cred.password })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.email.trim(), form.password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    const dest = redirectParam || result.user.redirect || '/'
    navigate(dest, { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-950/85 to-slate-900/90" />
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
            India's Smartest<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Real Estate
            </span>{' '}
            Platform
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
            10,000+ verified listings. 500+ agents. 25 cities. Find, save, and close deals faster than ever.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ v: '10K+', l: 'Listings' }, { v: '500+', l: 'Agents' }, { v: '98%', l: 'Satisfaction' }].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{s.v}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-600 text-xs">© 2024 Merock Realty Pvt. Ltd.</div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-14 bg-white overflow-y-auto">
        <div className="max-w-sm w-full mx-auto py-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Merock</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Create one free
            </Link>
            {' '}· or{' '}
            <Link to="/" className="text-indigo-600 font-semibold hover:underline">
              browse publicly
            </Link>
          </p>

          {/* Demo credential grid */}
          <div className="grid grid-cols-2 xs:grid-cols-2 gap-2.5 mb-6">
            {CREDENTIALS.map(cred => {
              const meta = ROLE_META[cred.role]
              const Icon = meta.icon
              return (
                <button
                  key={cred.role}
                  onClick={() => fillDemo(cred)}
                  className="group text-left p-3 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 shadow-sm', meta.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{meta.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cred.email}</p>
                  <span className={cn('mt-1.5 inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-full', meta.badge)}>
                    Use →
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or enter credentials</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">Quick access credentials</p>
            <div className="space-y-1.5">
              {CREDENTIALS.map(c => (
                <div key={c.role} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className={cn('font-bold w-14 shrink-0', ROLE_META[c.role].badge.split(' ')[1])}>{ROLE_META[c.role].label}</span>
                  <span className="font-mono text-slate-400 break-all">{c.email}</span>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <span className="font-mono">{c.password}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            <Link to="/register" className="text-indigo-500 hover:underline font-medium">Create account</Link>
            {' '}·{' '}
            <Link to="/" className="text-indigo-500 hover:underline font-medium">Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
