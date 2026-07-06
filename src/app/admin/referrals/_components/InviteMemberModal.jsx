'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import ErrorBanner from '../../../../components/ErrorBanner'
import { createMember } from '../../../../api/members'
import { useMasterOptions } from '../../../../hooks/useMasterOptions'
import { sanitizePhone } from '../../../../utils/formatters'
import { cn } from '../../../../utils/cn'

// Fallback mirroring the backend constant — live options come from master
// data (Settings → Master Data) via useMasterOptions.
const MEMBER_TYPES = [
  { value: 'source', label: 'General Referrer' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'investor', label: 'Investor' },
]

const EMPTY_MEMBER = { name: '', email: '', phone: '', member_type: 'source', relationship_notes: '', password: '', confirm_password: '' }

export default function InviteMemberModal({ onClose, onCreated }) {
  const memberTypeOptions = useMasterOptions('member_types', MEMBER_TYPES)
  const [form, setForm] = useState(EMPTY_MEMBER)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [grantLogin, setGrantLogin] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  function setField(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number'
    if (grantLogin) {
      if (!form.email.trim()) e.email = 'Email is required to grant portal login'
      if (!form.password.trim()) e.password = 'Password is required'
      else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
      if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    }
    return e
  }

  async function handleInvite(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    setSaveErr('')
    try {
      await createMember({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        member_type: form.member_type,
        relationship_notes: form.relationship_notes || null,
        password: grantLogin ? form.password : null,
      })
      onCreated()
    } catch (e) {
      setSaveErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite Referral Member"
      subtitle="Add a new long-term referral partner"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} disabled={saving}>{saving ? 'Saving…' : 'Invite Member'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <ErrorBanner message={saveErr} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormInput label="Full Name" value={form.name} onChange={e => setField('name', e.target.value)}
            placeholder="e.g. Kiran Rao" error={errors.name} required />
          <FormInput label="Phone" type="tel" inputMode="numeric" maxLength={10}
            value={form.phone} onChange={e => setField('phone', sanitizePhone(e.target.value))}
            placeholder="10-digit mobile number" error={errors.phone} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormInput label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)}
            placeholder="name@example.com" error={errors.email} required={grantLogin} />
          <Select label="Member Type" value={form.member_type} onChange={e => setField('member_type', e.target.value)}
            options={memberTypeOptions} />
        </div>
        <Textarea label="Notes" value={form.relationship_notes} onChange={e => setField('relationship_notes', e.target.value)}
          placeholder="How you know this person, referral history…" rows={3} />

        <button
          type="button"
          onClick={() => setGrantLogin(v => !v)}
          className={cn(
            'w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150',
            grantLogin ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150',
            grantLogin ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          )}>
            <KeyRound size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-semibold transition-colors', grantLogin ? 'text-indigo-700' : 'text-slate-700')}>Grant portal login</p>
            <p className="text-xs text-slate-400 mt-0.5">Lets this member sign in and track their own referrals at /app/referrals.</p>
          </div>
          <span className={cn('w-9 h-5 rounded-full shrink-0 relative transition-colors duration-150 mt-0.5', grantLogin ? 'bg-indigo-600' : 'bg-slate-200')}>
            <span className={cn(
              'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-150',
              grantLogin ? 'translate-x-[18px]' : 'translate-x-0.5'
            )} />
          </span>
        </button>

        {grantLogin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-slide-down">
            <FormInput
              label="Password" type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => setField('password', e.target.value)}
              placeholder="Min. 6 characters" error={errors.password} required
              suffix={
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <FormInput
              label="Confirm Password" type={showConfirmPw ? 'text' : 'password'} value={form.confirm_password}
              onChange={e => setField('confirm_password', e.target.value)}
              placeholder="Re-enter password" error={errors.confirm_password} required
              suffix={
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPw(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
