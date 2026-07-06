// Central role/permission helpers — the frontend mirror of the backend
// route-guard matrix in backend/src/routes.rb. UI hiding is a convenience;
// the backend guards are the security boundary.
//
// SRS role mapping:
//   admin                -> Business Owner / Principal
//   agent                -> Sales / Relationship Manager
//   property_manager     -> Property Manager
//   referral_coordinator -> Referral Coordinator
//   viewer               -> Read-only Viewer

export const STAFF_ROLES = [
  'super_admin', 'admin', 'agent',
  'property_manager', 'referral_coordinator', 'viewer',
]

export const isStaff = (user) => Boolean(user && STAFF_ROLES.includes(user.role))
export const isViewer = (user) => user?.role === 'viewer'

// Per-resource write permissions (super_admin implied everywhere).
const WRITE_ROLES = {
  properties: ['admin', 'agent', 'property_manager'],
  customers:  ['admin', 'agent'],
  matches:    ['admin', 'agent'],
  members:    ['admin', 'referral_coordinator'],
  referrals:  ['admin', 'referral_coordinator'],
  followups:  ['admin', 'agent', 'property_manager', 'referral_coordinator'],
  alerts:     ['admin'],
}

export function canWrite(user, resource) {
  if (!user) return false
  if (user.role === 'super_admin') return true
  return (WRITE_ROLES[resource] || []).includes(user.role)
}

// Mirrors DataTransfer::EXPORT_ROLES (viewer deliberately excluded).
const EXPORT_ROLES = {
  properties: ['admin', 'agent', 'property_manager'],
  customers:  ['admin', 'agent'],
  members:    ['admin', 'referral_coordinator'],
  referrals:  ['admin', 'referral_coordinator'],
  matches:    ['admin', 'agent'],
  follow_ups: ['admin', 'agent', 'property_manager', 'referral_coordinator'],
}

export function canExport(user, entity) {
  if (!user) return false
  if (user.role === 'super_admin') return true
  return (EXPORT_ROLES[entity] || []).includes(user.role)
}

// Property import extends to the Business Owner and Property Manager;
// everything else stays super admin (Settings -> Import/Export).
export const canImportProperties = (user) =>
  ['super_admin', 'admin', 'property_manager'].includes(user?.role)

// Bulk match status updates are an admin action (backend: admin_required!).
export const canBulkUpdateMatches = (user) =>
  ['super_admin', 'admin'].includes(user?.role)

// Settings: super_admin sees everything; the Business Owner may edit the
// business keys (Matching, Elite Tiers) only.
export const canAccessSettings = (user) =>
  ['super_admin', 'admin'].includes(user?.role)
export const canEditAllSettings = (user) => user?.role === 'super_admin'
