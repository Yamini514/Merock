'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { redirectFor } from '../../api/auth'

export default function AdminIndexRedirect() {
  const { user } = useAuth()
  // Same role -> landing map the login flow uses (api/auth.js).
  const target = user ? redirectFor(user.role) : '/admin/dashboard'
  redirect(target.startsWith('/admin') ? target : '/admin/dashboard')
}
