'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, UserCog,
  Share2, Bell, ChevronRight, X,
  ChevronLeft, GanttChart, ShieldCheck, CalendarClock,
  Settings, History, Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { humanizeLabel } from '../utils/formatters'
import { cn } from '../utils/cn'
import logoUrl from '../assets/logo.png'

// Menu visibility mirrors the backend route-guard matrix (routes.rb):
//   admin = Business Owner · agent = Sales Manager · property_manager =
//   Property Manager · referral_coordinator = Referral Coordinator ·
//   viewer = Read-only Viewer. Hiding here is UX only — every permission
//   is enforced server-side too.
const ALL_NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    roles: ['super_admin', 'admin', 'viewer'],
    items: [
      { label: 'Dashboard',  to: '/admin/dashboard',  icon: LayoutDashboard, roles: ['super_admin', 'admin', 'viewer'] },
    ],
  },
  {
    label: 'MANAGE',
    roles: ['super_admin', 'admin', 'agent', 'property_manager', 'referral_coordinator', 'viewer'],
    items: [
      { label: 'Properties', to: '/admin/properties', icon: Building2,      roles: ['super_admin', 'admin', 'agent', 'property_manager', 'viewer'] },
      { label: 'Clients',    to: '/admin/clients',    icon: Users,          roles: ['super_admin', 'admin', 'agent', 'viewer'] },
      { label: 'Agents',     to: '/admin/agents',     icon: UserCog,        roles: ['super_admin', 'admin', 'agent'] },
      { label: 'Enquiries',  to: '/admin/enquiries',  icon: GanttChart,     roles: ['super_admin', 'admin', 'agent', 'viewer'] },
      { label: 'Matching',   to: '/admin/matches',    icon: Sparkles,       roles: ['super_admin', 'admin', 'agent', 'viewer'] },
      { label: 'Follow-ups', to: '/admin/followups',  icon: CalendarClock,  roles: ['super_admin', 'admin', 'agent', 'property_manager', 'referral_coordinator', 'viewer'] },
    ],
  },
  {
    label: 'ENGAGE',
    roles: ['super_admin', 'admin', 'agent', 'property_manager', 'referral_coordinator', 'viewer'],
    items: [
      { label: 'Referrals',  to: '/admin/referrals',  icon: Share2,         roles: ['super_admin', 'admin', 'referral_coordinator', 'viewer'] },
      { label: 'Alerts',     to: '/admin/alerts',     icon: Bell,           roles: ['super_admin', 'admin', 'agent', 'property_manager', 'referral_coordinator', 'viewer'] },
    ],
  },
  {
    label: 'ADMINISTRATION',
    roles: ['super_admin', 'admin'],
    items: [
      { label: 'Users & Roles', to: '/admin/users',    icon: ShieldCheck, roles: ['super_admin'] },
      // Business Owner sees a reduced Settings surface (Matching + Elite
      // Tiers) — narrowed further inside settings/layout.jsx.
      { label: 'Settings',      to: '/admin/settings', icon: Settings,    roles: ['super_admin', 'admin'] },
      { label: 'Activity Log',  to: '/admin/activity', icon: History,     roles: ['super_admin'] },
    ],
  },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useAuth()
  const pathname = usePathname()
  // No role -> no menu (the layout guard redirects anyway; never default
  // to admin-level visibility).
  const role = user?.role || ''

  const NAV_GROUPS = ALL_NAV_GROUPS
  .filter(g => g.roles?.includes(role))
  .map(g => ({
    ...g,
    items: g.items.filter(item => (item.roles || []).includes(role))
  }))
  .filter(g => g.items.length > 0)
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col bg-slate-900',
        'border-r border-slate-800 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center gap-2.5 border-b border-slate-800 shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40 overflow-hidden">
            {/* The logo asset is a wordmark with wide internal margins —
                scale it up inside the clipped box so it reads at icon size. */}
            <img src={logoUrl.src} alt="Rerock Realty" className="w-full h-full object-contain scale-[1.3]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex flex-col justify-center">
              <p className="text-sm font-bold text-white leading-none truncate">Rerock</p>
              <p className="text-[9px] text-slate-500 mt-1 font-semibold tracking-[0.18em] truncate">REALTY ADMIN</p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 text-slate-500 hover:text-slate-300 lg:hidden transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && 'mt-4')}>
              {!collapsed && (
                <p className="text-[9px] font-bold text-slate-600 px-3 mb-1.5 tracking-widest">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ label, to, icon: Icon, badge, badgePulse }) => {
                  const isActive = pathname === to || pathname.startsWith(`${to}/`)
                  return (
                    <Link
                      key={to}
                      href={to}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? label : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      {/* Active left border */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                      )}

                      <Icon size={17} className="shrink-0" />

                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{label}</span>
                          {badge && (
                            <span className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                              badgePulse
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-slate-700 text-slate-400'
                            )}>
                              {badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Collapsed badge dot */}
                      {collapsed && badge && badgePulse && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Signed-in-as footer */}
        {user && (
          <div className={cn(
            'mx-2 mb-3 p-2.5 rounded-xl bg-white/5 border border-slate-800 flex items-center gap-2.5',
            collapsed && 'justify-center px-0'
          )}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500">{humanizeLabel(user.role)}</p>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div className={cn('border-t border-slate-800 flex p-2', collapsed ? 'justify-center' : 'justify-end')}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all hidden lg:flex items-center justify-center"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>
    </>
  )
}
