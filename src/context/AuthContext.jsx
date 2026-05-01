import { createContext, useContext, useState } from 'react'

export const CREDENTIALS = [
  { email: 'admin@example.com',  password: 'admin123',  role: 'admin',  name: 'Admin User',   redirect: '/admin/dashboard' },
  { email: 'agent@example.com',  password: 'agent123',  role: 'agent',  name: 'Ravi Kumar',   redirect: '/admin/properties' },
  { email: 'user@example.com',   password: 'user123',   role: 'client', name: 'Arjun Reddy',  redirect: '/app/dashboard' },
  { email: 'member@example.com', password: 'member123', role: 'member', name: 'Priya Sharma', redirect: '/app/referrals' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('merock-auth')) ?? null }
    catch { return null }
  })

  function login(email, password) {
    const match = CREDENTIALS.find(c => c.email === email && c.password === password)
    if (!match) return { error: 'Invalid email or password.' }
    const { password: _pw, ...safe } = match
    localStorage.setItem('merock-auth', JSON.stringify(safe))
    setUser(safe)
    return { user: safe }
  }

  function logout() {
    localStorage.removeItem('merock-auth')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
