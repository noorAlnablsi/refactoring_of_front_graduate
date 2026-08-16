import { useCallback, useEffect, useRef, useState } from 'react'
import { countGlobalSearchHits, flattenGlobalSearchResults } from '../lib/globalSearch'
import { globalSearch } from '../services/search.service'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 1

export function useGlobalSearch({ perTypeLimit = 5 } = {}) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)
  const requestIdRef = useRef(0)
  const rootRef = useRef(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setPayload(null)
      setError('')
      setLoading(false)
      return undefined
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError('')
    setOpen(true)

    globalSearch({ q: debouncedQuery, perTypeLimit })
      .then((data) => {
        if (requestId !== requestIdRef.current) return
        setPayload(data)
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        setPayload(null)
        setError(err.message || 'Search failed')
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return
        setLoading(false)
      })

    return undefined
  }, [debouncedQuery, perTypeLimit])

  const clear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    setPayload(null)
    setError('')
    setOpen(false)
  }, [])

  const sections = flattenGlobalSearchResults(payload)
  const totalHits = countGlobalSearchHits(payload)
  const hasQuery = debouncedQuery.length >= MIN_QUERY_LENGTH

  return {
    rootRef,
    query,
    setQuery,
    open,
    setOpen,
    loading,
    error,
    sections,
    totalHits,
    hasQuery,
    clear,
  }
}
