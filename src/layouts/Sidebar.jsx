import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, UserCog,
  MessageSquare, Share2, Bell, ChevronRight, X,
  ChevronLeft, Sparkles, GanttChart
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'

const ALL_NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    roles: ['admin'],
    items: [
      { label: 'Dashboard',  to: '/admin/dashboard',  icon: LayoutDashboard },
    ],
  },
  {
    label: 'MANAGE',
    roles: ['admin', 'agent'],
    items: [
      { label: 'Properties', to: '/admin/properties', icon: Building2,      badge: '248', roles: ['admin', 'agent'] },
      { label: 'Clients',    to: '/admin/clients',    icon: Users,                        roles: ['admin'] },
      { label: 'Agents',     to: '/admin/agents',     icon: UserCog,                      roles: ['admin'] },
      { label: 'Enquiries',  to: '/admin/enquiries',  icon: GanttChart,     badge: '8',  badgePulse: true, roles: ['admin', 'agent'] },
    ],
  },
  {
    label: 'ENGAGE',
    roles: ['admin'],
    items: [
      { label: 'Referrals',  to: '/admin/referrals',  icon: Share2,                       roles: ['admin'] },
      { label: 'Alerts',     to: '/admin/alerts',     icon: Bell,           badge: '2',  badgePulse: true, roles: ['admin'] },
    ],
  },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useAuth()
  const role = user?.role || 'admin'

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
          'h-16 flex items-center gap-3 border-b border-slate-800 shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
            <Building2 size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-none truncate">Merock</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-wider truncate">REALTY ADMIN</p>
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
                {group.items.map(({ label, to, icon: Icon, badge, badgePulse }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) => cn(
                      'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    {({ isActive }) => (
                      <>
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
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Pro banner (when expanded) */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={12} className="text-indigo-400" />
              <p className="text-xs font-semibold text-slate-200">Upgrade to Pro</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">Unlock advanced analytics and priority support.</p>
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
