import { api } from './client'

export const getDashboardOverview  = () => api.get('/dashboard/overview').then(r => r.data)
export const getPropertyDashboard  = () => api.get('/dashboard/properties').then(r => r.data)
export const getCustomerDashboard  = () => api.get('/dashboard/customers').then(r => r.data)
export const getReferralDashboard  = () => api.get('/dashboard/referrals').then(r => r.data)
export const getMatchDashboard     = () => api.get('/dashboard/matches').then(r => r.data)
export const getFollowUpDashboard  = () => api.get('/dashboard/follow-ups').then(r => r.data)
