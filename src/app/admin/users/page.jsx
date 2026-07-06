'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ShieldAlert, Edit2, UserX } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import DataTable from '../../../components/DataTable'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import FilterPills from '../../../components/FilterPills'
import Spinner from '../../../components/Spinner'
import { useAuth } from '../../../context/AuthContext'
import { listUsers, deactivateUser } from '../../../api/users'
import { useApi } from '../../../hooks/useApi'

const ROLE_OPTIONS = ['All', 'super_admin', 'admin', 'agent', 'property_manager', 'referral_coordinator', 'viewer', 'client', 'member']

export default function UsersPage() {
  const router = useRouter()
  const { user: me } = useAuth()
  const [activeRole, setActiveRole] = useState('All')

  const fetcher = useCallback(
    () => listUsers({
      role: activeRole === 'All' ? undefined : activeRole,
      page_size: 300,
    }),
    [activeRole],
  )
  const { data, loading, error, refetch } = useApi(fetcher, [activeRole])

  const users = data?.data ?? []
  const total = data?.total ?? users.length

  async function handleDeactivate(u) {
    if (u.id === me?.id) { alert("You can't deactivate your own account."); return }
    if (!window.confirm(`Deactivate ${u.full_name}? They will no longer be able to log in.`)) return
    try { await deactivateUser(u.id); refetch() }
    catch (e) { alert(e.message) }
  }

  const columns = [
    {
      key: 'full_name', label: 'Name', sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{val}</p>
          <p className="text-xs text-slate-400 mt-0.5">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone_number', label: 'Phone' },
    { key: 'role', label: 'Role', render: v => <Badge status={v} /> },
    { key: 'active', label: 'Status', render: v => <Badge status={v ? 'active' : 'inactive'} dot /> },
    {
      key: 'last_logged_in_at', label: 'Last Login',
      render: v => <span className="text-xs text-slate-500">{v ? new Date(v).toLocaleString('en-IN') : 'Never'}</span>,
    },
    {
      key: 'id', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); router.push(`/admin/users/edit/${row.id}`) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          {row.active && (
            <button
              onClick={e => { e.stopPropagation(); handleDeactivate(row) }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <UserX size={13} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Users & Roles"
        subtitle={`${total} accounts`}
        breadcrumb={['Home', 'Users & Roles']}
        actions={
          <Button onClick={() => router.push('/admin/users/add')} className="w-full sm:w-auto justify-center">
            <Plus size={14} /> Add User
          </Button>
        }
      />

      {/* Role filter pills */}
      <FilterPills
        options={ROLE_OPTIONS}
        value={activeRole}
        onChange={setActiveRole}
        getLabel={r => (r === 'All' ? 'All' : r.replace('_', ' '))}
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <ShieldAlert size={16} /> {error.message}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No users found" description="Try a different role filter, or add the first account." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <DataTable
            columns={columns}
            data={users}
            searchable
            searchKeys={['full_name', 'email', 'phone_number']}
            pageSize={10}
            onRowClick={row => router.push(`/admin/users/edit/${row.id}`)}
          />
        </div>
      )}
    </div>
  )
}
