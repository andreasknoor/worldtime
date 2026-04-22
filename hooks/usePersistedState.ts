'use client'

import { useState, useEffect } from 'react'

function isLocation(v: unknown): boolean {
  return (
    typeof v === 'object' && v !== null &&
    typeof (v as Record<string, unknown>).id === 'string' &&
    typeof (v as Record<string, unknown>).label === 'string' &&
    typeof (v as Record<string, unknown>).timezone === 'string' &&
    typeof (v as Record<string, unknown>).isHome === 'boolean'
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
