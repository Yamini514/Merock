import { Link } from 'react-router-dom'
import { Building2, MapPin, Phone, Mail } from 'lucide-react'

const FOOTER_LINKS = {
  Properties: [
    { label: 'Buy Apartments',     href: '/properties?type=Apartment' },
    { label: 'Villas for Sale',    href: '/properties?type=Villa' },
    { label: 'Rent Residential',   href: '/properties?mode=rent' },
    { label: 'Commercial Spaces',  href: '/properties?type=Commercial' },
    { label: 'New Projects',       href: '/properties' },
  ],
  Company: [
    { label: 'About Us',     href: '/about' },
    { label: 'Contact',      href: '/contact' },
    { label: 'Careers',      href: '/about' },
    { label: 'Blog',         href: '/about' },
    { label: 'Press',        href: '/about' },
  ],
  Support: [
    { label: 'Help Center',      href: '/contact' },
    { label: 'Privacy Policy',   href: '/contact' },
    { label: 'Terms of Use',     href: '/contact' },
    { label: 'Report an Issue',  href: '/contact' },
    { label: 'Sitemap',          href: '/properties' },
  ],
}

const SOCIALS = [
  { label: 'FB', title: 'Facebook' },
  { label: 'TW', title: 'Twitter/X' },
  { label: 'IG', title: 'Instagram' },
  { label: 'LI', title: 'LinkedIn' },
  { label: 'YT', title: 'YouTube' },
]

const TOP_CITIES = [
  { name: 'Hyderabad',   q: 'Hyderabad' },
  { name: 'Bangalore',   q: 'Bangalore' },
  { name: 'Mumbai',      q: 'Mumbai' },
  { name: 'Delhi',       q: 'Delhi' },
  { name: 'Chennai',     q: 'Chennai' },
  { name: 'Pune',        q: 'Pune' },
  { name: 'Kolkata',     q: 'Kolkata' },
  { name: 'Ahmedabad',   q: 'Ahmedabad' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Merock</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              India's most trusted real estate platform. Find your dream home with verified listings, expert agents, and transparent pricing.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-400">Plot 42, HITEC City, Hyderabad — 500081</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-400">1800-123-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-400">hello@merockrealty.com</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-5">
              {SOCIALS.map(({ label, title }) => (
                <button
                  key={label}
                  title={title}
                  aria-label={title}
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-200 text-[10px] font-bold"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Cities strip */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Properties in:</span>
            {TOP_CITIES.map((city, i) => (
              <span key={city.name} className="flex items-center gap-2">
                <Link
                  to={`/properties?q=${city.q}`}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {city.name}
                </Link>
                {i < TOP_CITIES.length - 1 && <span className="text-slate-700">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2024 Merock Realty Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[
              { label: 'Privacy Policy', href: '/contact' },
              { label: 'Terms of Use',   href: '/contact' },
              { label: 'Contact',        href: '/contact' },
            ].map(item => (
              <Link key={item.label} to={item.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
