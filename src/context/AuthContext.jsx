'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'

const AUTH_KEY = 'merock-auth'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Start both server and client renders at `null` — reading localStorage
  // synchronously here would mismatch the server-rendered HTML and cause
  // guarded routes to hydrate with a flash-redirect. Resolve it in an effect
  // instead, and expose `initialized` so guards can wait for that resolution.
  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let stored
    try { stored = JSON.parse(localStorage.getItem(AUTH_KEY)) ?? null }
    catch { stored = null }
    // Syncing FROM localStorage (an external store) into state on mount is
    // the legitimate use of setState-in-effect: it can't run during render
    // (SSR has no localStorage) and only fires once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(stored)

    if (stored && getToken()) {
      authApi.fetchMe()
        .then(info => persist(info))
        .catch(() => persist(null)) // token expired/invalid
        .finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
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

  async function updateProfile(payload) {
    try {
      const info = await authApi.updateProfile(payload)
      persist(info)
      return { user: info }
    } catch (err) {
      return { error: err.message || 'Could not update profile.' }
    }
  }

  return (
    <AuthContext.Provider value={{ user, initialized, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
