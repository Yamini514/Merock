'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { redirectFor } from '../../../api/auth'

// Members & referrals — the Referral Coordinator's SRS domain, plus the
// Business Owner and Read-only Viewer. Agents are redirected (the backend
// also denies them member/referral writes and the referral dashboard).
const ALLOWED = ['super_admin', 'admin', 'referral_coordinator', 'viewer']

export default function ReferralsLayout({ children }) {
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
