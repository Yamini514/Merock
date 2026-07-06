'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Building2, Palette, Globe2, Mail, Briefcase, ShieldCheck, Check } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card, { CardHeader } from '../../../components/Card'
import FormInput, { Textarea } from '../../../components/FormInput'
import Select from '../../../components/Select'
import Button from '../../../components/Button'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listSettings, updateSettings } from '../../../api/settings'
import { uploadFiles } from '../../../api/uploads'
import { useApi } from '../../../hooks/useApi'

const SECTIONS = [
  { group: 'company',  title: 'Company Information', subtitle: 'Shown on the public site and documents', icon: Building2 },
  { group: 'branding', title: 'Branding',            subtitle: 'Logo and visual identity',               icon: Palette },
  { group: 'locale',   title: 'Localization',        subtitle: 'Timezone, date format, currency and language', icon: Globe2 },
  { group: 'email',    title: 'Email Configuration', subtitle: 'Sender identity for outgoing email',     icon: Mail },
  { group: 'business', title: 'Business Rules',      subtitle: 'System preferences and defaults',        icon: Briefcase },
  { group: 'security', title: 'Security Policy',     subtitle: 'Password requirements for all accounts', icon: ShieldCheck },
]

const SELECT_OPTIONS = {
  'locale.timezone': ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'UTC'],
  'locale.date_format': ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  'locale.currency': ['INR', 'USD', 'EUR', 'GBP', 'AED'],
  'locale.language': [{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }],
  'business.default_followup_priority': ['low', 'medium', 'high'],
  'security.password_require_mixed': [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }],
}

export default function SettingsPage() {
  const fetcher = useCallback(() => listSettings(), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])
  const rows = (data?.data ?? []).filter(s => SECTIONS.some(sec => sec.group === s.group))

  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!data?.data) return
    // Hydrating a form from a completed fetch — same deliberate pattern as
    // AuthContext (set-state-in-effect is the intended behavior here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(Object.fromEntries(data.data.map(s => [s.setting_key, s.value ?? ''])))
  }, [data])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const dirtyKeys = rows.filter(s => form[s.setting_key] !== undefined && form[s.setting_key] !== (s.value ?? ''))

  const handleSave = async () => {
    if (dirtyKeys.length === 0) return
    setSaving(true)
    setSaveErr('')
    try {
      await updateSettings(Object.fromEntries(dirtyKeys.map(s => [s.setting_key, form[s.setting_key]])))
      await refetch()
      setSaved(true)
      savedTimer.current = setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setSaveErr('')
    try {
      const urls = await uploadFiles([file])
      if (urls?.[0]) set('branding.logo_url', urls[0])
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setUploading(false)
    }
  }

  const renderField = (s) => {
    const key = s.setting_key
    const common = { label: s.label || key, id: key }
    const options = SELECT_OPTIONS[key]

    if (options) {
      return (
        <Select key={key} {...common} options={options}
          value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
      )
    }
    if (key === 'branding.logo_url') {
      return (
        <div key={key} className="flex flex-col gap-2 sm:col-span-2">
          <FormInput {...common} value={form[key] ?? ''} onChange={e => set(key, e.target.value)}
            hint="Paste a URL or upload an image." placeholder="https://..." />
          <div className="flex items-center gap-3">
            {form[key] && <img src={form[key]} alt="Logo preview" className="h-10 rounded-lg bg-slate-100 object-contain px-2" />}
            <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              {uploading ? 'Uploading…' : 'Upload logo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      )
    }
    if (key === 'company.address') {
      return (
        <Textarea key={key} {...common} rows={2} wrapperClass="sm:col-span-2"
          value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
      )
    }
    if (s.value_type === 'number') {
      return (
        <FormInput key={key} {...common} type="number" inputMode="numeric"
          value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
      )
    }
    return (
      <FormInput key={key} {...common}
        value={form[key] ?? ''} onChange={e => set(key, e.target.value)}
        hint={s.description || undefined} />
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Application Settings"
        subtitle="Company profile, branding, localization and system preferences"
        breadcrumb={['Settings', 'Application']}
        actions={
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check size={13} /> Saved
              </span>
            )}
            <Button onClick={handleSave} loading={saving} disabled={dirtyKeys.length === 0}>
              Save Changes{dirtyKeys.length > 0 ? ` (${dirtyKeys.length})` : ''}
            </Button>
          </div>
        }
      />

      <ErrorBanner message={error?.message || saveErr} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {SECTIONS.map(section => {
            const sectionRows = rows.filter(s => s.group === section.group)
            if (sectionRows.length === 0) return null
            const Icon = section.icon
            return (
              <Card key={section.group}>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Icon size={15} className="text-indigo-500" />
                      {section.title}
                    </span>
                  }
                  subtitle={section.subtitle}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectionRows.map(renderField)}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
