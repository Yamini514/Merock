import { useLocalStorage } from './useLocalStorage'

export function useShortlist() {
  const [shortlist, setShortlist] = useLocalStorage('merock-shortlist', [])

  function toggle(id) {
    setShortlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function isShortlisted(id) {
    return shortlist.includes(id)
  }

  function clear() {
    setShortlist([])
  }

  return { shortlist, toggle, isShortlisted, clear }
}
