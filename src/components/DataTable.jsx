import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'
import { usePagination } from '../hooks/usePagination'
import Pagination from './Pagination'
import { cn } from '../utils/cn'

export default function DataTable({
  columns, data, pageSize = 10,
  searchable = true, searchKeys = [],
  emptyMessage = 'No records found.',
  emptyIcon,
  className,
  onRowClick,
  stickyHeader = false,
}) {
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState({ key: null, dir: 'asc' })

  const filtered = useMemo(() => {
    let result = [...data]
    if (search && searchKeys.length) {
      const q = search.toLowerCase()
      result = result.filter(row =>
        searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
      )
    }
    if (sort.key) {
      result.sort((a, b) => {
        const cmp = String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true })
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [data, search, searchKeys, sort])

  const { page, setPage, totalPages, paginated, total } = usePagination(filtered, pageSize)

  function toggleSort(key) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search…"
              className="w-full h-9 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-sm">
          <thead>
            <tr className={cn('bg-slate-50/80 border-b border-slate-200/80', stickyHeader && 'sticky top-0 z-10')}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap select-none tracking-wide',
                    col.sortable && 'cursor-pointer hover:text-slate-700',
                    col.align === 'right' && 'text-right'
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex flex-col gap-px">
                        <ChevronUp size={9} className={cn(sort.key === col.key && sort.dir === 'asc' ? 'text-indigo-600' : 'text-slate-300')} />
                        <ChevronDown size={9} className={cn(sort.key === col.key && sort.dir === 'desc' ? 'text-indigo-600' : 'text-slate-300')} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon && <div className="text-slate-300">{emptyIcon}</div>}
                    <p className="text-sm text-slate-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'group transition-colors duration-100',
                    onRowClick ? 'cursor-pointer hover:bg-indigo-50/40' : 'hover:bg-slate-50/60'
                  )}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3.5 text-slate-600 whitespace-nowrap', col.align === 'right' && 'text-right')}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}
