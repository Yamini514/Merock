'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, Archive, LayoutTemplate } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import DataTable from '../../../../components/DataTable'
import Modal from '../../../../components/Modal'
import Badge from '../../../../components/Badge'
import Button from '../../../../components/Button'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import Spinner from '../../../../components/Spinner'
import EmptyState from '../../../../components/EmptyState'
import ErrorBanner from '../../../../components/ErrorBanner'
import { listTemplates, createTemplate, updateTemplate, removeTemplate } from '../../../../api/templates'
import { useApi } from '../../../../hooks/useApi'

const CHANNELS = [
  { value: 'in_app', label: 'In-app' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS (provider-ready)' },
  { value: 'whatsapp', label: 'WhatsApp (provider-ready)' },
]

const EMPTY = { name: '', channel: 'in_app', subject: '', body: '', variables: '', description: '' }

export default function TemplatesPage() {
  const [editing, setEditing] = useState(null) // null | 'new' | template
  const [form, setForm] = useState(EMPTY)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionErr, setActionErr] = useState('')

  const fetcher = useCallback(() => listTemplates({ page_size: 200 }), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])
  const items = data?.data ?? []

  const openAdd = () => { setForm(EMPTY); setFormErr(''); setEditing('new') }
  const openEdit = (t) => {
    setForm({
      name: t.name ?? '', channel: t.channel ?? 'in_app', subject: t.subject ?? '',
      body: t.body ?? '', description: t.description ?? '',
      variables: (t.variable_names ?? []).join(', '),
    })
    setFormErr('')
    setEditing(t)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) {
      setFormErr('Name and body are both required.')
      return
    }
    setSaving(true)
    setFormErr('')
    try {
      const payload = {
        name: form.name.trim(),
        channel: form.channel,
        subject: form.subject.trim() || null,
        body: form.body,
        description: form.description.trim() || null,
        variables: JSON.stringify(form.variables.split(',').map(v => v.trim()).filter(Boolean)),
      }
      if (editing === 'new') await createTemplate(payload)
      else await updateTemplate(editing.id, payload)
      setEditing(null)
      refetch()
    } catch (err) {
      setFormErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (t) => {
    if (!window.confirm(`Deactivate template "${t.name}"?`)) return
    setActionErr('')
    try { await removeTemplate(t.id); refetch() }
    catch (err) { setActionErr(err.message) }
  }

  const columns = [
    { key: 'name', label: 'Template', sortable: true, render: (v, row) => (
      <div>
        <p className="text-sm font-semibold text-slate-800">{v}</p>
        {row.description && <p className="text-xs text-slate-400 truncate max-w-[280px]">{row.description}</p>}
      </div>
    ) },
    { key: 'channel', label: 'Channel', render: v => <Badge variant="indigo">{CHANNELS.find(c => c.value === v)?.label ?? v}</Badge> },
    { key: 'subject', label: 'Subject', render: v => <span className="text-xs text-slate-500 truncate block max-w-[220px]">{v || '—'}</span> },
    {
      key: 'variable_names', label: 'Variables',
      render: v => (
        <div className="flex flex-wrap gap-1">
          {(v ?? []).map(name => (
            <span key={name} className="font-mono text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{`{{${name}}}`}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'id', label: '',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); openEdit(row) }} title="Edit">
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); handleDeactivate(row) }} title="Deactivate">
            <Archive size={13} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Notification Templates"
        subtitle="Reusable message templates with {{placeholder}} variables"
        breadcrumb={['Settings', 'Templates']}
        actions={<Button onClick={openAdd}><Plus size={14} /> Add Template</Button>}
      />

      <ErrorBanner message={error?.message || actionErr} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description="Create a template to standardize outgoing notifications."
          action={<Button onClick={openAdd}><Plus size={14} /> Add Template</Button>}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80">
          <DataTable columns={columns} data={items} searchable searchKeys={['name', 'subject', 'description']} pageSize={10} onRowClick={openEdit} />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add Template' : `Edit: ${editing?.name ?? ''}`}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Template</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ErrorBanner message={formErr} />
          <FormInput
            label="Name" id="tpl-name" required wrapperClass="sm:col-span-2"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. match_alert" hint="Referenced by code/automations — keep it stable."
          />
          <Select
            label="Channel" id="tpl-channel" options={CHANNELS}
            value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
          />
          <FormInput
            label="Subject / Title" id="tpl-subject"
            value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. New high match: {{property_title}}"
          />
          <Textarea
            label="Body" id="tpl-body" rows={6} required wrapperClass="sm:col-span-2"
            value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder={'Hi {{name}},\n\n…'}
            hint="Use {{variable}} placeholders; unknown variables render as empty."
          />
          <FormInput
            label="Variables" id="tpl-vars" wrapperClass="sm:col-span-2"
            value={form.variables} onChange={e => setForm(f => ({ ...f, variables: e.target.value }))}
            placeholder="name, property_title, score" hint="Comma-separated list of allowed placeholders."
          />
          <FormInput
            label="Description" id="tpl-desc" wrapperClass="sm:col-span-2"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="When is this template used?"
          />
        </div>
      </Modal>
    </div>
  )
}
