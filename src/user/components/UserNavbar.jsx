'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Building2, Search, Heart, User, Menu, X, LogOut, LayoutDashboard, Share2, Bell } from 'lucide-react'
import { useShortlist } from '../../hooks/useShortlist'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import logoUrl from '../../assets/logo.png'

const NAV_LINKS = [
  { label: 'Buy',          href: '/properties?type=Apartment' },
  { label: 'Rent',         href: '/properties?mode=rent' },
  { label: 'Commercial',   href: '/properties?type=Commercial' },
  { label: 'New Projects', href: '/properties' },
]

const ROLE_DASH = {
  admin:  '/admin/dashboard',
  agent:  '/admin/properties',
  client: '/app/dashboard',
  member: '/app/referrals',
}

export default function UserNavbar({ transparent = false }) {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQ, setSearchQ]         = useState('')
  const { shortlist }  = useShortlist()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchRef  = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isOpaque  = !transparent || scrolled || mobileOpen || searchOpen
  const navBg     = isOpaque ? 'bg-white shadow-sm border-b border-slate-100' : 'bg-transparent'
  const textColor = isOpaque ? 'text-slate-700' : 'text-white'
  const logoColor = isOpaque ? 'text-indigo-600' : 'text-white'

  function handleLogout() {
    setProfileOpen(false)
    setMobileOpen(false)
    logout()
    router.push('/')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQ.trim()) { router.push(`/properties?q=${encodeURIComponent(searchQ.trim())}`) }
    else { router.push('/properties') }
    setSearchOpen(false)
    setSearchQ('')
  }

  const dashHref = user ? (ROLE_DASH[user.role] || '/app/dashboard') : '/login'

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', navBg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 overflow-hidden', isOpaque ? 'bg-white' : 'bg-white/20 backdrop-blur-sm')}>
              <img src={logoUrl.src} alt="Merock Realty" className="w-full h-full object-contain" />
            </div>
            <span className={cn('text-xl font-bold tracking-tight transition-colors duration-300', logoColor)}>Merock</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  textColor,
                  isOpaque ? 'hover:bg-slate-100 hover:text-indigo-600' : 'hover:bg-white/15 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100 hover:text-indigo-600' : 'hover:bg-white/15 hover:text-white')}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100 hover:text-indigo-600' : 'hover:bg-white/15 hover:text-white')}
            >
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={cn('hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15')}
            >
              <Search className="w-4 h-4" />
              <span className={cn('text-xs', isOpaque ? 'text-slate-400' : 'text-white/70')}>Search…</span>
            </button>

            {/* Shortlist */}
            <Link
              href="/app/saved"
              className={cn('relative p-2 rounded-lg transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15')}
            >
              <Heart className="w-5 h-5" />
              {shortlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {shortlist.length}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15')}
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role}</p>
                    </div>
                    <div className="py-1.5">
                      <Link href={dashHref} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                      </Link>
                      {['client', 'member'].includes(user.role) && (
                        <>
                          <Link href="/app/saved" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Heart className="w-4 h-4 text-slate-400" /> Saved Properties
                          </Link>
                          <Link href="/app/alerts" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <Bell className="w-4 h-4 text-slate-400" /> Alerts
                          </Link>
                        </>
                      )}
                      {user.role === 'member' && (
                        <Link href="/app/referrals" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                          <Share2 className="w-4 h-4 text-slate-400" /> Referrals
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                        <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={cn('hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15')}
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

            {/* Post Property */}
            <Link
              href="/properties"
              className={cn(
                'hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isOpaque ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-white text-indigo-700 hover:bg-white/90 shadow-md'
              )}
            >
              Browse All
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={cn('md:hidden p-2 rounded-lg transition-all duration-200', textColor, isOpaque ? 'hover:bg-slate-100' : 'hover:bg-white/15')}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="hidden md:block pb-3 animate-slide-up">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by location, property type, or keyword…"
                className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false) }}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); if (searchQ) { router.push(`/properties?q=${encodeURIComponent(searchQ)}`); setMobileOpen(false) } }} className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search properties…"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Go</button>
            </form>

            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} className="flex items-center px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/about"   className="flex items-center px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">About</Link>
            <Link href="/contact" className="flex items-center px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Contact</Link>

            <Link href="/app/saved" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
              <Heart className="w-4 h-4" /> Saved {shortlist.length > 0 && `(${shortlist.length})`}
            </Link>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={dashHref} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> My Dashboard
                  </Link>
                  {user.role === 'member' && (
                    <Link href="/app/referrals" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                      <Share2 className="w-4 h-4" /> Referrals
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
              <Link href="/properties" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors text-center">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
