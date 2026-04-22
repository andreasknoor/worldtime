export interface Location {
  id: string
  label: string
  timezone: string
  isHome: boolean
}

export interface AppState {
  locations: Location[]
  hourFormat: '12' | '24'
}

export interface City {
  name: string
  country: string
  timezone: string
}

export type SelectedRange = [number, number] | null
