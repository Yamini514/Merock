'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { validatePasswordToken, resetPassword } from '../../api/auth'
import { cn } from '../../utils/cn'
import logoUrl from '../../assets/logo.png'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [checking, setChecking] = useState(Boolean(token))
  const [valid, setValid]       = useState(false)
  const [form, setForm]         = useState({ password: '', confirm: '' })
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (!token) return
    validatePasswordToken(token)
      .then(() => setValid(true))
      .catch(() => setValid(false))
      .finally(() => setChecking(false))
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')
    try {
      await resetPassword(token, form.password)
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center overflow-hidden mb-3">
            <img src={logoUrl.src} alt="Rerock Realty" className="w-full h-full object-contain scale-[1.3]" />
          </div>
          <span className="text-lg font-bold text-slate-900 leading-none">Rerock</span>
          <span className="text-[9px] font-semibold tracking-[0.22em] text-slate-400 mt-0.5">REALTY</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7">
          {checking ? (
            <div className="py-10 flex justify-center">
              <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : done ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Password reset</h2>
              <p className="text-slate-500 text-sm">Redirecting you to sign in…</p>
            </div>
          ) : !valid ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Link expired or invalid</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">This password reset link is no longer valid. Request a new one to continue.</p>
              <Link href="/forgot-password" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                Request new link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">Set a new password</h2>
              <p className="text-slate-500 text-sm mb-6">Choose a strong password you haven't used before.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError('') }}
                      className={cn(
                        'w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                        error ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20'
                      )}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    : <><span>Reset password</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
