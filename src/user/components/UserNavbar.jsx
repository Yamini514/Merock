import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Building2, Search, Heart, User, Menu, X, ChevronDown, Phone, Bell } from 'lucide-react'
import { useShortlist } from '../../hooks/useShortlist'
import { cn } from '../../utils/cn'

const NAV_LINKS = [
  { label: 'Buy', href: '/listings?type=buy' },
  { label: 'Rent', href: '/listings?type=rent' },
  { label: 'Commercial', href: '/listings?type=commercial' },
  { label: 'New Projects', href: '/listings?type=new' },
]

export default function UserNavbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { shortlist } = useShortlist()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const isOpaque = !transparent || scrolled || mobileOpen
  const navBg = isOpaque
    ? 'bg-white shadow-sm border-b border-slate-100'
    : 'bg-transparent'
  const textColor = isOpaque ? 'text-slate-700' : 'text-white'
  const logoColor = isOpaque ? 'text-indigo-600' : 'text-white'

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', navBg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300', isOpaque ? 'bg-indigo-600' : 'bg-white/20 backdrop-blur-sm')}>
              <Building2 className={cn('w-5 h-5', isOpaque ? 'text-white' : 'text-white')} />
            </div>
            <span className={cn('text-xl font-bold tracking-tight transition-colors duration-300', logoColor)}>
              Merock
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  textColor,
                  isOpaque
                    ? 'hover:bg-slate-100 hover:text-indigo-600'
                    : 'hover:bg-white/15 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={cn(
                'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                textColor,
                isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15'
              )}
            >
              <Search className="w-4 h-4" />
              <span className={cn('text-xs', isOpaque ? 'text-slate-400' : 'text-white/70')}>Search...</span>
            </button>

            {/* Shortlist */}
            <Link
              to="/shortlist"
              className={cn(
                'relative p-2 rounded-lg transition-all duration-200',
                textColor,
                isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15'
              )}
            >
              <Heart className="w-5 h-5" />
              {shortlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {shortlist.length}
                </span>
              )}
            </Link>

            {/* Sign In */}
            <Link
              to="/my-account"
              className={cn(
                'hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                textColor,
                isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15'
              )}
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>

            {/* Post Property CTA */}
            <button
              onClick={() => navigate('/listings')}
              className={cn(
                'hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isOpaque
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  : 'bg-white text-indigo-700 hover:bg-white/90 shadow-md'
              )}
            >
              Post Property
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={cn(
                'md:hidden p-2 rounded-lg transition-all duration-200',
                textColor,
                isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15'
              )}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Expand Bar */}
        {searchOpen && (
          <div className="hidden md:block pb-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by location, project, or property type..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                onKeyDown={e => {
                  if (e.key === 'Enter') { navigate('/listings'); setSearchOpen(false) }
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 rounded-xl text-slate-700 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/my-account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" /> My Account
              </Link>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Post Property Free
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
