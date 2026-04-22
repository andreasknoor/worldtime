'use client'

import { useMemo } from 'react'
import { hasDstChangeWithinWeek, getDstChangeInfo } from '@/lib/timeUtils'
import type { Location } from '@/lib/types'

interface DstWarningProps {
  locations: Location[]
}

export function DstWarning({ locations }: DstWarningProps) {
  const warnings = useMemo(() => {
    return locations
      .filter((l) => hasDstChangeWithinWeek(l.timezone))
      .map((l) => {
        const info = getDstChangeInfo(l.timezone)
        return { location: l, info }
      })
      .filter((w) => w.info !== null)
  }, [locations])

  if (warnings.length === 0) return null

  return (
    <div className="flex flex-col gap-1 px-4 py-2" style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid var(--border)' }}>
      {warnings.map(({ location, info }) => (
        <div key={location.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent-hover)' }}>
          <WarningIcon />
          <span>
            <strong>{location.label}</strong> clocks go {info!.direction === 'forward' ? 'forward' : 'back'} on {info!.date}
          </span>
        </div>
      ))}
    </div>
  )
}

function WarningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="9" r="0.5" fill="currentColor" />
    </svg>
  )
}
