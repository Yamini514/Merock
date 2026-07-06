import { api, setToken } from './client'

// Map backend role -> default landing route used by the auth guards.
export function redirectFor(role) {
  switch (role) {
    case 'super_admin': return '/admin/dashboard'
    case 'admin':  return '/admin/dashboard'
    case 'agent':  return '/admin/properties'
    case 'property_manager':     return '/admin/properties'
    case 'referral_coordinator': return '/admin/referrals'
    case 'viewer': return '/admin/dashboard'
    case 'client': return '/app/dashboard'
    case 'member': return '/app/referrals'
    default:       return '/'
  }
}

// Normalize the backend user record into the shape the UI expects
// (the app references `user.name`; the backend field is `full_name`).
function normalize(info) {
  return {
    ...info,
    name: info.full_name ?? info.name ?? '',
    redirect: redirectFor(info.role),
  }
}

export async function login(email, password) {
  const res = await api.post('/login', { email, password })
  setToken(res.data.token)
  return normalize(res.data.info)
}

export async function register(payload) {
  const res = await api.post('/register', payload)
  setToken(res.data.token)
  return normalize(res.data.info)
}

export async function fetchMe() {
  const res = await api.get('/me/info')
  return normalize(res.data)
}

export async function updateProfile(payload) {
  const res = await api.put('/me/profile', payload)
  return normalize(res.data)
}

export function logout() {
  setToken(null)
}

export const updatePassword = (current_password, new_password) =>
  api.put('/me/update-password', { current_password, new_password })

// Public (no auth) — "forgot password" flow.
export const forgotPassword        = (email)          => api.post('/forgot-password', { email })
export const validatePasswordToken = (token)           => api.post('/validate-password-token', { token })
export const resetPassword         = (token, password) => api.post('/reset-password', { token, password })
