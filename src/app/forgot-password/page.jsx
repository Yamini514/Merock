'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { forgotPassword } from '../../api/auth'
import { cn } from '../../utils/cn'
import logoUrl from '../../assets/logo.png'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email.trim())
      setSent(true)
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
          {sent ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, we've sent a link to reset your password.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">Forgot password?</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a link to reset it.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                        error ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20'
                      )}
                    />
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
                    : <><span>Send reset link</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <Link href="/login" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
