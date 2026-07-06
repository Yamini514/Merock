'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '../../../../components/PageHeader'
import Card from '../../../../components/Card'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import Button from '../../../../components/Button'
import ErrorBanner from '../../../../components/ErrorBanner'
import { getCustomer, createCustomer, updateCustomer } from '../../../../api/customers'
import { useAuth } from '../../../../context/AuthContext'
import { canWrite } from '../../../../utils/permissions'
import { useMasterOptions } from '../../../../hooks/useMasterOptions'
import { sanitizePhone } from '../../../../utils/formatters'

const LEAD_TYPES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'investor', label: 'Investor' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Owner' },
  { value: 'enquiry', label: 'General Enquiry' },
]

// Fallback mirroring the backend constant — live options come from master
// data (Settings → Master Data) via useMasterOptions.
const STATUSES = [
  'new', 'contacted', 'qualified', 'shortlisted', 'visit_planned',
  'negotiation', 'closed', 'lost', 'on_hold',
]

const EMPTY = {
  name: '', email: '', phone: '', alt_phone: '', lead_type: 'buyer',
  city: '', source: '', preferred_language: '', status: 'new', notes: '',
  shared: false,
}

function toForm(c) {
  return {
    ...EMPTY,
    name: c.name ?? '', email: c.email ?? '', phone: c.phone ?? '',
    alt_phone: c.alt_phone ?? '', lead_type: c.lead_type ?? 'buyer',
    city: c.city ?? '', source: c.source ?? '', preferred_language: c.preferred_language ?? '',
    status: c.status ?? 'new', notes: c.notes ?? '', shared: c.shared ?? false,
  }
}

export default function AddEditCustomerForm() {
  const router = useRouter()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  // Sharing a lead into the team pool is an admin decision (backend strips
  // the field for agents — see Customers#guarded_data).
  const canShare = ['super_admin', 'admin'].includes(user?.role)
  const writable = canWrite(user, 'customers')

  // Read-only / non-sales roles that deep-link here get bounced.
  useEffect(() => {
    if (user && !writable) router.replace('/admin/clients')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, writable])

  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  const statusOptions = useMasterOptions('customer_statuses', STATUSES)

  useEffect(() => {
    if (!isEdit) return
    getCustomer(id).then(c => setForm(toForm(c))).catch(e => setLoadErr(e.message))
  }, [id, isEdit])

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number'
    if (form.alt_phone && !/^\d{10}$/.test(form.alt_phone)) e.alt_phone = 'Enter a valid 10-digit phone number'
    if (!form.lead_type) e.lead_type = 'Lead type is required'
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
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        alt_phone: form.alt_phone.trim() || null,
        lead_type: form.lead_type,
        city: form.city.trim() || null,
        source: form.source.trim() || null,
        preferred_language: form.preferred_language.trim() || null,
        status: form.status,
        notes: form.notes || null,
        shared: form.shared,
      }
      if (isEdit) await updateCustomer(id, payload)
      else        await createCustomer(payload)
      router.push('/admin/clients')
    } catch (e) {
      setLoadErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit Client' : 'Add New Client'}
        subtitle={isEdit ? `Editing: ${form.name || '…'}` : 'Create a new lead record'}
        breadcrumb={['Clients', isEdit ? 'Edit' : 'Add New']}
      />

      <ErrorBanner message={loadErr} />

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Full Name" id="name" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Arjun Reddy" error={errors.name} required wrapperClass="sm:col-span-2" />
          <FormInput label="Phone" id="phone" type="tel" inputMode="numeric" maxLength={10}
            value={form.phone} onChange={e => set('phone', sanitizePhone(e.target.value))}
            placeholder="10-digit mobile number" error={errors.phone} required />
          <FormInput label="Alternate Phone" id="alt_phone" type="tel" inputMode="numeric" maxLength={10}
            value={form.alt_phone} onChange={e => set('alt_phone', sanitizePhone(e.target.value))}
            placeholder="Optional" error={errors.alt_phone} />
          <FormInput label="Email" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="name@example.com" />
          <FormInput label="City" id="city" value={form.city} onChange={e => set('city', e.target.value)}
            placeholder="e.g. Hyderabad" />
          <Select label="Lead Type" id="lead_type" value={form.lead_type} onChange={e => set('lead_type', e.target.value)}
            options={LEAD_TYPES} error={errors.lead_type} required />
          <Select label="Status" id="status" value={form.status} onChange={e => set('status', e.target.value)}
            options={statusOptions} />
          <FormInput label="Source" id="source" value={form.source} onChange={e => set('source', e.target.value)}
            placeholder="e.g. Website, Referral" />
          <FormInput label="Preferred Language" id="preferred_language" value={form.preferred_language} onChange={e => set('preferred_language', e.target.value)}
            placeholder="e.g. English" />
          <Textarea label="Notes" id="notes" value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Internal notes about this client…" rows={3} wrapperClass="sm:col-span-2" />

          {canShare && (
            <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.shared}
                onChange={e => set('shared', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
              />
              <span className="text-sm text-slate-700">Shared team lead — visible to and workable by every sales agent</span>
            </label>
          )}

          <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.push('/admin/clients')}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
