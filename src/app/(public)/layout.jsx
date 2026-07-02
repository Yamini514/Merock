'use client'

import { usePathname } from 'next/navigation'
import UserNavbar from '../../user/components/UserNavbar'
import Footer from '../../user/components/Footer'

export default function PublicLayout({ children }) {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserNavbar transparent={isHome} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
