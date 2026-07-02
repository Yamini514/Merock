'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import UserNavbar from '../../user/components/UserNavbar'
import Footer from '../../user/components/Footer'

export default function UserAppLayout({ children }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const allowed = user && ['client', 'member'].includes(user.role)

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (!allowed) {
      router.replace('/admin/dashboard')
    }
  }, [initialized, user, allowed, pathname, router])

  if (!initialized || !allowed) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
