'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { DateTime } from 'luxon'
import type { Location, SelectedRange } from '@/lib/types'
import { LocationRow } from './LocationRow'
import { formatHour } from '@/lib/timeUtils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface LocationGridProps {
  locations: Location[]
  now: DateTime
  hourFormat: '12' | '24'
  hoveredHour: number | null
  selectedRange: SelectedRange
  homeLocation: Location | undefined
  onHoverHour: (h: number | null) => void
  onSelectRange: (r: SelectedRange) => void
  onDoubleClickHour: (h: number) => void
  onRemoveLocation: (id: string) => void
  onSetHome: (id: string) => void
  onReorder: (locations: Location[]) => void
}

export function LocationGrid({
  locations,
  now,
  hourFormat,
  hoveredHour,
  selectedRange,
  homeLocation,
  onHoverHour,
  onSelectRange,
  onDoubleClickHour,
  onRemoveLocation,
  onSetHome,
  onReorder,
}: LocationGridProps) {
  const mainRef = useRef<HTMLElement>(null)
  const dragStartHour = useRef<number | null>(null)
  const isDraggingTile = useRef(false)

  const [dragRowIndex, setDragRowIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Scroll to current hour on mount
  useEffect(() => {
    const main = mainRef.current
    if (!main || !homeLocation) return
    const homeTz = homeLocation.timezone ?? 'UTC'
    const currentHour = now.setZone(homeTz).hour
    const cell = main.querySelector(`[data-hour="${currentHour}"]`) as HTMLElement | null
    if (!cell) return
    const mainRect = main.getBoundingClientRect()
    const cellRect = cell.getBoundingClientRect()
    const scrollTo = main.scrollLeft + cellRect.left - mainRect.left - main.clientWidth / 2 + cellRect.width / 2
    main.scrollLeft = Math.max(0, scrollTo)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTileDragStart = useCallback((hour: number) => {
    dragStartHour.current = hour
    isDraggingTile.current = true
    onSelectRange([hour, hour])
  }, [onSelectRange])

  const handleTileDragMove = useCallback((hour: number) => {
    if (!isDraggingTile.current || dragStartHour.current === null) return
    const start = dragStartHour.current
    onSelectRange([Math.min(start, hour), Math.max(start, hour)])
  }, [onSelectRange])

  const handleTileDragEnd = useCallback(() => {
    isDraggingTile.current = false
    dragStartHour.current = null
  }, [])

  const handleRowDragStart = (index: number) => setDragRowIndex(index)
  const handleRowDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }
  const handleRowDrop = (index: number) => {
    if (dragRowIndex === null || dragRowIndex === index) {
      setDragRowIndex(null)
      setDragOverIndex(null)
      return
    }
    const next = [...locations]
    const [moved] = next.splice(dragRowIndex, 1)
    next.splice(index, 0, moved)
    onReorder(next)
    setDragRowIndex(null)
    setDragOverIndex(null)
  }

  const homeTz = homeLocation?.timezone ?? 'UTC'

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-auto"
      style={{ background: 'var(--bg)' }}
      onMouseUp={() => { if (isDraggingTile.current) handleTileDragEnd() }}
    >
      <div style={{ width: 'max-content', margin: '24px auto', minWidth: 'calc(var(--header-w) + 24 * var(--tile-w))' }}>

        {/* Hour axis — sticky top */}
        <div
          className="flex sticky top-0 z-20"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="shrink-0" style={{ width: 'var(--header-w)', borderRight: '1px solid var(--border)' }} />
          {HOURS.map((hour) => {
            const dt = now.setZone(homeTz).startOf('day').plus({ hours: hour })
            const isCurrentHour = now.setZone(homeTz).hour === hour
            return (
              <div
                key={hour}
                data-hour={hour}
                className="relative flex items-center justify-center shrink-0 text-[10px] font-mono overflow-hidden"
                style={{
                  width: 'var(--tile-w)',
                  height: 'var(--axis-h)',
                  borderRight: '1px solid var(--border)',
                  color: isCurrentHour ? 'var(--home-accent)' : hoveredHour === hour ? '#fff' : 'var(--text-muted)',
                  background: hoveredHour === hour ? 'rgba(99,102,241,0.25)' : 'transparent',
                  fontWeight: isCurrentHour || hoveredHour === hour ? 600 : 400,
                }}
              >
                {hoveredHour === hour && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--accent)' }} />
                )}
                {formatHour(dt, hourFormat)}
              </div>
            )
          })}
        </div>

        {/* Location rows */}
        {locations.length === 0 ? (
          <div className="flex items-center justify-center h-40" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Add a location to get started.</p>
          </div>
        ) : (
          locations.map((location, index) => (
            <div
              key={location.id}
              draggable
              onDragStart={() => handleRowDragStart(index)}
              onDragOver={(e) => handleRowDragOver(e, index)}
              onDrop={() => handleRowDrop(index)}
              onDragEnd={() => { setDragRowIndex(null); setDragOverIndex(null) }}
            >
              <LocationRow
                location={location}
                now={now}
                hourFormat={hourFormat}
                hoveredHour={hoveredHour}
                selectedRange={selectedRange}
                homeLocation={homeLocation ?? locations[0]}
                onHoverHour={onHoverHour}
                onDragStart={handleTileDragStart}
                onDragMove={handleTileDragMove}
                onDragEnd={handleTileDragEnd}
                onDoubleClickHour={onDoubleClickHour}
                onRemove={() => onRemoveLocation(location.id)}
                onSetHome={() => onSetHome(location.id)}
                isDragging={dragRowIndex === index}
                isDragOver={dragOverIndex === index}
              />
            </div>
          ))
        )}

      </div>
    </main>
  )
}
