'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Image as ImageIcon, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card from '../../../../components/Card'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import CheckboxGroup from '../../../../components/CheckboxGroup'
import Button from '../../../../components/Button'
import { MultiStepForm, StepActions } from '../../../../components/MultiStepForm'
import { getProperty, createProperty, updateProperty } from '../../../../api/properties'
import { cn } from '../../../../utils/cn'

const STEPS = ['Basic Info', 'Details & Specs', 'Media Upload', 'Review & Submit']

// Mirror the backend Property enums.
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Plot']
const STATUS_OPTIONS = ['draft', 'available', 'under_discussion', 'blocked', 'sold', 'inactive']
const humanize = (s) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Security',
  'Gated Community', 'Clubhouse', 'Garden', 'Lift',
  'Power Backup', 'CCTV', 'Maintenance Staff', 'Children Play Area',
]

const EMPTY = {
  title: '', type: 'Apartment', location: '', price: '', area: '',
  bedrooms: '', bathrooms: '', status: 'draft', image: '',
  description: '', amenities: [], tags: '',
}

// backend property -> form shape
function toForm(p) {
  return {
    ...EMPTY,
    title: p.title ?? '',
    type: p.property_type ?? 'Apartment',
    location: p.location ?? '',
    price: p.price ?? '',
    area: p.area ?? '',
    bedrooms: p.bedrooms ?? '',
    bathrooms: p.bathrooms ?? '',
    status: p.status ?? 'draft',
    image: p.image ?? '',
    description: p.notes ?? '',
    amenities: p.amenities ?? [],
    tags: (p.tags ?? []).join(', '),
  }
}

// form -> backend write payload
function toPayload(form) {
  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))
  return {
    title: form.title.trim(),
    property_type: form.type,
    location: form.location.trim(),
    price: num(form.price),
    area: num(form.area),
    bedrooms: num(form.bedrooms),
    bathrooms: num(form.bathrooms),
    status: form.status,
    image: form.image || null,
    amenities: form.amenities,
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    notes: form.description || null,
    transaction_type: 'buy',
  }
}

export default function AddEditPropertyForm() {
  const router = useRouter()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getProperty(id)
      .then(p => setForm(toForm(p)))
      .catch(e => setLoadErr(e.message))
  }, [id, isEdit])

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (step === 0) {
      if (!form.title.trim())    e.title    = 'Title is required'
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.price)           e.price    = 'Price is required'
    }
    if (step === 1 && !form.area) e.area = 'Area is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  function handleNext() { if (validate()) setStep(s => s + 1) }

  async function handleSubmit() {
    setLoading(true)
    setLoadErr('')
    try {
      const payload = toPayload(form)
      if (isEdit) await updateProperty(id, payload)
      else        await createProperty(payload)
      router.push('/admin/properties')
    } catch (e) {
      setLoadErr(e.message)
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit Property' : 'Add New Property'}
        subtitle={isEdit ? `Editing: ${form.title || '…'}` : 'Create a new listing in 4 easy steps'}
        breadcrumb={['Properties', isEdit ? 'Edit' : 'Add New']}
        actions={<Button variant="secondary" size="sm" onClick={() => router.push('/admin/properties')}>Cancel</Button>}
      />

      {loadErr && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle size={16} /> {loadErr}
        </div>
      )}

      <Card>
        <MultiStepForm steps={STEPS} currentStep={step}>
          <div className="min-h-[340px]">
            {step === 0 && <Step1 form={form} set={set} errors={errors} />}
            {step === 1 && <Step2 form={form} set={set} errors={errors} />}
            {step === 2 && <Step3 form={form} set={set} />}
            {step === 3 && <Step4 form={form} />}
          </div>
          <StepActions
            isFirst={step === 0}
            isLast={step === STEPS.length - 1}
            onBack={() => setStep(s => s - 1)}
            onNext={handleNext}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </MultiStepForm>
      </Card>
    </div>
  )
}

function Step1({ form, set, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
      <FormInput label="Property Title" id="title" value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="e.g. Luxury 3BHK in Banjara Hills" error={errors.title} required wrapperClass="sm:col-span-2" />
      <Select label="Property Type" id="type" value={form.type} onChange={e => set('type', e.target.value)}
        options={PROPERTY_TYPES} required />
      <Select label="Status" id="status" value={form.status} onChange={e => set('status', e.target.value)}
        options={STATUS_OPTIONS.map(s => ({ value: s, label: humanize(s) }))} />
      <FormInput label="Location" id="location" value={form.location} onChange={e => set('location', e.target.value)}
        placeholder="Area, City" error={errors.location} required wrapperClass="sm:col-span-2" />
      <FormInput label="Price" id="price" type="number" value={form.price} onChange={e => set('price', e.target.value)}
        placeholder="e.g. 8500000" prefix="₹" error={errors.price} required />
      <FormInput label="Cover Image URL" id="image" value={form.image} onChange={e => set('image', e.target.value)}
        placeholder="https://…" />
    </div>
  )
}

function Step2({ form, set, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
      <FormInput label="Area" id="area" type="number" value={form.area} onChange={e => set('area', e.target.value)}
        placeholder="1850" suffix="sqft" error={errors.area} required />
      <FormInput label="Bedrooms" id="bedrooms" type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="3" />
      <FormInput label="Bathrooms" id="bathrooms" type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="2" />
      <FormInput label="Tags" id="tags" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Premium, Pool View" hint="Comma-separated" />
      <Textarea label="Internal Notes" id="desc" value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="Condition, owner expectations, negotiation notes… (staff-only)" rows={4} wrapperClass="sm:col-span-2" />
      <div className="sm:col-span-2">
        <CheckboxGroup label="Amenities" options={AMENITIES} value={form.amenities} onChange={v => set('amenities', v)} columns={3} />
      </div>
    </div>
  )
}

function Step3({ form, set }) {
  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <FormInput label="Cover Image URL" id="image2" value={form.image} onChange={e => set('image', e.target.value)}
        placeholder="https://images.example.com/photo.jpg" hint="Phase 1 uses image links" />
      {form.image && (
        <img src={form.image} alt="" className="w-40 h-28 rounded-xl object-cover border border-slate-200" />
      )}
      <div className="flex items-start gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
        <FileSpreadsheet size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-slate-600">Bulk Excel upload</p>
          <p className="text-xs">File/object-storage upload arrives in a later phase. For now, paste an image URL above.</p>
        </div>
      </div>
    </div>
  )
}

function Step4({ form }) {
  const fields = [
    ['Title', form.title], ['Type', form.type], ['Location', form.location],
    ['Price', form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'],
    ['Area', form.area ? `${form.area} sqft` : '—'], ['Bedrooms', form.bedrooms || '—'],
    ['Bathrooms', form.bathrooms || '—'], ['Status', humanize(form.status)],
  ]
  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <CheckCircle size={18} className="text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-800 font-medium">Looking good! Review your details below before submitting.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{k}</p>
            <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{v || '—'}</p>
          </div>
        ))}
      </div>
      {form.amenities?.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2.5">Amenities Selected</p>
          <div className="flex flex-wrap gap-1.5">
            {form.amenities.map(a => (
              <span key={a} className="text-xs bg-indigo-100 text-indigo-700 rounded-xl px-2.5 py-1 font-medium">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
