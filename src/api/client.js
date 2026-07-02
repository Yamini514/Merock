// Thin fetch wrapper around the Merock backend API.
//
// Conventions (matching the Roda backend):
//   • Base URL comes from VITE_API_URL (no hardcoded host).
//   • Write payloads are wrapped as { data: {...} } (backend reads params[:data]).
//   • Success responses look like { status: 'success', data, total, total_pages }.
//   • Error responses look like   { status: 'error', data: <message|hash> }.
//   • Auth token is a Bearer JWT persisted in localStorage.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:9292/api'
const TOKEN_KEY = 'merock-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function buildUrl(path, params) {
  let url = `${BASE}${path}`
  if (params) {
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    )
    if (entries.length) url += `?${new URLSearchParams(entries).toString()}`
  }
  return url
}

// Flatten Sequel-style error hashes ({ field: ['msg'] }) into a readable string.
function messageFrom(payload, status) {
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object') {
    const parts = Object.entries(payload).map(([k, v]) =>
      `${k} ${Array.isArray(v) ? v.join(', ') : v}`,
    )
    if (parts.length) return parts.join('; ')
  }
  return `Request failed (${status})`
}

async function request(method, path, { body, params } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const init = { method, headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify({ data: body })
  }

  let res
  try {
    res = await fetch(buildUrl(path, params), init)
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }

  let json = null
  try { json = await res.json() } catch { /* empty/non-json body */ }

  if (res.status === 401) {
    setToken(null)
  }

  if (!res.ok || (json && json.status === 'error')) {
    throw new ApiError(messageFrom(json?.data ?? json?.status, res.status), res.status, json?.data)
  }
  return json ?? { status: 'success', data: null }
}

export const api = {
  get:  (path, params) => request('GET', path, { params }),
  post: (path, body)   => request('POST', path, { body }),
  put:  (path, body)   => request('PUT', path, { body }),
  del:  (path)         => request('DELETE', path),
}
