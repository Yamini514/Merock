import { api, setToken } from './client'

// Map backend role -> default landing route used by the auth guards.
export function redirectFor(role) {
  switch (role) {
    case 'admin':  return '/admin/dashboard'
    case 'agent':  return '/admin/properties'
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

export function logout() {
  setToken(null)
}
