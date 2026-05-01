import { Outlet, useLocation } from 'react-router-dom'
import UserNavbar from '../user/components/UserNavbar'
import Footer from '../user/components/Footer'

export default function UserLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === '/home'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserNavbar transparent={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
