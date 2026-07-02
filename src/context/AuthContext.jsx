import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'

const AUTH_KEY = 'merock-auth'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) ?? null }
    catch { return null }
  })

  // Revalidate the persisted session against the backend on first load.
  useEffect(() => {
    if (!user || !getToken()) return
    authApi.fetchMe()
      .then(info => persist(info))
      .catch(() => persist(null)) // token expired/invalid
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persist(info) {
    if (info) localStorage.setItem(AUTH_KEY, JSON.stringify(info))
    else localStorage.removeItem(AUTH_KEY)
    setUser(info)
  }

  async function login(email, password) {
    try {
      const info = await authApi.login(email, password)
      persist(info)
      return { user: info }
    } catch (err) {
      return { error: err.message || 'Invalid email or password.' }
    }
  }

  async function register(payload) {
    try {
      const info = await authApi.register(payload)
      persist(info)
      return { user: info }
    } catch (err) {
      return { error: err.message || 'Could not create account.' }
    }
  }

  function logout() {
    authApi.logout()
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
