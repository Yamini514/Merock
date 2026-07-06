'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UploadCloud, X, CheckCircle } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card from '../../../../components/Card'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import CheckboxGroup from '../../../../components/CheckboxGroup'
import Button from '../../../../components/Button'
import ErrorBanner from '../../../../components/ErrorBanner'
import { MultiStepForm, StepActions } from '../../../../components/MultiStepForm'
import { getProperty, createProperty, updateProperty } from '../../../../api/properties'
import { uploadFiles } from '../../../../api/uploads'
import { useAuth } from '../../../../context/AuthContext'
import { canWrite } from '../../../../utils/permissions'
import { useMasterOptions } from '../../../../hooks/useMasterOptions'
import { humanizeLabel } from '../../../../utils/formatters'
import { cn } from '../../../../utils/cn'

const STEPS = ['Basic Info', 'Details & Specs', 'Media Upload', 'Review & Submit']

// Fallbacks mirroring the backend constants — live options come from master
// data (Settings → Master Data) via useMasterOptions.
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Plot']
const STATUS_OPTIONS = ['draft', 'available', 'under_discussion', 'blocked', 'sold', 'inactive']

const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Security',
  'Gated Community', 'Clubhouse', 'Garden', 'Lift',
  'Power Backup', 'CCTV', 'Maintenance Staff', 'Children Play Area',
]

const EMPTY = {
  title: '', type: 'Apartment', location: '', price: '', area: '',
  bedrooms: '', bathrooms: '', status: 'draft', image: '', images: [],
  description: '', amenities: [], tags: '',
  ownerName: '', ownerContact: '', sourceNotes: '', confidential: false,
  shared: false,
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
    images: p.images ?? [],
    description: p.notes ?? '',
    amenities: p.amenities ?? [],
    tags: (p.tags ?? []).join(', '),
    ownerName: p.owner_name ?? '',
    ownerContact: p.owner_contact ?? '',
    sourceNotes: p.source_notes ?? '',
    confidential: p.confidential ?? false,
    shared: p.shared ?? false,
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
    image: form.image || form.images[0] || null,
    images: form.images,
    amenities: form.amenities,
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    notes: form.description || null,
    transaction_type: 'buy',
    owner_name: form.ownerName.trim() || null,
    owner_contact: form.ownerContact.trim() || null,
    source_notes: form.sourceNotes.trim() || null,
    confidential: form.confidential,
    shared: form.shared,
  }
}

export default function AddEditPropertyForm() {
  const router = useRouter()
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  // Sharing a record into the team pool is an admin decision (the backend
  // strips the field for everyone else — see Properties#guarded_data).
  const canShare = ['super_admin', 'admin'].includes(user?.role)
  const writable = canWrite(user, 'properties')

  // Read-only / non-property roles that deep-link here get bounced.
  useEffect(() => {
    if (user && !writable) router.replace('/admin/properties')
  }, [user, writable, router])

  const typeOptions   = useMasterOptions('property_types', PROPERTY_TYPES)
  const statusOptions = useMasterOptions('property_statuses', STATUS_OPTIONS)

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

      <ErrorBanner message={loadErr} />

      <Card>
        <MultiStepForm steps={STEPS} currentStep={step}>
          <div className="min-h-[340px]">
            {step === 0 && <Step1 form={form} set={set} errors={errors} typeOptions={typeOptions} statusOptions={statusOptions} />}
            {step === 1 && <Step2 form={form} set={set} errors={errors} isSuperAdmin={isSuperAdmin} canShare={canShare} />}
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

function Step1({ form, set, errors, typeOptions, statusOptions }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
      <FormInput label="Property Title" id="title" value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="e.g. Luxury 3BHK in Banjara Hills" error={errors.title} required wrapperClass="sm:col-span-2" />
      <Select label="Property Type" id="type" value={form.type} onChange={e => set('type', e.target.value)}
        options={typeOptions} required />
      <Select label="Status" id="status" value={form.status} onChange={e => set('status', e.target.value)}
        options={statusOptions} />
      <FormInput label="Location" id="location" value={form.location} onChange={e => set('location', e.target.value)}
        placeholder="Area, City" error={errors.location} required wrapperClass="sm:col-span-2" />
      <FormInput label="Price" id="price" type="number" value={form.price} onChange={e => set('price', e.target.value)}
        placeholder="e.g. 8500000" prefix="₹" error={errors.price} required />
      <FormInput label="Cover Image URL" id="image" value={form.image} onChange={e => set('image', e.target.value)}
        placeholder="https://…" />
    </div>
  )
}

