'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, Archive, RotateCcw, Lock, Database } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import FilterPills from '../../../../components/FilterPills'
import DataTable from '../../../../components/DataTable'
import Modal from '../../../../components/Modal'
import Badge from '../../../../components/Badge'
import Button from '../../../../components/Button'
import FormInput from '../../../../components/FormInput'
import Spinner from '../../../../components/Spinner'
import EmptyState from '../../../../components/EmptyState'
import ErrorBanner from '../../../../components/ErrorBanner'
import {
  listMasterData, createMasterData, updateMasterData,
  removeMasterData, restoreMasterData,
} from '../../../../api/masterData'
import { useApi } from '../../../../hooks/useApi'
import { humanizeLabel } from '../../../../utils/formatters'

const CATEGORIES = [
  'property_types', 'locations', 'lead_sources', 'referral_sources',
  'member_types', 'property_statuses', 'customer_statuses',
  'followup_statuses', 'tags',
]

const EMPTY = { value: '', label: '', sort_order: 0 }

export default function MasterDataPage() {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [form, setForm] = useState(EMPTY)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionErr, setActionErr] = useState('')

  const fetcher = useCallback(
    () => listMasterData({ category, include_inactive: 1, page_size: 300 }),
    [category]
  )
  const { data, loading, error, refetch } = useApi(fetcher, [category])
  const items = data?.data ?? []

  const openAdd = () => { setForm(EMPTY); setFormErr(''); setEditing('new') }
  const openEdit = (item) => {
    setForm({ value: item.value, label: item.label, sort_order: item.sort_order ?? 0 })
    setFormErr('')
    setEditing(item)
  }

  const handleSave = async () => {
    if (!form.value.trim() || !form.label.trim()) {
      setFormErr('Value and label are both required.')
      return
    }
    setSaving(true)
    setFormErr('')
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
      if (editing === 'new') {
        await createMasterData({ ...payload, category })
      } else {
        await updateMasterData(editing.id, payload)
      }
      setEditing(null)
      refetch()
    } catch (err) {
      setFormErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item) => {
    const verb = item.active ? 'Deactivate' : 'Restore'
    if (!window.confirm(`${verb} "${item.label}"?`)) return
    setActionErr('')
    try {
      if (item.active) await removeMasterData(item.id)
      else await restoreMasterData(item.id)
      refetch()
    } catch (err) {
      setActionErr(err.message)
    }
  }

  const columns = [
    { key: 'label', label: 'Label', sortable: true },
    {
      key: 'value', label: 'Stored Value', sortable: true,
      render: (v, row) => (
        <span className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
          {v}
          {row.is_system && <Lock size={11} className="text-slate-400" title="System entry — value locked" />}
        </span>
      ),
    },
    { key: 'sort_order', label: 'Order', sortable: true, align: 'right' },
    {
      key: 'active', label: 'Status',
      render: v => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'id', label: '',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); openEdit(row) }} title="Edit">
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); handleToggleActive(row) }}
            title={row.active ? 'Deactivate' : 'Restore'}>
            {row.active ? <Archive size={13} /> : <RotateCcw size={13} />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Master Data"
        subtitle="Configurable option lists used across the application"
        breadcrumb={['Settings', 'Master Data']}
        actions={
          <Button onClick={openAdd}>
            <Plus size={14} /> Add Entry
          </Button>
        }
      />

      <FilterPills
        options={CATEGORIES.map(c => ({ value: c, label: humanizeLabel(c) }))}
        value={category}
        onChange={setCategory}
      />

      <ErrorBanner message={error?.message || actionErr} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Database}
          title={`No ${humanizeLabel(category).toLowerCase()} yet`}
          description="Add the first entry for this category."
          action={<Button onClick={openAdd}><Plus size={14} /> Add Entry</Button>}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80">
          <DataTable
            columns={columns}
            data={items}
            searchable
            searchKeys={['label', 'value']}
            pageSize={15}
            onRowClick={openEdit}
          />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `Add ${humanizeLabel(category)} Entry` : 'Edit Entry'}
        subtitle={humanizeLabel(category)}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ErrorBanner message={formErr} />
          <FormInput
            label="Label" id="md-label" required
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Visit Planned"
          />
          <FormInput
            label="Stored Value" id="md-value" required
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
            placeholder="e.g. visit_planned"
            disabled={editing !== 'new' && editing?.is_system}
            hint={editing !== 'new' && editing?.is_system
              ? 'System entry — the stored value is locked because existing records and business logic reference it.'
              : 'Saved on records; keep it short and stable.'}
          />
          <FormInput
            label="Sort Order" id="md-sort" type="number" inputMode="numeric"
            value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}
