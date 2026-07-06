'use client'

import { useState } from 'react'
import { Mail, Phone, User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { updatePassword } from '../../../api/auth'
import { humanizeLabel, sanitizePhone } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const inputCls = (error) => cn(
  'w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
  error ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20'
)

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your account details and security</p>
        </div>

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 truncate">{user?.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-1">
                  {humanizeLabel(user?.role || '')}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                {user?.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>}
                {user?.phone_number && <span className="flex items-center gap-1.5"><Phone size={13} /> {user.phone_number}</span>}
              </div>
            </div>
          </div>
        </div>

        <EditProfileCard user={user} updateProfile={updateProfile} />
        <ChangePasswordCard />
      </div>
    </div>
  )
}

function EditProfileCard({ user, updateProfile }) {
  const [form, setForm] = useState({ full_name: user?.name || '', phone_number: user?.phone_number || '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Name is required.'); return }
    if (form.phone_number && !/^\d{10}$/.test(form.phone_number)) { setError('Enter a valid 10-digit phone number.'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    const result = await updateProfile({ full_name: form.full_name.trim(), phone_number: form.phone_number || null })
    setSaving(false)
    if (result.error) setError(result.error)
    else setSuccess('Profile updated successfully.')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Edit Profile</h3>
      <p className="text-slate-400 text-xs mb-5">Update your name and phone number</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className={inputCls(error)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel" inputMode="numeric" maxLength={10}
              placeholder="10-digit mobile number"
              value={form.phone_number}
              onChange={e => set('phone_number', sanitizePhone(e.target.value))}
              className={inputCls(error)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function ChangePasswordCard() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.current) { setError('Enter your current password.'); return }
    if (form.next.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (form.next !== form.confirm) { setError('New passwords do not match.'); return }
    setSaving(true)
    try {
      await updatePassword(form.current, form.next)
      setSuccess('Password updated successfully.')
      setForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err.message || 'Could not update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Change Password</h3>
      <p className="text-slate-400 text-xs mb-5">Use a strong password you don't use elsewhere</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {[
          { key: 'current', label: 'Current password', autoComplete: 'current-password' },
          { key: 'next',    label: 'New password',     autoComplete: 'new-password' },
          { key: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={show ? 'text' : 'password'}
                autoComplete={f.autoComplete}
                value={form[f.key]}
                onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setError('') }}
                className={inputCls(false)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {show ? 'Hide passwords' : 'Show passwords'}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ShieldCheck size={14} />
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