function Step2({ form, set, errors, isSuperAdmin, canShare }) {
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

      {canShare && (
        <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none pt-3 border-t border-slate-100">
          <input
            type="checkbox"
            checked={form.shared}
            onChange={e => set('shared', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
          />
          <span className="text-sm text-slate-700">Shared team listing — visible to and workable by every sales agent</span>
        </label>
      )}

      {isSuperAdmin && (
        <div className="sm:col-span-2 pt-4 mt-1 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Owner / Source (Super Admin only)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Owner Name" id="ownerName" value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
              placeholder="e.g. Rajesh Mehta" />
            <FormInput label="Owner Contact" id="ownerContact" value={form.ownerContact} onChange={e => set('ownerContact', e.target.value)}
              placeholder="Phone or email" />
            <Textarea label="Source Notes" id="sourceNotes" value={form.sourceNotes} onChange={e => set('sourceNotes', e.target.value)}
              placeholder="Broker/source details, negotiation context…" rows={3} wrapperClass="sm:col-span-2" />
            <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.confidential}
                onChange={e => set('confidential', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
              />
              <span className="text-sm text-slate-700">Mark confidential — owner/source fields visible to Super Admin only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

function Step3({ form, set }) {
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [urlInput, setUrlInput]   = useState('')

  async function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploading(true)
    setUploadErr('')
    try {
      const urls = await uploadFiles(files)
      set('images', [...form.images, ...urls])
    } catch (e) {
      setUploadErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    set('images', [...form.images, url])
    setUrlInput('')
  }

  function removeImage(idx) {
    set('images', form.images.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <FormInput label="Cover Image URL" id="image2" value={form.image} onChange={e => set('image', e.target.value)}
        placeholder="https://images.example.com/photo.jpg" hint="Shown as the main thumbnail in listings" />
      {form.image && (
        <img src={form.image} alt="" className="w-40 h-28 rounded-xl object-cover border border-slate-200" />
      )}

      <div>
        <label className="text-xs font-medium text-slate-600 leading-none mb-2 block">Gallery Images</label>
        <div className="flex flex-col gap-3">
          <label className={cn(
            'flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors',
            uploading ? 'border-indigo-300 bg-indigo-50/50 text-indigo-500' : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30'
          )}>
            <UploadCloud size={20} className="shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-600">{uploading ? 'Uploading…' : 'Click to upload images'}</p>
              <p className="text-xs">JPG, PNG, WEBP or GIF — multiple files supported, max 10MB each</p>
            </div>
            <input
              type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple
              className="hidden" disabled={uploading}
              onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
            />
          </label>

          <div className="flex items-center gap-2">
            <FormInput wrapperClass="flex-1" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="…or paste an image URL" />
            <Button type="button" variant="secondary" onClick={addUrl}>Add</Button>
          </div>

          <ErrorBanner message={uploadErr} />

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.images.map((url, i) => (
                <div key={`${url}-${i}`} className="relative group">
                  <img src={url} alt="" className="w-full h-20 rounded-xl object-cover border border-slate-200" />
                  <button
                    type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
    ['Bathrooms', form.bathrooms || '—'], ['Status', humanizeLabel(form.status)],
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
