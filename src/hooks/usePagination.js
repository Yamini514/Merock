import { useState, useMemo } from 'react'

export function usePagination(data, pageSize = 10) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  function goTo(p) {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }

  return { page, setPage: goTo, totalPages, paginated, total: data.length }
}
