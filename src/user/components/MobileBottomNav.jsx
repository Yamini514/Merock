'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, MessageSquare, Heart, UserCog } from 'lucide-react'
import { useShortlist } from '../../hooks/useShortlist'
import { cn } from '../../utils/cn'

const TABS = [
  { label: 'Home',       href: '/app/dashboard', icon: Home },
  { label: 'Properties', href: '/properties',    icon: Building2 },
  { label: 'Enquiries',  href: '/app/enquiries',  icon: MessageSquare },
  { label: 'Saved',      href: '/app/saved',      icon: Heart },
  { label: 'Account',    href: '/app/profile',    icon: UserCog },
]

// Mobile-only tab bar for the logged-in client/member portal — mirrors the
// app's own routes rather than the public marketing nav.
export default function MobileBottomNav() {
  const pathname = usePathname()
  const { shortlist } = useShortlist()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between px-1">
        {TABS.map(tab => {
          const active = tab.href === '/app/dashboard'
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                active ? 'text-indigo-600' : 'text-slate-400'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              {tab.label}
              {tab.label === 'Saved' && shortlist.length > 0 && (
                <span className="absolute top-1 right-1/2 -mr-3.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {shortlist.length}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
