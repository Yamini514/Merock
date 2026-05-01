import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, Image as ImageIcon, FileSpreadsheet, X, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import FormInput, { Textarea } from '../components/FormInput'
import Select from '../components/Select'
import CheckboxGroup from '../components/CheckboxGroup'
import Button from '../components/Button'
import { MultiStepForm, StepActions } from '../components/MultiStepForm'
import { PROPERTY_TYPES, STATUS_OPTIONS, PROPERTIES } from '../mock-data/properties'
import { cn } from '../utils/cn'

const STEPS = ['Basic Info', 'Details & Specs', 'Media Upload', 'Review & Submit']

const AMENITIES = [
  'Gym', 'Swimming Pool', 'Parking', 'Security',
  'Gated Community', 'Clubhouse', 'Garden', 'Lift',
  'Power Backup', 'CCTV', 'Maintenance Staff', 'Children Play Area',
]

const EMPTY = {
  title: '', type: 'Apartment', location: '', price: '', area: '',
  bedrooms: '', bathrooms: '', status: 'active', agent: '',
  description: '', amenities: [], tags: '',
}

export default function AddEditProperty() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEdit    = Boolean(id)
  const existing  = isEdit ? PROPERTIES.find(p => p.id === id) : null

  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState(existing ? { ...EMPTY, ...existing, tags: existing.tags?.join(', ') ?? '', amenities: [] } : EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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

  function handleSubmit() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/properties')
    }, 1200)
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit Property' : 'Add New Property'}
        subtitle={isEdit ? `Editing: ${existing?.title}` : 'Create a new listing in 4 easy steps'}
        breadcrumb={['Properties', isEdit ? 'Edit' : 'Add New']}
        actions={<Button variant="secondary" size="sm" onClick={() => navigate('/properties')}>Cancel</Button>}
      />

      <Card>
        <MultiStepForm steps={STEPS} currentStep={step}>
          <div className="min-h-[340px]">
            {step === 0 && <Step1 form={form} set={set} errors={errors} />}
            {step === 1 && <Step2 form={form} set={set} errors={errors} />}
            {step === 2 && <Step3 form={form} />}
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
        options={STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
      <FormInput label="Location" id="location" value={form.location} onChange={e => set('location', e.target.value)}
        placeholder="Area, City" error={errors.location} required wrapperClass="sm:col-span-2" />
      <FormInput label="Price" id="price" type="number" value={form.price} onChange={e => set('price', e.target.value)}
        placeholder="e.g. 8500000" prefix="₹" error={errors.price} required />
      <FormInput label="Assigned Agent" id="agent" value={form.agent} onChange={e => set('agent', e.target.value)}
        placeholder="Agent name" />
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
      <Textarea label="Description" id="desc" value={form.description} onChange={e => set('description', e.target.value)}
        placeholder="Describe the property in detail…" rows={4} wrapperClass="sm:col-span-2" />
      <div className="sm:col-span-2">
        <CheckboxGroup label="Amenities" options={AMENITIES} value={form.amenities} onChange={v => set('amenities', v)} columns={3} />
      </div>
    </div>
  )
}

function Step3({ form }) {
  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <DropZone
        icon={ImageIcon}
        title="Property Images"
        subtitle="Drag & drop images or click to browse"
        hint="JPG, PNG, WEBP · Max 10MB each"
        accept="image/*"
        multiple
        preview={form.image}
      />
      <DropZone
        icon={FileSpreadsheet}
        title="Bulk Upload via Excel"
        subtitle="Upload a spreadsheet with multiple listings"
        hint=".xlsx, .csv · Max 5MB"
        accept=".xlsx,.csv"
        accentColor="emerald"
      />
      <p className="text-xs text-slate-400">
        Need the template?{' '}
        <button className="text-indigo-600 font-medium hover:underline">Download sample Excel →</button>
      </p>
    </div>
  )
}

function DropZone({ icon: Icon, title, subtitle, hint, accept, multiple, preview, accentColor = 'indigo' }) {
  const colors = {
    indigo:  { ring: 'border-indigo-300 bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-500' },
    emerald: { ring: 'border-emerald-300 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600' },
  }
  const c = colors[accentColor]
  return (
    <label className={cn('relative flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-opacity-100 hover:bg-opacity-100 cursor-pointer transition-all', `hover:${c.ring}`)}>
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-colors bg-slate-100 text-slate-400 group-hover:' + c.icon)}>
        <Icon size={22} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        <p className="text-xs text-slate-300 mt-1">{hint}</p>
      </div>
      {preview && (
        <div className="flex gap-2 mt-1">
          <div className="relative">
            <img src={preview} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
            <span className="absolute -top-1.5 -left-1.5 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">Cover</span>
          </div>
        </div>
      )}
      <input type="file" accept={accept} multiple={multiple} className="sr-only" />
    </label>
  )
}

function Step4({ form }) {
  const fields = [
    ['Title', form.title], ['Type', form.type], ['Location', form.location],
    ['Price', form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'],
    ['Area', form.area ? `${form.area} sqft` : '—'], ['Bedrooms', form.bedrooms || '—'],
    ['Bathrooms', form.bathrooms || '—'], ['Status', form.status], ['Agent', form.agent || '—'],
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
