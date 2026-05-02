import { createContext, useContext, useState } from 'react'

export const CREDENTIALS = [
  { email: 'admin@example.com',  password: 'admin123',  role: 'admin',  name: 'Admin User',   redirect: '/admin/dashboard' },
  { email: 'agent@example.com',  password: 'agent123',  role: 'agent',  name: 'Ravi Kumar',   redirect: '/admin/properties' },
  { email: 'user@example.com',   password: 'user123',   role: 'client', name: 'Arjun Reddy',  redirect: '/app/dashboard' },
  { email: 'member@example.com', password: 'member123', role: 'member', name: 'Priya Sharma', redirect: '/app/referrals' },
]

const USERS_KEY = 'merock-registered-users'
const AuthContext = createContext(null)

function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [] }
  catch { return [] }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('merock-auth')) ?? null }
    catch { return null }
  })

  function login(email, password) {
    const demo = CREDENTIALS.find(c => c.email === email && c.password === password)
    if (demo) {
      const { password: _pw, ...safe } = demo
      localStorage.setItem('merock-auth', JSON.stringify(safe))
      setUser(safe)
      return { user: safe }
    }
    const reg = getRegisteredUsers().find(u => u.email === email && u.password === password)
    if (reg) {
      const { password: _pw, ...safe } = reg
      localStorage.setItem('merock-auth', JSON.stringify(safe))
      setUser(safe)
      return { user: safe }
    }
    return { error: 'Invalid email or password.' }
  }

  function register({ name, email, phone, password, role }) {
    const allEmails = [...CREDENTIALS, ...getRegisteredUsers()].map(u => u.email)
    if (allEmails.includes(email)) return { error: 'An account with this email already exists.' }
    const redirectMap = { client: '/app/dashboard', member: '/app/referrals' }
    const newUser = { email, name, phone, role, redirect: redirectMap[role] ?? '/' }
    const registered = getRegisteredUsers()
    localStorage.setItem(USERS_KEY, JSON.stringify([...registered, { ...newUser, password }]))
    localStorage.setItem('merock-auth', JSON.stringify(newUser))
    setUser(newUser)
    return { user: newUser }
  }

  function logout() {
    localStorage.removeItem('merock-auth')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
