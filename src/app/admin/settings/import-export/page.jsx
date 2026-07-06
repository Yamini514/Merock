'use client'

import { useState, useRef } from 'react'
import {
  Download, Upload, Building2, Users, Share2, GanttChart,
  CalendarClock, History, FileSpreadsheet, Sparkles,
} from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card, { CardHeader } from '../../../../components/Card'
import OptionPicker from '../../../../components/OptionPicker'
import Button from '../../../../components/Button'
import ErrorBanner from '../../../../components/ErrorBanner'
import { exportEntity, importEntity } from '../../../../api/dataTransfer'
import { cn } from '../../../../utils/cn'

const ENTITIES = [
  { value: 'properties',   label: 'Properties',    icon: Building2,     gradient: 'from-indigo-500 to-blue-600',    importable: true },
  { value: 'customers',    label: 'Clients',       icon: Users,         gradient: 'from-emerald-500 to-teal-600',   importable: true },
  { value: 'members',      label: 'Members',       icon: Share2,        gradient: 'from-amber-500 to-orange-500',   importable: true },
  { value: 'referrals',    label: 'Referrals',     icon: GanttChart,    gradient: 'from-violet-500 to-purple-600',  importable: true },
  { value: 'matches',      label: 'Matches',       icon: Sparkles,      gradient: 'from-sky-500 to-cyan-600',       importable: false },
  { value: 'follow_ups',   label: 'Follow-ups',    icon: CalendarClock, gradient: 'from-rose-500 to-pink-600',      importable: false },
  { value: 'activity_logs', label: 'Activity Log', icon: History,       gradient: 'from-slate-500 to-slate-700',    importable: false },
]

export default function ImportExportPage() {
  const [entity, setEntity] = useState('properties')
  const [format, setFormat] = useState('csv')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  const selected = ENTITIES.find(e => e.value === entity)

  const handleExport = async () => {
    setBusy(true)
    setErr('')
    try {
      await exportEntity(entity, format)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setBusy(true)
    setErr('')
    setImportResult(null)
    try {
      const res = await importEntity(entity, file)
      setImportResult(res)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Import / Export"
        subtitle="Move data in and out as CSV or Excel"
        breadcrumb={['Settings', 'Import / Export']}
      />

      <ErrorBanner message={err} />

      <Card>
        <CardHeader title="1 · Choose Data" subtitle="Which records do you want to move?" />
        <OptionPicker
          options={ENTITIES.map(e => ({
            value: e.value, label: e.label, icon: e.icon, gradient: e.gradient,
            description: e.importable ? 'Export + import' : 'Export only',
          }))}
          value={entity}
          onChange={v => { setEntity(v); setImportResult(null); setErr('') }}
          columns={4}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><Download size={15} className="text-indigo-500" /> Export</span>}
            subtitle="Download the current records (respects your role's data visibility)"
          />
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
              {['csv', 'xlsx'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold uppercase transition-colors',
                    format === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <FileSpreadsheet size={13} /> {f}
                </button>
              ))}
            </div>
            <Button onClick={handleExport} loading={busy}>
              <Download size={14} /> Export {selected?.label}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><Upload size={15} className="text-indigo-500" /> Import</span>}
            subtitle={selected?.importable
              ? 'Upload a CSV or Excel file with the same column headers as an export'
              : 'This dataset is export-only'}
          />
          {selected?.importable ? (
            <div className="flex flex-col gap-3">
              <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={busy}>
                <Upload size={14} /> Choose file…
              </Button>
              <input
                ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden"
                onChange={handleImportFile}
              />
              <p className="text-xs text-slate-400">
                Rows update existing records when the key column matches
                ({entity === 'properties' ? 'code' : entity === 'referrals' ? 'always creates new rows' : 'phone'}),
                otherwise create new ones. Max 2,000 rows per file.
                Multi-value columns (amenities, tags, images) use “|” between values.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Import is not available for {selected?.label}.</p>
          )}
        </Card>
      </div>

      {importResult && (
        <Card>
          <CardHeader
            title="Import Result"
            subtitle={`${importResult.created ?? 0} created · ${importResult.updated ?? 0} updated · ${importResult.failed?.length ?? 0} failed`}
          />
          {(importResult.failed?.length ?? 0) > 0 ? (
            <div className="rounded-xl border border-rose-100 divide-y divide-rose-50 overflow-hidden">
              {importResult.failed.map((f, i) => (
                <div key={i} className="grid grid-cols-[5rem_1fr] gap-2 px-4 py-2 text-xs bg-rose-50/40">
                  <span className="font-semibold text-rose-600">Row {f.row}</span>
                  <span className="text-slate-600">
                    {typeof f.errors === 'string'
                      ? f.errors
                      : Object.entries(f.errors || {}).map(([k, v]) => `${k} ${Array.isArray(v) ? v.join(', ') : v}`).join('; ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-600">All rows imported successfully.</p>
          )}
        </Card>
      )}
    </div>
  )
}
