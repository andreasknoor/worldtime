import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLiveClock } from '@/hooks/useLiveClock'

afterEach(() => {
  vi.useRealTimers()
})

describe('useLiveClock', () => {
  it('returns the current time on mount', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:30:00.000Z'))
    const { result } = renderHook(() => useLiveClock())
    // toUTC() makes the assertion timezone-agnostic
    expect(result.current.toUTC().hour).toBe(12)
    expect(result.current.toUTC().minute).toBe(30)
  })

  it('updates at the next minute boundary', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:30:30.000Z')) // 30 s into the minute

    const { result } = renderHook(() => useLiveClock())
    expect(result.current.toUTC().minute).toBe(30)

    // Advance 30 001 ms — fires the alignment timeout
    await act(async () => { vi.advanceTimersByTime(30_001) })

    expect(result.current.toUTC().minute).toBe(31)
  })

  it('continues ticking every 60 s after alignment', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:30:30.000Z'))

    const { result } = renderHook(() => useLiveClock())

    await act(async () => { vi.advanceTimersByTime(30_001) }) // alignment
    expect(result.current.toUTC().minute).toBe(31)

    await act(async () => { vi.advanceTimersByTime(60_000) }) // first interval tick
    expect(result.current.toUTC().minute).toBe(32)
  })

  it('cleans up the timeout on unmount before alignment fires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:30:30.000Z'))

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderHook(() => useLiveClock())
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
