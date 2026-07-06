'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ShieldCheck, Crown, Briefcase, User, Users, Eye, EyeOff, Building2, Share2 } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card, { CardHeader } from '../../../../components/Card'
import Badge from '../../../../components/Badge'
import FormInput from '../../../../components/FormInput'
import Button from '../../../../components/Button'
import ErrorBanner from '../../../../components/ErrorBanner'
import OptionPicker from '../../../../components/OptionPicker'
import { getUser, createUser, updateUser } from '../../../../api/users'
import { cn } from '../../../../utils/cn'
import { getInitials, sanitizePhone } from '../../../../utils/formatters'

const ROLE_GROUPS = [
  {
    label: 'Staff Access',
    hint: 'Internal admin console',
    roles: [
      { value: 'super_admin',          label: 'Super Admin',          icon: Crown,       gradient: 'from-violet-500 to-purple-600' },
      { value: 'admin',                label: 'Business Owner',       icon: ShieldCheck, gradient: 'from-indigo-500 to-blue-600' },
      { value: 'agent',                label: 'Sales Manager',        icon: Briefcase,   gradient: 'from-sky-500 to-cyan-600' },
      { value: 'property_manager',     label: 'Property Manager',     icon: Building2,   gradient: 'from-teal-500 to-emerald-600' },
      { value: 'referral_coordinator', label: 'Referral Coordinator', icon: Share2,      gradient: 'from-orange-500 to-amber-500' },
      { value: 'viewer',               label: 'Read-only Viewer',     icon: Eye,         gradient: 'from-slate-500 to-slate-700' },
    ],
  },
  {
    label: 'Portal Access',
    hint: 'Public-facing accounts',
    roles: [
      { value: 'client', label: 'Client', icon: User,  gradient: 'from-emerald-500 to-teal-600' },
      { value: 'member', label: 'Member', icon: Users, gradient: 'from-amber-500 to-orange-500' },
    ],
  },
]

const ALL_ROLES = ROLE_GROUPS.flatMap(g => g.roles)

const ROLE_INFO = {
  super_admin: {
    tagline: 'Full access — the only role that can manage other accounts.',
    can: ['Manage users & roles', 'See confidential owner/source data', 'Everything Admin can do'],
  },
  admin: {
    tagline: 'Business Owner — runs day-to-day operations across the whole business.',
    can: ['Manage properties, clients, referrals', 'View dashboards & reports', 'Tune matching weights & elite tiers', 'Cannot manage user accounts'],
  },
  agent: {
    tagline: 'Sales Manager — operational access, scoped to assigned and shared records.',
    can: ['Manage assigned clients, enquiries & follow-ups', 'Work the shared team pool', 'Cannot see confidential owner data', 'Cannot manage members/referrals'],
  },
  property_manager: {
    tagline: 'Property Manager — property-focused access to the full catalogue.',
    can: ['Add & update property records and media', 'Import property data', 'Own follow-ups', 'Cannot manage clients, members or referrals'],
  },
  referral_coordinator: {
    tagline: 'Referral Coordinator — member/referral-focused access.',
    can: ['Manage member profiles & referral intake', 'Track referral statuses & tiers', 'Own follow-ups', 'Cannot manage properties or clients'],
  },
  viewer: {
    tagline: 'Read-only Viewer — reviews dashboards and data, changes nothing.',
    can: ['View dashboards, lists & detail pages', 'No create/edit/delete anywhere', 'No exports or imports'],
  },
  client: {
    tagline: 'Portal account for a buyer or tenant — no access to the admin console.',
    can: ['Browse listings & save favourites', 'Track their own enquiries', 'Cannot access /admin at all'],
  },
  member: {
    tagline: 'Referral partner earning rewards for buyer/tenant referrals.',
    can: ['Submit & track referrals', 'View referral earnings', 'Cannot access /admin at all'],
  },
}

const EMPTY = { full_name: '', email: '', phone_number: '', role: 'agent', password: '', confirm_password: '' }

function toForm(u) {
  return { ...EMPTY, full_name: u.full_name ?? '', email: u.email ?? '', phone_number: u.phone_number ?? '', role: u.role ?? 'agent' }
}

export default function AddEditUserForm() {
  const router = useRouter()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getUser(id).then(u => setForm(toForm(u))).catch(e => setLoadErr(e.message))
  }, [id, isEdit])

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'A valid email is required'
    if (form.phone_number && !/^\d{10}$/.test(form.phone_number)) e.phone_number = 'Enter a valid 10-digit phone number'
    if (!form.role) e.role = 'Role is required'
    if (!isEdit && !form.password.trim()) e.password = 'Password is required'
    if (form.password && form.password.length > 0 && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password && form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  async function handleSubmit(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setLoadErr('')
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        role: form.role,
      }
      if (form.password) payload.password = form.password
      if (isEdit) await updateUser(id, payload)
      else        await createUser(payload)
      router.push('/admin/users')
    } catch (e) {
      setLoadErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const activeRole = ROLE_INFO[form.role] ?? ROLE_INFO.agent
  const activeRoleMeta = ALL_ROLES.find(r => r.value === form.role) ?? ALL_ROLES[2]
  const ActiveIcon = activeRoleMeta.icon

  return (
    <div className="max-w-5xl animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit User' : 'Add New User'}
        subtitle={isEdit ? `Editing: ${form.full_name || '…'}` : 'Create a new staff account'}
        breadcrumb={['Users & Roles', isEdit ? 'Edit' : 'Add New']}
      />

      <ErrorBanner message={loadErr} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Full Name" id="full_name" value={form.full_name} onChange={e => set('full_name', e.target.value)}
              placeholder="e.g. Priya Sharma" error={errors.full_name} required wrapperClass="sm:col-span-2" />
            <FormInput label="Email" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="name@rerockrealty.com" error={errors.email} required />
            <FormInput label="Phone Number" id="phone_number" type="tel" inputMode="numeric" maxLength={10}
              value={form.phone_number} onChange={e => set('phone_number', sanitizePhone(e.target.value))}
              placeholder="10-digit mobile number" error={errors.phone_number} />

            <div className="sm:col-span-2">
              <OptionPicker
                label="Role"
                required
                error={errors.role}
                groups={ROLE_GROUPS.map(g => ({ label: g.label, hint: g.hint, options: g.roles }))}
                value={form.role}
                onChange={v => set('role', v)}
                columns={3}
              />
            </div>

            <FormInput
              label={isEdit ? 'New Password' : 'Password'}
              id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
              placeholder={isEdit ? 'Leave blank to keep current password' : 'Min. 6 characters'}
              error={errors.password} required={!isEdit}
              hint={isEdit ? 'Only fill this in to change the password.' : undefined}
              suffix={
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <FormInput
              label={isEdit ? 'Confirm New Password' : 'Confirm Password'}
              id="confirm_password" type={showConfirmPw ? 'text' : 'password'} value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
              placeholder="Re-enter password"
              error={errors.confirm_password} required={!isEdit || form.password.length > 0}
              suffix={
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPw(v => !v)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => router.push('/admin/users')}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader
            title={<span className="text-slate-100">Role Permissions</span>}
            action={<ShieldCheck size={16} className="text-indigo-400" />}
          />
          <div className="flex items-center gap-3 mb-4">
            <span className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', activeRoleMeta.gradient)}>
              <ActiveIcon size={18} className="text-white" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {form.full_name.trim() ? `${getInitials(form.full_name)} · ` : ''}{activeRoleMeta.label}
              </p>
              <Badge status={form.role} className="mt-1" />
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">{activeRole.tagline}</p>
          <ul className="flex flex-col gap-2.5">
            {activeRole.can.map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
