import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useAuth } from '../context/AuthContext'
import { getMySaved, toggleSaved } from '../api/customers'

// Hybrid shortlist:
//  - Anonymous visitors keep a localStorage list so browsing still works.
//  - Logged-in portal users (client/member) read/write the server-side
//    shortlist stored on their Customer profile, so it follows them
//    across devices and shows up in the admin CRM.
export function useShortlist() {
  const { user, initialized } = useAuth()
  const isPortalUser = Boolean(user && ['client', 'member'].includes(user.role))

  const [localList, setLocalList] = useLocalStorage('merock-shortlist', [])
  const [serverList, setServerList] = useState([])

  useEffect(() => {
    if (!initialized || !isPortalUser) return
    getMySaved()
      .then(d => setServerList(d.ids ?? []))
      .catch(() => { /* keep empty on failure; UI still works */ })
  }, [initialized, isPortalUser])

  const shortlist = isPortalUser ? serverList : localList

  const toggle = useCallback((id) => {
    if (isPortalUser) {
      // Optimistic flip, then reconcile with the server's canonical list.
      setServerList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
      toggleSaved(id)
        .then(d => setServerList(d.ids ?? []))
        .catch(() => getMySaved().then(d => setServerList(d.ids ?? [])).catch(() => {}))
    } else {
      setLocalList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }, [isPortalUser, setLocalList])

  const isShortlisted = useCallback((id) => shortlist.includes(id), [shortlist])

  const clear = useCallback(() => {
    if (isPortalUser) {
      const ids = [...serverList]
      setServerList([])
      Promise.all(ids.map(id => toggleSaved(id)))
        .catch(() => getMySaved().then(d => setServerList(d.ids ?? [])).catch(() => {}))
    } else {
      setLocalList([])
    }
  }, [isPortalUser, serverList, setLocalList])

  return { shortlist, toggle, isShortlisted, clear }
}
