'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../layouts/Sidebar'
import Navbar from '../../layouts/Navbar'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { cn } from '../../utils/cn'

export default function AdminLayout({ children }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const allowed = user && [
    'super_admin', 'admin', 'agent',
    'property_manager', 'referral_coordinator', 'viewer',
  ].includes(user.role)

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.replace('/login')
    } else if (!allowed) {
      router.replace('/')
    }
  }, [initialized, user, allowed, router])

  if (!initialized || !allowed) return null

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={cn(
        'flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
        'ml-0',
        collapsed ? 'lg:ml-16' : 'lg:ml-60'
      )}>
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 min-w-0 p-4 sm:p-7 max-w-[1600px] w-full overflow-x-clip">
          {children}
        </main>
      </div>
    </div>
  )
}
