'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'

// The parent /admin layout already admits admin/agent — this narrows the
// Activity Log subtree to super_admin only.
export default function ActivityLayout({ children }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const allowed = user?.role === 'super_admin'

  useEffect(() => {
    if (!initialized) return
    if (!allowed) router.replace('/admin/dashboard')
  }, [initialized, allowed, router])

  if (!initialized || !allowed) return null

  return children
}
