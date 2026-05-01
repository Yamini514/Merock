import { useState } from 'react'
import { Plus, GanttChart, List, MoreHorizontal, Calendar, User, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Button from '../components/Button'
import FormInput from '../components/FormInput'
import Select from '../components/Select'
import { ENQUIRIES } from '../mock-data/enquiries'
import { CLIENTS } from '../mock-data/clients'
import { PROPERTIES } from '../mock-data/properties'
import { formatDate } from '../utils/formatters'
import { cn } from '../utils/cn'

const COLUMNS = [
  { id: 'enquired',    label: 'Enquired',    color: 'blue',    count_bg: 'bg-blue-50 text-blue-600',    card_border: 'border-blue-100',    header_bar: 'bg-blue-500' },
  { id: 'visited',     label: 'Visited',     color: 'violet',  count_bg: 'bg-violet-50 text-violet-600', card_border: 'border-violet-100',  header_bar: 'bg-violet-500' },
  { id: 'negotiating', label: 'Negotiating', color: 'amber',   count_bg: 'bg-amber-50 text-amber-600',   card_border: 'border-amber-100',   header_bar: 'bg-amber-500' },
  { id: 'converted',   label: 'Converted',   color: 'emerald', count_bg: 'bg-emerald-50 text-emerald-600', card_border: 'border-emerald-100', header_bar: 'bg-emerald-500' },
]

export default function Enquiries() {
  const [items, setItems]       = useState(ENQUIRIES)
  const [view, setView]         = useState('kanban')
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [selected, setSelected] = useState(null)
  const [addModal, setAddModal] = useState(false)

  function handleDragStart(e, item) {
    setDragging(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
  }

  function handleDragOver(e, colId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  function handleDrop(e, targetStatus) {
    e.preventDefault()
    if (dragging && dragging.status !== targetStatus) {
      setItems(prev => prev.map(q => q.id === dragging.id ? { ...q, status: targetStatus } : q))
    }
    setDragging(null)
    setDragOver(null)
  }

  function handleDragEnd() { setDragging(null); setDragOver(null) }

  const tableColumns = [
    { key: 'client', label: 'Client', sortable: true, render: v => <div className="flex items-center gap-2.5"><Avatar name={v} size="sm" /><span className="font-medium text-slate-800 text-sm">{v}</span></div> },
    { key: 'property', label: 'Property', sortable: true, render: v => <span className="text-sm text-slate-600 max-w-[200px] truncate block">{v}</span> },
    { key: 'agent', label: 'Agent' },
    { key: 'date', label: 'Date', sortable: true, render: v => <span className="text-xs text-slate-500">{formatDate(v)}</span> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} dot /> },
    { key: 'priority', label: 'Priority', render: v => <Badge status={v} /> },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Enquiry Pipeline"
        subtitle={`${items.length} total enquiries`}
        breadcrumb={['Home', 'Enquiries']}
        actions={
          <>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button onClick={() => setView('kanban')} className={cn('p-2.5 transition-colors', view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><GanttChart size={15} /></button>
              <button onClick={() => setView('table')} className={cn('p-2.5 transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><List size={15} /></button>
            </div>
            <Button onClick={() => setAddModal(true)}><Plus size={14} /> Log Enquiry</Button>
          </>
        }
      />

      {/* Kanban conversion summary strip */}
      {view === 'kanban' && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {COLUMNS.map((col, i) => {
            const count = items.filter(e => e.status === col.id).length
            return (
              <div key={col.id} className="flex items-center gap-2 shrink-0">
                <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl border', col.count_bg.replace('text-', 'border-').replace('-600', '-200'), col.count_bg.replace('text-', 'bg-').replace('-600', '-50').split(' ')[0], 'bg-opacity-50')}>
                  <span className={cn('w-2 h-2 rounded-full', col.header_bar)} />
                  <span className={cn('text-sm font-bold', col.count_bg.split(' ')[1])}>{count}</span>
                  <span className="text-xs text-slate-500 font-medium">{col.label}</span>
                </div>
                {i < COLUMNS.length - 1 && <ArrowRight size={12} className="text-slate-300 shrink-0" />}
              </div>
            )
          })}
        </div>
      )}

      {/* KANBAN BOARD */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {COLUMNS.map(col => {
            const colItems = items.filter(e => e.status === col.id)
            const isOver   = dragOver === col.id
            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDrop={e => handleDrop(e, col.id)}
                onDragLeave={() => setDragOver(null)}
                className={cn(
                  'flex flex-col gap-3 min-w-[280px] w-72 shrink-0 rounded-2xl p-3 border-2 transition-all duration-150',
                  isOver ? 'kanban-drag-over' : 'border-transparent bg-slate-100/60'
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('w-2.5 h-2.5 rounded-full', col.header_bar)} />
                    <span className="text-sm font-bold text-slate-700">{col.label}</span>
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center', col.count_bg)}>
                      {colItems.length}
                    </span>
                  </div>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"><Plus size={13} /></button>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5">
                  {colItems.length === 0 && !isOver && (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-slate-200 text-slate-300">
                      <GanttChart size={22} className="mb-2" />
                      <p className="text-xs">Drop here</p>
                    </div>
                  )}
                  {colItems.map(item => (
                    <KanbanCard
                      key={item.id}
                      item={item}
                      col={col}
                      dragging={dragging}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelected(item)}
                    />
                  ))}
                </div>

                {/* Add card */}
                <button
                  onClick={() => setAddModal(true)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors mt-auto"
                >
                  <Plus size={13} /> Add card
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <DataTable
            columns={tableColumns}
            data={items}
            searchable
            searchKeys={['client', 'property', 'agent']}
            pageSize={8}
            onRowClick={setSelected}
          />
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Enquiry Details"
        subtitle={selected?.property}
        size="md"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && <EnquiryDetail enquiry={selected} onStatusChange={(newStatus) => {
          setItems(prev => prev.map(e => e.id === selected.id ? { ...e, status: newStatus } : e))
          setSelected(prev => ({ ...prev, status: newStatus }))
        }} />}
      </Modal>

      {/* Add enquiry modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Log New Enquiry" size="md"
        footer={<><Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button><Button>Save Enquiry</Button></>}
      >
        <div className="flex flex-col gap-3.5">
          <Select label="Client" options={[{ value: '', label: 'Select client…' }, ...CLIENTS.map(c => ({ value: c.id, label: c.name }))]} />
          <Select label="Property" options={[{ value: '', label: 'Select property…' }, ...PROPERTIES.map(p => ({ value: p.id, label: p.title }))]} />
          <Select label="Status" options={[{ value: 'enquired', label: 'Enquired' }, { value: 'visited', label: 'Visited' }, { value: 'negotiating', label: 'Negotiating' }, { value: 'converted', label: 'Converted' }]} />
          <FormInput label="Follow-up Date" type="date" />
          <FormInput label="Notes" placeholder="Add a note about this enquiry…" />
        </div>
      </Modal>
    </div>
  )
}

function KanbanCard({ item, col, dragging, onDragStart, onDragEnd, onClick }) {
  const isDraggingThis = dragging?.id === item.id
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border shadow-sm p-3.5 cursor-grab active:cursor-grabbing',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150',
        `border-${col.color}-100`,
        isDraggingThis && 'kanban-dragging'
      )}
    >
      {/* Client */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Avatar name={item.client} size="xs" />
          <span className="text-xs font-bold text-slate-800">{item.client}</span>
        </div>
        <Badge status={item.priority} />
      </div>

      {/* Property */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{item.property}</p>

      {/* Meta */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-slate-100">
        <span className="flex items-center gap-1"><User size={9} />{item.agent}</span>
        <span className="flex items-center gap-1"><Calendar size={9} />{formatDate(item.date)}</span>
      </div>
    </div>
  )
}

const PIPELINE_STEPS = ['enquired', 'visited', 'negotiating', 'converted']
const STEP_META = {
  enquired:    { label: 'Enquired',    color: 'text-blue-600',    ring: 'ring-blue-400',    bg: 'bg-blue-50' },
  visited:     { label: 'Visited',     color: 'text-violet-600',  ring: 'ring-violet-400',  bg: 'bg-violet-50' },
  negotiating: { label: 'Negotiating', color: 'text-amber-600',   ring: 'ring-amber-400',   bg: 'bg-amber-50' },
  converted:   { label: 'Converted',   color: 'text-emerald-600', ring: 'ring-emerald-400', bg: 'bg-emerald-50' },
}

function EnquiryDetail({ enquiry, onStatusChange }) {
  const currentIdx = PIPELINE_STEPS.indexOf(enquiry.status)
  return (
    <div className="flex flex-col gap-5">
      {/* Progress pipeline */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Pipeline Progress</p>
        <div className="flex items-center gap-0">
          {PIPELINE_STEPS.map((s, i) => {
            const meta = STEP_META[s]
            const done   = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => onStatusChange(s)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 shrink-0 group',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all cursor-pointer',
                    done  ? `${meta.bg} ${meta.color} ${meta.ring}` : 'bg-white text-slate-300 ring-slate-200',
                    !active && 'hover:ring-slate-300'
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn('text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap', active ? meta.color : done ? 'text-slate-500' : 'text-slate-300')}>{meta.label}</span>
                </button>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-2 mb-4 rounded-full', i < currentIdx ? 'bg-indigo-400' : 'bg-slate-200')} />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center">Click a step to advance the pipeline</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Client', enquiry.client], ['Agent', enquiry.agent],
          ['Date', formatDate(enquiry.date)], ['Follow Up', formatDate(enquiry.followUpDate)],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{k}</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{v}</p>
          </div>
        ))}
      </div>

      {enquiry.notes && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1.5">Notes</p>
          <p className="text-sm text-slate-700 leading-relaxed">{enquiry.notes}</p>
        </div>
      )}
    </div>
  )
}
