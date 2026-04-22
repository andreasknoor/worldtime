'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { HourTile } from './HourTile'
import { getTimezoneAbbr, getOffsetFromHome, formatTime, isWeekendDay } from '@/lib/timeUtils'
import type { Location, SelectedRange } from '@/lib/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface LocationRowProps {
  location: Location
  now: DateTime
  hourFormat: '12' | '24'
  hoveredHour: number | null
  selectedRange: SelectedRange
  homeLocation: Location
  onHoverHour: (h: number | null) => void
  onDragStart: (h: number) => void
  onDragMove: (h: number) => void
  onDragEnd: () => void
  onDoubleClickHour: (h: number) => void
  onRemove: () => void
  onSetHome: () => void
  isDragging: boolean
  isDragOver: boolean
}

export function LocationRow({
  location,
  now,
  hourFormat,
  hoveredHour,
  selectedRange,
  homeLocation,
  onHoverHour,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDoubleClickHour,
  onRemove,
  onSetHome,
  isDragging,
  isDragOver,
}: LocationRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const localNow = now.setZone(location.timezone)
  const abbr = getTimezoneAbbr(location.timezone)
  const offsetInfo = location.isHome ? null : getOffsetFromHome(location.timezone, homeLocation.timezone)
  const isWeekendNow = isWeekendDay(localNow)

  // Anchor to home timezone midnight so each column = same absolute moment across all rows
  const homeMidnight = now.setZone(homeLocation.timezone).startOf('day')
  const homeCurrentHour = now.setZone(homeLocation.timezone).hour

  const isInSelection = (hour: number): boolean => {
    if (!selectedRange) return false
    const [a, b] = [Math.min(...selectedRange), Math.max(...selectedRange)]
    return hour >= a && hour <= b
  }

  return (
    <div
      className="flex relative"
      style={{
        opacity: isDragging ? 0.4 : 1,
        transition: 'opacity 0.15s',
        borderTop: isDragOver ? '2px solid var(--accent)' : '2px solid transparent',
        borderBottom: '1px solid var(--border)',
        // Elevate this row above subsequent rows when its menu is open,
        // so the dropdown isn't clipped by later rows painting on top.
        zIndex: showMenu ? 100 : 'auto',
      }}
    >
      {/* Sticky location header */}
      <div
        className="sticky left-0 z-10 flex flex-col justify-center px-3 py-2 shrink-0 border-r group relative"
        style={{
          width: 'var(--header-w)',
          minWidth: 'var(--header-w)',
          background: location.isHome ? 'rgba(16,185,129,0.06)' : 'var(--surface)',
          borderColor: 'var(--border)',
          borderRight: `1px solid ${location.isHome ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
        }}
      >
        {/* Home dot */}
        {location.isHome && (
          <div
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
            style={{ background: 'var(--home-accent)' }}
          />
        )}

        {/* Top row: city + abbr */}
        <div className="flex items-baseline gap-1 pl-2">
          <span
            className="font-semibold text-xs sm:text-sm truncate"
            style={{ color: location.isHome ? 'var(--home-accent)' : 'var(--text)' }}
            title={location.label}
          >
            {location.label}
          </span>
          <span className="text-[9px] sm:text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
            {abbr}
          </span>
        </div>

        {/* Current time */}
        <div className="pl-2 mt-0.5">
          <span
            className="text-base sm:text-xl font-bold tabular-nums leading-none"
            style={{ color: location.isHome ? 'var(--home-accent)' : 'var(--text)' }}
          >
            {formatTime(localNow, hourFormat)}
          </span>
        </div>

        {/* Date + offset on one line */}
        <div className="flex items-baseline gap-1 pl-2 mt-0.5">
          <span
            className="text-[9px] sm:text-[11px]"
            style={{ color: isWeekendNow ? 'var(--accent-hover)' : 'var(--text-muted)' }}
          >
            {localNow.toFormat('EEE d MMM')}
          </span>
          {offsetInfo && (
            <span className="text-[8px] sm:text-[9px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {offsetInfo}
            </span>
          )}
        </div>

        {/* Menu button */}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
        >
          <DotsIcon />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div
            className="absolute right-2 top-full mt-1 z-50 rounded-lg shadow-xl border py-1 min-w-[140px]"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            onMouseLeave={() => setShowMenu(false)}
          >
            {!location.isHome && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
                style={{ color: 'var(--text)' }}
                onClick={() => { onSetHome(); setShowMenu(false) }}
              >
                Set as home
              </button>
            )}
            <button
              className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
              style={{ color: '#f87171' }}
              onClick={() => { onRemove(); setShowMenu(false) }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Hour tiles row */}
      <div
        className="flex"
        onMouseLeave={() => onHoverHour(null)}
      >
        {HOURS.map((hour) => {
          // Convert the absolute moment (home midnight + hour) to this row's local timezone
          const tileDate = homeMidnight.plus({ hours: hour }).setZone(location.timezone)
          const sel = isInSelection(hour)
          const selMin = selectedRange ? Math.min(...selectedRange) : -1
          const selMax = selectedRange ? Math.max(...selectedRange) : -1
          return (
            <HourTile
              key={hour}
              hour={hour}
              dt={tileDate}
              hourFormat={hourFormat}
              isHovered={hoveredHour === hour}
              isSelected={sel}
              isSelectionStart={sel && hour === selMin}
              isSelectionEnd={sel && hour === selMax}
              isCurrentHour={hour === homeCurrentHour}
              onMouseEnter={() => { onHoverHour(hour); onDragMove(hour) }}
              onMouseDown={() => onDragStart(hour)}
              onMouseUp={onDragEnd}
              onDoubleClick={() => onDoubleClickHour(hour)}
            />
          )
        })}
      </div>
    </div>
  )
}

function DotsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="2" cy="6" r="1.2" fill="currentColor" />
      <circle cx="6" cy="6" r="1.2" fill="currentColor" />
      <circle cx="10" cy="6" r="1.2" fill="currentColor" />
    </svg>
  )
}
