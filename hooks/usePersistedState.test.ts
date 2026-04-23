import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePersistedState } from '@/hooks/usePersistedState'
import type { Location } from '@/lib/types'

const validLocation: Location = {
  id: 'abc123',
  label: 'New York',
  timezone: 'America/New_York',
  isHome: true,
}

// Vitest's jsdom doesn't expose localStorage.clear — use a manual mock
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear:      () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key:        (i: number) => Object.keys(store)[i] ?? null,
})

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
})

describe('usePersistedState', () => {
  it('returns the default value when localStorage is empty', () => {
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([])
  })

  it('loads a valid locations array from localStorage', () => {
    store['wtb-locations'] = JSON.stringify([validLocation])
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([validLocation])
  })

  it('falls back to default on malformed JSON', () => {
    store['wtb-locations'] = 'not valid json {{{'
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([])
  })

  it('falls back to default when stored value is not an array', () => {
    store['wtb-locations'] = JSON.stringify({ foo: 'bar' })
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([])
  })

  it('falls back to default when a location is missing required fields', () => {
    store['wtb-locations'] = JSON.stringify([{ id: '1', label: 'X' }])
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([])
  })

  it('accepts "12" as a valid format value', () => {
    store['wtb-format'] = '"12"'
    const { result } = renderHook(() => usePersistedState<'12' | '24'>('wtb-format', '24'))
    expect(result.current[0]).toBe('12')
  })

  it('accepts "24" as a valid format value', () => {
    store['wtb-format'] = '"24"'
    const { result } = renderHook(() => usePersistedState<'12' | '24'>('wtb-format', '24'))
    expect(result.current[0]).toBe('24')
  })

  it('falls back to default for an unrecognised format value', () => {
    store['wtb-format'] = '"bogus"'
    const { result } = renderHook(() => usePersistedState<'12' | '24'>('wtb-format', '24'))
    expect(result.current[0]).toBe('24')
  })

  it('persists updated value to localStorage', async () => {
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    await act(async () => {
      result.current[1]([validLocation])
    })
    expect(JSON.parse(store['wtb-locations'] ?? '[]')).toEqual([validLocation])
  })

  // RED: will fail until isValidIanaTimezone is wired into the location validator
  it('rejects a location whose timezone is not a valid IANA string', () => {
    store['wtb-locations'] = JSON.stringify([
      { id: '1', label: 'Fake', timezone: 'NOT_A_VALID_TIMEZONE', isHome: true },
    ])
    const { result } = renderHook(() => usePersistedState<Location[]>('wtb-locations', []))
    expect(result.current[0]).toEqual([])
  })
})
