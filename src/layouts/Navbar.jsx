'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, Menu, ChevronDown, Settings, LogOut, User, Command, Building2, Users, MessageSquare } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Avatar from '../components/Avatar'
import { ALERTS } from '../mock-data/alerts'
import { formatRelativeTime } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'

const TYPE_ICONS  = { new_property: Building2, enquiry: MessageSquare, follow_up: Bell }
const TYPE_COLORS = {
  new_property: 'bg-indigo-50 text-indigo-600',
  price_drop:   'bg-emerald-50 text-emerald-600',
  enquiry:      'bg-blue-50 text-blue-600',
  follow_up:    'bg-amber-50 text-amber-600',
}

const PAGE_LABELS = {
  '/admin/dashboard':  'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/clients':    'Clients',
  '/admin/agents':     'Agents',
  '/admin/enquiries':  'Enquiries',
  '/admin/referrals':  'Referrals',
  '/admin/alerts':     'Alerts',
}

export default function Navbar({ setMobileOpen }) {
  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const unread    = ALERTS.filter(a => !a.read).length
  const pageLabel = Object.entries(PAGE_LABELS).find(([k]) => pathname.startsWith(k))?.[1] || 'Dashboard'

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleLogout() {
    setProfileOpen(false)
    logout()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Page label */}
      <span className="hidden lg:block text-sm font-semibold text-slate-700">{pageLabel}</span>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto sm:mx-0">
        <button className="w-full h-9 flex items-center gap-2.5 pl-3.5 pr-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all text-left group">
          <Search size={13} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-400 flex-1 hidden sm:block">Search anything…</span>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] font-semibold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            <Command size={8} />K
          </kbd>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className={cn(
              'relative p-2.5 rounded-xl transition-colors',
              notifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-slide-down">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{unread} new</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {ALERTS.slice(0, 5).map(a => {
                  const Icon = TYPE_ICONS[a.type] ?? Bell
                  return (
                    <div
                      key={a.id}
                      onClick={() => { router.push('/admin/alerts'); setNotifOpen(false) }}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors',
                        !a.read && 'bg-indigo-50/30'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', TYPE_COLORS[a.type] ?? 'bg-slate-100 text-slate-500')}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(a.time)}</p>
                      </div>
                      {!a.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => { router.push('/admin/alerts'); setNotifOpen(false) }}
                  className="w-full text-xs text-indigo-600 font-semibold hover:underline text-center"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className={cn(
              'flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl transition-colors',
              profileOpen ? 'bg-slate-100' : 'hover:bg-slate-100'
            )}
          >
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role || 'Admin'}</p>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-slide-down">
              <div className="px-4 py-3.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'admin@example.com'}</p>
              </div>
              <div className="py-1.5">
                {[{ icon: User, label: 'Profile' }, { icon: Settings, label: 'Settings' }].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Icon size={14} className="text-slate-400" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} className="text-rose-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
