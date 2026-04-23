import { DateTime } from 'luxon'
import type { Location } from './types'

export function getNow(timezone: string): DateTime {
  return DateTime.now().setZone(timezone)
}

export function getHourInZone(baseDate: DateTime, hour: number, timezone: string): DateTime {
  return baseDate.setZone(timezone).startOf('day').plus({ hours: hour })
}

export function formatTime(dt: DateTime, format: '12' | '24'): string {
  if (format === '12') return dt.toFormat('h:mm a')
  return dt.toFormat('HH:mm')
}

export function formatHour(dt: DateTime, format: '12' | '24'): string {
  if (format === '12') return dt.minute !== 0 ? dt.toFormat('h:mm a') : dt.toFormat('h a')
  return dt.minute !== 0 ? dt.toFormat('HH:mm') : dt.toFormat('HH')
}

export function getTimezoneAbbr(timezone: string): string {
  return DateTime.now().setZone(timezone).toFormat('ZZZZ')
}

export function getUtcOffset(timezone: string): string {
  return DateTime.now().setZone(timezone).toFormat('ZZ')
}

export function getOffsetFromHome(timezone: string, homeTimezone: string): string {
  const homeDt = DateTime.now().setZone(homeTimezone)
  const targetDt = DateTime.now().setZone(timezone)
  const diffMinutes = targetDt.offset - homeDt.offset
  if (diffMinutes === 0) return '(±0)'
  const sign = diffMinutes > 0 ? '+' : '-'
  const abs = Math.abs(diffMinutes)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  return mins > 0 ? `(${sign}${hours}:${String(mins).padStart(2, '0')})` : `(${sign}${hours})`
}

export function getHourCategory(hour: number): 'night' | 'morning' | 'business' | 'evening' | 'late' {
  if (hour >= 0 && hour < 6) return 'night'
  if (hour >= 6 && hour < 8) return 'morning'
  if (hour >= 8 && hour < 18) return 'business'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'late'
}

export function isWeekendDay(dt: DateTime): boolean {
  return dt.weekday === 6 || dt.weekday === 7
}

export function hasDstChangeWithinWeek(timezone: string): boolean {
  const now = DateTime.now().setZone(timezone)
  for (let i = 1; i <= 7; i++) {
    const future = now.plus({ days: i })
    if (future.offset !== now.offset) return true
  }
  return false
}

export function getDstChangeInfo(timezone: string): { date: string; direction: 'forward' | 'back' } | null {
  const now = DateTime.now().setZone(timezone)
  for (let i = 1; i <= 7; i++) {
    const future = now.plus({ days: i })
    if (future.offset !== now.offset) {
      return {
        date: future.toFormat('cccc, LLL d'),
        direction: future.offset > now.offset ? 'forward' : 'back',
      }
    }
  }
  return null
}

export function detectUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function detectUserCity(): { label: string; timezone: string } {
  const tz = detectUserTimezone()
  const parts = tz.split('/')
  const city = parts[parts.length - 1].replace(/_/g, ' ')
  return { label: city, timezone: tz }
}

export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone) return false
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}
