'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { cn } from '../../../utils/cn'

// The parent /admin layout admits all staff — this narrows Settings to
// super_admin (everything) and the Business Owner (admin), who gets the
// business tabs only: Matching weights and Elite Tiers (SRS: "limited
// technical settings"). The backend enforces the same key whitelist on
// PUT /settings, so this is UX, not the security boundary.
const TABS = [
  { label: 'Application',   to: '/admin/settings' },
  { label: 'Master Data',   to: '/admin/settings/master-data' },
  { label: 'Matching',      to: '/admin/settings/matching',  admin: true },
  { label: 'Elite Tiers',   to: '/admin/settings/tiers',     admin: true },
  { label: 'Templates',     to: '/admin/settings/templates' },
  { label: 'Notifications', to: '/admin/settings/notifications' },
  { label: 'Import / Export', to: '/admin/settings/import-export' },
]

export default function SettingsLayout({ children }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isSuperAdmin = user?.role === 'super_admin'
  const isOwner = user?.role === 'admin'
  const allowed = isSuperAdmin || isOwner

  const tabs = isSuperAdmin ? TABS : TABS.filter(t => t.admin)
  // The Business Owner's subtree is only the whitelisted tabs — a direct
  // URL to any other settings page bounces to their first allowed tab.
  const onAllowedPage = isSuperAdmin || tabs.some(t => t.to === pathname)

  useEffect(() => {
    if (!initialized) return
    if (!allowed) router.replace('/admin/dashboard')
    else if (!onAllowedPage) router.replace(tabs[0].to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, allowed, onAllowedPage, router])

  if (!initialized || !allowed || !onAllowedPage) return null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 -mb-1 overflow-x-auto">
        {tabs.map(tab => {
          const active = pathname === tab.to
          return (
            <Link
              key={tab.to}
              href={tab.to}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
