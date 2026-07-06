'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { redirectFor } from '../../../api/auth'

// The parent /admin layout admits all staff — this narrows the company-wide
// Dashboard to the roles whose SRS scope includes it (Business Owner,
// Read-only Viewer, Super Admin). Operational roles land on their own
// module pages instead; agent dashboard numbers are also scoped server-side.
const ALLOWED = ['super_admin', 'admin', 'viewer']

export default function DashboardLayout({ children }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const allowed = ALLOWED.includes(user?.role)

  useEffect(() => {
    if (!initialized) return
    if (!allowed) router.replace(user ? redirectFor(user.role) : '/login')
  }, [initialized, allowed, user, router])

  if (!initialized || !allowed) return null

  return children
}
