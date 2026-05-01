import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"              element={<Dashboard />} />
          <Route path="properties"             element={<Properties />} />
          <Route path="properties/add"         element={<AddEditProperty />} />
          <Route path="properties/edit/:id"    element={<AddEditProperty />} />
          <Route path="properties/:id"         element={<PropertyDetail />} />
          <Route path="clients"                element={<Clients />} />
          <Route path="clients/:id"            element={<ClientDetail />} />
          <Route path="agents"                 element={<Agents />} />
          <Route path="referrals"              element={<Referrals />} />
          <Route path="enquiries"              element={<Enquiries />} />
          <Route path="alerts"                 element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
