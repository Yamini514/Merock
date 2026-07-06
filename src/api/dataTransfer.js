import { api } from './client'

// Downloads a CSV/XLSX export of an entity (properties, customers, members,
// referrals, matches, follow_ups, activity_logs).
export const exportEntity = (entity, format = 'csv') =>
  api.download(`/export/${entity}`, { format })

// Imports a CSV/XLSX file; returns { created, updated, failed: [{row, errors}] }.
export const importEntity = (entity, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.upload(`/import/${entity}`, fd).then(r => r.data)
}
