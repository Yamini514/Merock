// Thin fetch wrapper around the Merock backend API.
//
// Conventions (matching the Roda backend):
//   • Base URL comes from NEXT_PUBLIC_API_URL (no hardcoded host).
//   • Write payloads are wrapped as { data: {...} } (backend reads params[:data]).
//   • Success responses look like { status: 'success', data, total, total_pages }.
//   • Error responses look like   { status: 'error', data: <message|hash> }.
//   • Auth token is a Bearer JWT persisted in localStorage.

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9292/api'
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

async function request(method, path, { body, params, raw } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const init = { method, headers }
  if (body !== undefined) {
    if (raw) {
      // FormData — let the browser set Content-Type (with the multipart boundary) itself.
      init.body = body
    } else {
      headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify({ data: body })
    }
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
    // Session invalidated (expired, rotated by a login elsewhere, or user
    // deactivated). Without this, the app stays in a zombie "logged-in"
    // state where every request fails — clear auth and send the user back
    // to login with an explanatory flag. Guarded on `token` so anonymous
    // visitors hitting an authed endpoint never get bounced.
    setToken(null)
    if (token && typeof window !== 'undefined') {
      localStorage.removeItem('merock-auth')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1'
      }
    }
  }

  if (!res.ok || (json && json.status === 'error')) {
    throw new ApiError(messageFrom(json?.data ?? json?.status, res.status), res.status, json?.data)
  }
  return json ?? { status: 'success', data: null }
}

// Authenticated file download: fetches as a blob (the Authorization header
// can't ride along on a plain <a href>), then triggers a browser download
// using the server's suggested filename.
async function download(path, params) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(buildUrl(path, params), { headers })
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }
  if (!res.ok) {
    let json = null
    try { json = await res.json() } catch { /* non-json error body */ }
    throw new ApiError(messageFrom(json?.data ?? json?.status, res.status), res.status, json?.data)
  }

  const disposition = res.headers.get('Content-Disposition') || ''
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] || 'export.csv'
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  get:    (path, params)   => request('GET', path, { params }),
  post:   (path, body)     => request('POST', path, { body }),
  put:    (path, body)     => request('PUT', path, { body }),
  del:    (path)           => request('DELETE', path),
  upload: (path, formData) => request('POST', path, { body: formData, raw: true }),
  download,
}
