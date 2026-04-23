'use client'

import { useState, useEffect } from 'react'
import { isValidIanaTimezone } from '@/lib/timeUtils'

function isLocation(v: unknown): boolean {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.label === 'string' &&
    typeof r.timezone === 'string' && isValidIanaTimezone(r.timezone) &&
    typeof r.isHome === 'boolean'
  )
}

function isValidValue(key: string, value: unknown): boolean {
  if (key === 'wtb-locations') {
    return Array.isArray(value) && value.every(isLocation)
  }
  if (key === 'wtb-format') {
    return value === '12' || value === '24'
  }
  return true
}

export function usePersistedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        const parsed = JSON.parse(stored)
        if (isValidValue(key, parsed)) {
          setValue(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage errors
    }
  }, [key, value, hydrated])

  return [value, setValue]
}
