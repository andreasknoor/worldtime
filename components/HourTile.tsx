'use client'

import { DateTime } from 'luxon'
import { getHourCategory, formatHour } from '@/lib/timeUtils'

interface HourTileProps {
  hour: number
  dt: DateTime
  hourFormat: '12' | '24'
  isHovered: boolean
  isSelected: boolean
  isSelectionStart: boolean
  isSelectionEnd: boolean
  isCurrentHour: boolean
  onMouseEnter: () => void
  onMouseDown: () => void
  onMouseUp: () => void
  onDoubleClick: () => void
}

export function HourTile({
  hour,
  dt,
  hourFormat,
  isHovered,
  isSelected,
  isSelectionStart,
  isSelectionEnd,
  isCurrentHour,
  onMouseEnter,
  onMouseDown,
  onMouseUp,
  onDoubleClick,
}: HourTileProps) {
  const category = getHourCategory(dt.hour)

  const labelColor = isHovered || isSelected
    ? '#ffffff'
    : isCurrentHour
    ? 'var(--home-accent)'
    : category === 'business'
    ? 'var(--tile-text-business)'
    : 'var(--tile-text)'

  const categoryBg: Record<typeof category, string> = {
    night: 'var(--tile-night)',
    morning: 'var(--tile-morning)',
    business: 'var(--tile-business)',
    evening: 'var(--tile-evening)',
    late: 'var(--tile-late)',
  }

  return (
    <div
      className="relative flex items-end justify-center shrink-0 cursor-pointer select-none"
      style={{
        width: 'var(--tile-w)',
        height: 'var(--tile-h)',
        background: categoryBg[category],
        borderRight: '1px solid var(--border)',
        paddingBottom: 8,
      }}
      onMouseEnter={onMouseEnter}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown() }}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
    >
      {/* Hover column highlight */}
      {isHovered && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(99,102,241,0.22)' }} />
          <div className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none" style={{ background: 'var(--accent)' }} />
        </>
      )}

      {/* Selection tint */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(99,102,241,0.32)' }} />
      )}

      {/* Selection edge borders */}
      {isSelectionStart && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderLeft: '2px solid var(--accent)' }} />
      )}
      {isSelectionEnd && (
        <div className="absolute inset-0 pointer-events-none" style={{ borderRight: '2px solid var(--accent)' }} />
      )}

      {/* Current hour ring */}
      {isCurrentHour && (
        <div
          className="absolute inset-0.5 pointer-events-none rounded-sm"
          style={{ border: '2px solid var(--home-accent)', opacity: 0.7 }}
        />
      )}

      {/* Hour label */}
      {hourFormat === '12' ? (
        <div className="relative z-10 flex flex-col items-center leading-none gap-[2px]" style={{ color: labelColor }}>
          <span className="text-sm font-bold tabular-nums">{dt.toFormat('h')}</span>
          {dt.minute !== 0 && (
            <span className="text-[10px] font-semibold tabular-nums opacity-90">{dt.toFormat(':mm')}</span>
          )}
          <span className="text-[7px] font-semibold tracking-wide opacity-70">{dt.toFormat('a')}</span>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center leading-none gap-[2px]" style={{ color: labelColor }}>
          <span className="text-sm font-bold tabular-nums">{dt.toFormat('HH')}</span>
          {dt.minute !== 0 && (
            <span className="text-[7px] font-semibold tracking-wide opacity-80">{dt.toFormat(':mm')}</span>
          )}
        </div>
      )}
    </div>
  )
}
