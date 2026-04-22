'use client'

import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'

export function useLiveClock(): DateTime {
  const [now, setNow] = useState<DateTime>(DateTime.now())

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>

    const tick = () => setNow(DateTime.now())

    // Align to the next minute boundary, then tick every 60s
    const msToNextMinute = (60 - DateTime.now().second) * 1000 - DateTime.now().millisecond
    const timeoutId = setTimeout(() => {
      tick()
      intervalId = setInterval(tick, 60_000)
    }, msToNextMinute)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return now
}
