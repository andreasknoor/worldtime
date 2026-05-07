'use client'

import type { SelectedRange } from '@/lib/types'
// REMOVABLE FEATURE: theme toggle — delete this import and the <ThemeToggle /> render below to remove
import { ThemeToggle } from './ThemeToggle'

interface ToolbarProps {
  hourFormat: '12' | '24'
  onHourFormatChange: (f: '12' | '24') => void
  onAddLocation: () => void
  selectedRange: SelectedRange
  onCopySelection: () => void
  onClearSelection: () => void
}

function formatSelectionHour(hour: number, format: '12' | '24'): string {
  if (format === '12') {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }
  return String(hour).padStart(2, '0') + ':00'
}

export function Toolbar({
  hourFormat,
  onHourFormatChange,
  onAddLocation,
  selectedRange,
  onCopySelection,
  onClearSelection,
}: ToolbarProps) {
  const selectionLabel = selectedRange
    ? selectedRange[0] === selectedRange[1]
      ? formatSelectionHour(selectedRange[0], hourFormat)
      : `${formatSelectionHour(Math.min(...selectedRange), hourFormat)} – ${formatSelectionHour(Math.max(...selectedRange) + 1, hourFormat)}`
    : null

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 gap-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'var(--accent)' }}
        >
          W
        </div>
        <span className="font-semibold text-sm tracking-tight hidden sm:block" style={{ color: 'var(--text)' }}>
          WorldTime
        </span>
      </div>

      {/* Selection banner */}
      {selectedRange && selectionLabel && (
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium flex-1 max-w-xs"
          style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-hover)', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <span className="font-mono">{selectionLabel}</span>
          <span style={{ color: 'var(--text-muted)' }}>selected</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
        {/* Selection actions */}
        {selectedRange && (
          <div className="flex items-center gap-1">
            <button
              onClick={onCopySelection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
              style={{ background: 'var(--accent)', color: '#fff' }}
              title="Copy times to clipboard"
            >
              <ClipboardIcon />
              Copy
            </button>
            <button
              onClick={onClearSelection}
              className="px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              title="Clear selection"
            >
              ✕
            </button>
          </div>
        )}

        {/* REMOVABLE FEATURE: theme toggle render */}
        <ThemeToggle />

        {/* Hour format toggle */}
        <div
          className="flex rounded-md overflow-hidden border text-xs font-medium"
          style={{ borderColor: 'var(--border)' }}
        >
          {(['12', '24'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onHourFormatChange(f)}
              className="px-2.5 py-1.5 transition-colors cursor-pointer"
              style={{
                background: hourFormat === f ? 'var(--accent)' : 'var(--surface-2)',
                color: hourFormat === f ? '#fff' : 'var(--text-muted)',
              }}
            >
              {f === '12' ? '12h' : '24h'}
            </button>
          ))}
        </div>

        {/* Add location */}
        <button
          onClick={onAddLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
          style={{ background: 'var(--surface-2)', color: 'var(--accent-hover)', border: '1px solid var(--border)' }}
        >
          <PlusIcon />
          <span>Add location</span>
        </button>
      </div>
    </header>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="2" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 2V1h4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
