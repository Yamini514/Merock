import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cn } from '../utils/cn'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
        'ml-0 lg:ml-60',
        collapsed && 'lg:ml-16'
      )}>
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-5 sm:p-7 max-w-[1600px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
