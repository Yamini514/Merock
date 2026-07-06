import { api } from './client'

export const listReferrals  = (params)   => api.get('/referrals', params)
export const getReferral    = (id)       => api.get(`/referrals/${id}`).then(r => r.data)
export const createReferral = (data)     => api.post('/referrals', data).then(r => r.data)
export const updateReferral = (id, data) => api.put(`/referrals/${id}`, data).then(r => r.data)
export const deleteReferral = (id)       => api.del(`/referrals/${id}`)

// Member-portal — the logged-in member's own profile + referral history.
export const getMyReferrals = () => api.get('/me/referrals').then(r => r.data)
