'use client'

import { useState, useEffect, useRef } from 'react'
import { searchCities } from '@/lib/cities'
import type { City } from '@/lib/types'

interface AddLocationModalProps {
  onAdd: (label: string, timezone: string) => void
  onClose: () => void
  existingTimezones: string[]
}

export function AddLocationModal({ onAdd, onClose, existingTimezones }: AddLocationModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<City[]>([])
  const [selected, setSelected] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setResults(searchCities(query))
    setSelected(0)
  }, [query])

  const handleSelect = (city: City) => {
    onAdd(city.name, city.timezone)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelected((s) => Math.min(s + 1, results.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setSelected((s) => Math.max(s - 1, 0))
      e.preventDefault()
    } else if (e.key === 'Enter' && results[selected]) {
      handleSelect(results[selected])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city or timezone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs px-1"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        <ul className="overflow-y-auto" style={{ maxHeight: 320 }}>
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No locations found
            </li>
          ) : (
            results.map((city, i) => {
              const alreadyAdded = existingTimezones.includes(city.timezone) &&
                results.filter((c) => c.timezone === city.timezone).every((c) => existingTimezones.includes(c.timezone))
              return (
                <li
                  key={`${city.name}-${city.timezone}`}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: i === selected ? 'var(--surface-2)' : 'transparent',
                    color: alreadyAdded ? 'var(--text-muted)' : 'var(--text)',
                  }}
                  onClick={() => !alreadyAdded && handleSelect(city)}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div>
                    <span className="text-sm font-medium">{city.name}</span>
                    {city.country && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {city.country}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {city.timezone.split('/').pop()?.replace(/_/g, ' ')}
                    </span>
                    {alreadyAdded && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        added
                      </span>
                    )}
                  </div>
                </li>
              )
            })
          )}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t flex items-center gap-3 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text-muted)' }}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
