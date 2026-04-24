'use client'

import { useState, useEffect, useRef } from 'react'
import { searchCities, searchCountries } from '@/lib/cities'
import type { CountryGroup } from '@/lib/cities'
import type { City } from '@/lib/types'

interface AddLocationModalProps {
  onAdd: (label: string, timezone: string) => void
  onClose: () => void
  existingTimezones: string[]
}

type SearchResult =
  | { kind: 'city'; city: City }
  | { kind: 'country'; group: CountryGroup }

export function AddLocationModal({ onAdd, onClose, existingTimezones }: AddLocationModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState(0)
  const [drillDown, setDrillDown] = useState<CountryGroup | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (drillDown) return // keep results frozen while drilling down
    const countryResults: SearchResult[] = searchCountries(query).map((group) => ({ kind: 'country', group }))
    const cityResults: SearchResult[] = searchCities(query).map((city) => ({ kind: 'city', city }))
    setResults([...countryResults, ...cityResults])
    setSelected(0)
  }, [query, drillDown])

  const handleSelectResult = (result: SearchResult) => {
    if (result.kind === 'city') {
      onAdd(result.city.name, result.city.timezone)
      return
    }
    // Country result
    if (result.group.cities.length === 1) {
      onAdd(result.group.name, result.group.cities[0].timezone)
    } else {
      setDrillDown(result.group)
    }
  }

  const handleSelectDrillDownCity = (city: City) => {
    onAdd(city.name, city.timezone)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (drillDown) {
      const cities = drillDown.cities
      if (e.key === 'ArrowDown') { setSelected((s) => Math.min(s + 1, cities.length - 1)); e.preventDefault() }
      else if (e.key === 'ArrowUp') { setSelected((s) => Math.max(s - 1, 0)); e.preventDefault() }
      else if (e.key === 'Enter' && cities[selected]) handleSelectDrillDownCity(cities[selected])
      else if (e.key === 'Escape') { setDrillDown(null); setSelected(0) }
      return
    }
    if (e.key === 'ArrowDown') { setSelected((s) => Math.min(s + 1, results.length - 1)); e.preventDefault() }
    else if (e.key === 'ArrowUp') { setSelected((s) => Math.max(s - 1, 0)); e.preventDefault() }
    else if (e.key === 'Enter' && results[selected]) handleSelectResult(results[selected])
    else if (e.key === 'Escape') onClose()
  }

  const isCountryFullyAdded = (group: CountryGroup) =>
    group.cities.every((c) => existingTimezones.includes(c.timezone))

  const isCityAdded = (city: City) => existingTimezones.includes(city.timezone)

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
          {drillDown ? (
            <button
              className="flex items-center gap-1.5 text-xs shrink-0"
              style={{ color: 'var(--accent)' }}
              onClick={() => { setDrillDown(null); setSelected(0) }}
            >
              <BackIcon />
              {drillDown.name}
            </button>
          ) : (
            <>
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search city or country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
                  ✕
                </button>
              )}
            </>
          )}
        </div>

        {/* Results */}
        <ul className="overflow-y-auto" style={{ maxHeight: 320 }} onKeyDown={handleKeyDown}>
          {drillDown ? (
            // Drill-down: show timezones for selected country
            drillDown.cities.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No timezones found
              </li>
            ) : (
              drillDown.cities.map((city, i) => {
                const added = isCityAdded(city)
                return (
                  <li
                    key={city.timezone}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      background: i === selected ? 'var(--surface-2)' : 'transparent',
                      color: added ? 'var(--text-muted)' : 'var(--text)',
                    }}
                    onClick={() => !added && handleSelectDrillDownCity(city)}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span className="text-sm font-medium">{city.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {city.timezone.split('/').pop()?.replace(/_/g, ' ')}
                      </span>
                      {added && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                          added
                        </span>
                      )}
                    </div>
                  </li>
                )
              })
            )
          ) : (
            // Main search results
            results.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No locations found
              </li>
            ) : (
              results.map((result, i) => {
                if (result.kind === 'country') {
                  const { group } = result
                  const dimmed = isCountryFullyAdded(group)
                  return (
                    <li
                      key={`country-${group.code}`}
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                      style={{
                        background: i === selected ? 'var(--surface-2)' : 'transparent',
                        color: dimmed ? 'var(--text-muted)' : 'var(--text)',
                      }}
                      onClick={() => !dimmed && handleSelectResult(result)}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon />
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {group.cities.length > 1 ? (
                          <span className="text-xs" style={{ color: 'var(--accent)' }}>
                            {group.cities.length} zones →
                          </span>
                        ) : (
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {group.cities[0]?.timezone.split('/').pop()?.replace(/_/g, ' ')}
                          </span>
                        )}
                        {dimmed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                            added
                          </span>
                        )}
                      </div>
                    </li>
                  )
                }

                // City result
                const { city } = result
                const added = isCityAdded(city)
                return (
                  <li
                    key={`city-${city.name}-${city.timezone}`}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                    style={{
                      background: i === selected ? 'var(--surface-2)' : 'transparent',
                      color: added ? 'var(--text-muted)' : 'var(--text)',
                    }}
                    onClick={() => !added && handleSelectResult(result)}
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
                      {added && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                          added
                        </span>
                      )}
                    </div>
                  </li>
                )
              })
            )
          )}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t flex items-center gap-3 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> {drillDown ? 'back' : 'close'}</span>
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

function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="6" cy="6" rx="2.2" ry="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M7.5 2.5L3.5 6l4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
