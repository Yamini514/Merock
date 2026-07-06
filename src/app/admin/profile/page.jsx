'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Phone, ShieldCheck } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card, { CardHeader } from '../../../components/Card'
import Avatar from '../../../components/Avatar'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import { updatePassword } from '../../../api/auth'
import { useAuth } from '../../../context/AuthContext'
import { humanizeLabel } from '../../../utils/formatters'

export default function ProfilePage() {
  const { user } = useAuth()
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
    if (form.next.length < 8) { setError('New password must be at least 8 characters.'); return }
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

  const inputCls = 'w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-indigo-400 focus:ring-indigo-500/20 transition-all'

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-3xl">
      <PageHeader title="My Profile" subtitle="Your account details and security" breadcrumb={['Home', 'Profile']} />

      {/* Identity card */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || 'U'} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <Badge status={humanizeLabel(user?.role || '')} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
              {user?.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>}
              {user?.phone_number && <span className="flex items-center gap-1.5"><Phone size={13} /> {user.phone_number}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader title="Change Password" subtitle="Use a strong password you don't use elsewhere" />

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
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
                  className={inputCls}
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

          <Button type="submit" disabled={saving} className="w-full sm:w-auto justify-center">
            <ShieldCheck size={14} />
            {saving ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
