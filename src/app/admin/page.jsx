'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

export default function AdminIndexRedirect() {
  const { user } = useAuth()
  redirect(user?.role === 'agent' ? '/admin/properties' : '/admin/dashboard')
}
