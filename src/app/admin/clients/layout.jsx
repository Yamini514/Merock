'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { redirectFor } from '../../../api/auth'

// Clients (customers/leads) — the Sales Manager's core SRS duty, plus the
// Business Owner and the Read-only Viewer. Property Manager and Referral
// Coordinator are redirected to their own landing pages; the backend
// additionally scopes agents to assigned + shared records.
const ALLOWED = ['super_admin', 'admin', 'agent', 'viewer']

export default function ClientsLayout({ children }) {
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
