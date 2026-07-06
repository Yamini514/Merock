'use client'

import { useState, useCallback } from 'react'
import { Plus, GanttChart, List, ArrowRight } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import Avatar from '../../../components/Avatar'
import DataTable from '../../../components/DataTable'
import Modal from '../../../components/Modal'
import Button from '../../../components/Button'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listMatches, updateMatch } from '../../../api/matches'
import GeneralEnquiries from './_components/GeneralEnquiries'
import KanbanCard from './_components/KanbanCard'
import EnquiryDetail from './_components/EnquiryDetail'
import LogEnquiryModal from './_components/LogEnquiryModal'
import { COLUMNS } from './_components/columns'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite } from '../../../utils/permissions'
import { formatDate } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

export default function Enquiries() {
  const { user } = useAuth()
  const writable = canWrite(user, 'matches')
  const [view, setView]         = useState('kanban')
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [selected, setSelected] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [actionErr, setActionErr] = useState('')

  const matchesFetcher = useCallback(() => listMatches({ page_size: 300 }), [])
  const { data: matchesData, loading, error, refetch } = useApi(matchesFetcher, [])
  const items = matchesData?.data ?? []

  async function changeStatus(match, newStatus, notes) {
    setActionErr('')
    try {
      await updateMatch(match.id, { status: newStatus, notes: notes ?? match.notes })
      refetch()
      if (selected?.id === match.id) setSelected(s => ({ ...s, status: newStatus }))
    } catch (e) {
      setActionErr(e.message)
    }
  }

  function handleDragStart(e, item) {
    if (!writable) return // read-only roles can't move cards
    setDragging(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, colId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  function handleDrop(e, targetStatus) {
    e.preventDefault()
    if (dragging && dragging.status !== targetStatus) changeStatus(dragging, targetStatus)
    setDragging(null)
    setDragOver(null)
  }

  function handleDragEnd() { setDragging(null); setDragOver(null) }

  const tableColumns = [
    { key: 'customer_name', label: 'Client', sortable: true, render: v => <div className="flex items-center gap-2.5"><Avatar name={v || '?'} size="sm" /><span className="font-medium text-slate-800 text-sm">{v || 'Unknown'}</span></div> },
    { key: 'property_title', label: 'Property', sortable: true, render: v => <span className="text-sm text-slate-600 max-w-[200px] truncate block">{v}</span> },
    { key: 'created_at', label: 'Date', sortable: true, render: v => <span className="text-xs text-slate-500">{formatDate(v)}</span> },
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
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
              <button onClick={() => setView('kanban')} className={cn('p-2.5 transition-colors', view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><GanttChart size={15} /></button>
              <button onClick={() => setView('table')} className={cn('p-2.5 transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><List size={15} /></button>
            </div>
            {writable && (
              <Button onClick={() => setAddModal(true)} className="flex-1 sm:flex-initial justify-center"><Plus size={14} /> Log Enquiry</Button>
            )}
          </>
        }
      />

      <ErrorBanner message={error?.message || actionErr} />

      <GeneralEnquiries />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Kanban conversion summary strip */}
          {view === 'kanban' && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {COLUMNS.map((col, i) => {
                const count = items.filter(e => e.status === col.id).length
                return (
                  <div key={col.id} className="flex items-center gap-2 shrink-0">
                    <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50')}>
                      <span className={cn('w-2 h-2 rounded-full', col.header_bar)} />
                      <span className="text-sm font-bold text-slate-700">{count}</span>
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
                      'flex flex-col gap-3 min-w-[260px] w-64 shrink-0 rounded-2xl p-3 border-2 transition-all duration-150',
                      isOver ? 'kanban-drag-over' : 'border-transparent bg-slate-100/60'
                    )}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2.5">
                        <span className={cn('w-2.5 h-2.5 rounded-full', col.header_bar)} />
                        <span className="text-sm font-bold text-slate-700">{col.label}</span>
                        <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center', col.count_bg)}>
                          {colItems.length}
                        </span>
                      </div>
                    </div>

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
                searchKeys={['customer_name', 'property_title']}
                pageSize={8}
                onRowClick={setSelected}
              />
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Enquiry Details"
        subtitle={selected?.property_title}
        size="md"
        footer={<Button onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && <EnquiryDetail enquiry={selected} writable={writable} onStatusChange={(newStatus, notes) => changeStatus(selected, newStatus, notes)} />}
      </Modal>

      {/* Add enquiry modal */}
      {addModal && <LogEnquiryModal onClose={() => setAddModal(false)} onCreated={() => { setAddModal(false); refetch() }} />}
    </div>
  )
}
