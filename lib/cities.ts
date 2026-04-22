import citiesData from '@/data/cities.json'
import type { City } from './types'

const cities: City[] = citiesData as City[]

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
