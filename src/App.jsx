import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './auth/LoginPage'
import UserLayout from './layouts/UserLayout'
import AppLayout from './layouts/AppLayout'

// Public pages — no auth required
import HomePage from './user/pages/HomePage'
import ListingsPage from './user/pages/ListingsPage'
import PropertyDetailPage from './user/pages/PropertyDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'

// Protected user pages (client + member)
import UserDashboardPage from './user/pages/UserDashboardPage'
import ShortlistPage from './user/pages/ShortlistPage'
import AlertsPage from './user/pages/AlertsPage'
import MemberReferralsPage from './user/pages/MemberReferralsPage'

// Admin pages
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import AddEditProperty from './pages/AddEditProperty'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Agents from './pages/Agents'
import Referrals from './pages/Referrals'
import Enquiries from './pages/Enquiries'
import Alerts from './pages/Alerts'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!['admin', 'agent'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

function UserRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />
  if (!['client', 'member'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />
  return children
}

function AdminIndexRedirect() {
  const { user } = useAuth()
  if (user?.role === 'agent') return <Navigate to="properties" replace />
  return <Navigate to="dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Public routes — no auth needed ── */}
          <Route element={<UserLayout />}>
            <Route path="/"             element={<HomePage />} />
            <Route path="/properties"   element={<ListingsPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/about"        element={<AboutPage />} />
            <Route path="/contact"      element={<ContactPage />} />
          </Route>

          {/* ── Protected user routes (client / member) ── */}
          <Route path="/app" element={<UserRoute><UserLayout /></UserRoute>}>
            <Route path="dashboard"  element={<UserDashboardPage />} />
            <Route path="saved"      element={<ShortlistPage />} />
            <Route path="alerts"     element={<AlertsPage />} />
            <Route path="referrals"  element={<MemberReferralsPage />} />
          </Route>

          {/* ── Admin / Agent routes ── */}
          <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
            <Route index element={<AdminIndexRedirect />} />
            <Route path="dashboard"           element={<Dashboard />} />
            <Route path="properties"          element={<Properties />} />
            <Route path="properties/add"      element={<AddEditProperty />} />
            <Route path="properties/edit/:id" element={<AddEditProperty />} />
            <Route path="properties/:id"      element={<PropertyDetail />} />
            <Route path="clients"             element={<Clients />} />
            <Route path="clients/:id"         element={<ClientDetail />} />
            <Route path="agents"              element={<Agents />} />
            <Route path="referrals"           element={<Referrals />} />
            <Route path="enquiries"           element={<Enquiries />} />
            <Route path="alerts"              element={<Alerts />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
