import citiesData from '@/data/cities.json'
import type { City } from './types'

const cities: City[] = citiesData as City[]

export interface CountryGroup {
  code: string
  name: string
  cities: City[] // one representative city per unique timezone
}

let _countryGroups: CountryGroup[] | null = null

function buildCountryGroups(): CountryGroup[] {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const byCode: Record<string, City[]> = {}

  for (const city of cities) {
    if (!city.country) continue // skip Etc/GMT entries with no country code
    if (!byCode[city.country]) byCode[city.country] = []
    if (!byCode[city.country].some((c) => c.timezone === city.timezone)) {
      byCode[city.country].push(city)
    }
  }

  return Object.entries(byCode)
    .map(([code, tzCities]) => ({
      code,
      name: displayNames.of(code) ?? code,
      cities: tzCities,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function getCountryGroups(): CountryGroup[] {
  if (!_countryGroups) _countryGroups = buildCountryGroups()
  return _countryGroups
}

export function searchCountries(query: string): CountryGroup[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return getCountryGroups()
    .filter((g) => g.name.toLowerCase().includes(q))
    .slice(0, 4)
}

export function searchCities(query: string): City[] {
  if (!query.trim()) return cities.slice(0, 20)
  const q = query.toLowerCase()
  return cities
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q)
    )
    .slice(0, 20)
}

export function getAllCities(): City[] {
  return cities
}
