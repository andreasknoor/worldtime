'use client'

import { useState, useCallback, useRef } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'
import { useLiveClock } from '@/hooks/useLiveClock'
import { detectUserCity } from '@/lib/timeUtils'
import type { Location, SelectedRange } from '@/lib/types'
import { Toolbar } from './Toolbar'
import { LocationGrid } from './LocationGrid'
import { AddLocationModal } from './AddLocationModal'
import { DstWarning } from './DstWarning'
import { Toast } from './Toast'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function getDefaultLocations(): Location[] {
  const userCity = detectUserCity()
  return [
    { id: makeId(), label: userCity.label, timezone: userCity.timezone, isHome: true },
    { id: makeId(), label: 'London', timezone: 'Europe/London', isHome: false },
    { id: makeId(), label: 'New York', timezone: 'America/New_York', isHome: false },
  ]
}

export function WorldTimeBuddy() {
  const now = useLiveClock()
  const [locations, setLocations] = usePersistedState<Location[]>('wtb-locations', getDefaultLocations())
  const [hourFormat, setHourFormat] = usePersistedState<'12' | '24'>('wtb-format', '24')
  const [showAddModal, setShowAddModal] = useState(false)
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  const [selectedRange, setSelectedRange] = useState<SelectedRange>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback(() => {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000)
  }, [])

  const homeLocation = locations.find((l) => l.isHome) ?? locations[0]

  const addLocation = useCallback((label: string, timezone: string) => {
    const exists = locations.some((l) => l.timezone === timezone && l.label === label)
    if (exists) return
    setLocations((prev) => [
      ...prev,
      { id: makeId(), label, timezone, isHome: false },
    ])
  }, [locations, setLocations])

  const removeLocation = useCallback((id: string) => {
    setLocations((prev) => {
      const next = prev.filter((l) => l.id !== id)
      if (next.length === 0) return prev
      if (!next.some((l) => l.isHome)) {
        next[0] = { ...next[0], isHome: true }
      }
      return next
    })
  }, [setLocations])

  const setHome = useCallback((id: string) => {
    setLocations((prev) => prev.map((l) => ({ ...l, isHome: l.id === id })))
  }, [setLocations])

  const reorderLocations = useCallback((newOrder: Location[]) => {
    setLocations(newOrder)
  }, [setLocations])

  const buildCopyLines = useCallback((start: number, end: number): string => {
    if (!homeLocation) return ''
    const homeMidnight = now.setZone(homeLocation.timezone).startOf('day')
    return locations.map((loc) => {
      const startDt = homeMidnight.plus({ hours: start }).setZone(loc.timezone)
      const endDt = homeMidnight.plus({ hours: end + 1 }).setZone(loc.timezone)
      const fmt = (dt: typeof startDt) =>
        hourFormat === '12' ? dt.toFormat('h:mm a') : dt.toFormat('HH:mm')
      return `${loc.label}: ${fmt(startDt)} – ${fmt(endDt)}`
    }).join('\n')
  }, [homeLocation, now, locations, hourFormat])

  const copySelectionToClipboard = useCallback(() => {
    if (!selectedRange) return
    navigator.clipboard.writeText(buildCopyLines(Math.min(...selectedRange), Math.max(...selectedRange))).catch(() => {})
    showToast()
  }, [selectedRange, buildCopyLines, showToast])

  const handleDoubleClickHour = useCallback((hour: number) => {
    setSelectedRange([hour, hour])
    navigator.clipboard.writeText(buildCopyLines(hour, hour)).catch(() => {})
    showToast()
  }, [buildCopyLines, showToast])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      <Toolbar
        hourFormat={hourFormat}
        onHourFormatChange={setHourFormat}
        onAddLocation={() => setShowAddModal(true)}
        selectedRange={selectedRange}
        onCopySelection={copySelectionToClipboard}
        onClearSelection={() => setSelectedRange(null)}
      />

      <DstWarning locations={locations} />

      <LocationGrid
        locations={locations}
        now={now}
        hourFormat={hourFormat}
        hoveredHour={hoveredHour}
        selectedRange={selectedRange}
        homeLocation={homeLocation}
        onHoverHour={setHoveredHour}
        onSelectRange={setSelectedRange}
        onDoubleClickHour={handleDoubleClickHour}
        onRemoveLocation={removeLocation}
        onSetHome={setHome}
        onReorder={reorderLocations}
      />

      <Toast message="Copied to clipboard" visible={toastVisible} />

      {showAddModal && (
        <AddLocationModal
          onAdd={(label, tz) => {
            addLocation(label, tz)
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
          existingTimezones={locations.map((l) => l.timezone)}
        />
      )}
    </div>
  )
}
