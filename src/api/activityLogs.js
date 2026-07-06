import { api } from './client'

export const listActivityLogs = (params) => api.get('/activity-logs', params)

// Per-record history (staff-readable; agent ownership enforced server-side).
export const recordHistory = (entityType, id) =>
  api.get(`/activity-logs/for/${entityType}/${id}`).then(r => r.data)
