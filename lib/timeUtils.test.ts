import { describe, it, expect, vi, afterEach } from 'vitest'
import { DateTime } from 'luxon'
import {
  formatTime,
  formatHour,
  getTimezoneAbbr,
  getOffsetFromHome,
  getHourCategory,
  isWeekendDay,
  hasDstChangeWithinWeek,
  getDstChangeInfo,
  detectUserTimezone,
  detectUserCity,
  isValidIanaTimezone, // RED: does not exist yet
} from '@/lib/timeUtils'

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------
describe('formatTime', () => {
  const afternoon = DateTime.fromObject({ year: 2024, month: 1, day: 15, hour: 15, minute: 30 }, { zone: 'UTC' })
  const midnight  = DateTime.fromObject({ year: 2024, month: 1, day: 15, hour: 0,  minute: 0  }, { zone: 'UTC' })

  it('formats afternoon in 24h', () => {
    expect(formatTime(afternoon, '24')).toBe('15:30')
  })

  it('formats afternoon in 12h', () => {
    expect(formatTime(afternoon, '12')).toBe('3:30 PM')
  })

  it('formats midnight in 24h', () => {
    expect(formatTime(midnight, '24')).toBe('00:00')
  })

  it('formats midnight in 12h', () => {
    expect(formatTime(midnight, '12')).toBe('12:00 AM')
  })
})

// ---------------------------------------------------------------------------
// formatHour
// ---------------------------------------------------------------------------
describe('formatHour', () => {
  it('24h whole hour', () => {
    const dt = DateTime.fromObject({ hour: 9, minute: 0 }, { zone: 'UTC' })
    expect(formatHour(dt, '24')).toBe('09')
  })

  it('24h with minutes', () => {
    const dt = DateTime.fromObject({ hour: 9, minute: 30 }, { zone: 'UTC' })
    expect(formatHour(dt, '24')).toBe('09:30')
  })

  it('24h midnight', () => {
    const dt = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: 'UTC' })
    expect(formatHour(dt, '24')).toBe('00')
  })

  it('12h whole hour', () => {
    const dt = DateTime.fromObject({ hour: 9, minute: 0 }, { zone: 'UTC' })
    expect(formatHour(dt, '12')).toBe('9 AM')
  })

  it('12h with minutes', () => {
    const dt = DateTime.fromObject({ hour: 9, minute: 30 }, { zone: 'UTC' })
    expect(formatHour(dt, '12')).toBe('9:30 AM')
  })

  it('12h midnight', () => {
    const dt = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: 'UTC' })
    expect(formatHour(dt, '12')).toBe('12 AM')
  })
})

// ---------------------------------------------------------------------------
// getTimezoneAbbr
// ---------------------------------------------------------------------------
describe('getTimezoneAbbr', () => {
  it('returns UTC for UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    expect(getTimezoneAbbr('UTC')).toBe('UTC')
  })

  it('returns EST for New York in January', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    expect(getTimezoneAbbr('America/New_York')).toBe('EST')
  })
})

// ---------------------------------------------------------------------------
// getOffsetFromHome — uses non-DST timezones for deterministic results
// ---------------------------------------------------------------------------
describe('getOffsetFromHome', () => {
  it('returns (±0) for same timezone', () => {
    expect(getOffsetFromHome('UTC', 'UTC')).toBe('(±0)')
  })

  it('returns positive whole-hour offset', () => {
    // Pakistan (UTC+5) has no DST
    expect(getOffsetFromHome('Asia/Karachi', 'UTC')).toBe('(+5)')
  })

  it('returns negative whole-hour offset', () => {
    expect(getOffsetFromHome('UTC', 'Asia/Karachi')).toBe('(-5)')
  })

  it('returns positive half-hour offset', () => {
    // India (UTC+5:30) has no DST
    expect(getOffsetFromHome('Asia/Kolkata', 'UTC')).toBe('(+5:30)')
  })

  it('returns negative half-hour offset', () => {
    expect(getOffsetFromHome('UTC', 'Asia/Kolkata')).toBe('(-5:30)')
  })
})

// ---------------------------------------------------------------------------
// getHourCategory
// ---------------------------------------------------------------------------
describe('getHourCategory', () => {
  it('night: hours 0–5', () => {
    expect(getHourCategory(0)).toBe('night')
    expect(getHourCategory(5)).toBe('night')
  })

  it('morning: hours 6–7', () => {
    expect(getHourCategory(6)).toBe('morning')
    expect(getHourCategory(7)).toBe('morning')
  })

  it('business: hours 8–17', () => {
    expect(getHourCategory(8)).toBe('business')
    expect(getHourCategory(17)).toBe('business')
  })

  it('evening: hours 18–21', () => {
    expect(getHourCategory(18)).toBe('evening')
    expect(getHourCategory(21)).toBe('evening')
  })

  it('late: hours 22–23', () => {
    expect(getHourCategory(22)).toBe('late')
    expect(getHourCategory(23)).toBe('late')
  })
})

// ---------------------------------------------------------------------------
// isWeekendDay
// ---------------------------------------------------------------------------
describe('isWeekendDay', () => {
  // 2024-01-15 = Monday, 2024-01-19 = Friday, 2024-01-20 = Saturday, 2024-01-21 = Sunday
  it('returns false for Monday', () => {
    expect(isWeekendDay(DateTime.fromISO('2024-01-15'))).toBe(false)
  })

  it('returns false for Friday', () => {
    expect(isWeekendDay(DateTime.fromISO('2024-01-19'))).toBe(false)
  })

  it('returns true for Saturday', () => {
    expect(isWeekendDay(DateTime.fromISO('2024-01-20'))).toBe(true)
  })

  it('returns true for Sunday', () => {
    expect(isWeekendDay(DateTime.fromISO('2024-01-21'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// hasDstChangeWithinWeek
// ---------------------------------------------------------------------------
describe('hasDstChangeWithinWeek', () => {
  it('returns true when DST spring-forward is within 7 days (US, March 10 2024)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-06T12:00:00.000Z')) // 4 days before spring-forward
    expect(hasDstChangeWithinWeek('America/New_York')).toBe(true)
  })

  it('returns false mid-January — no DST change within 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    expect(hasDstChangeWithinWeek('America/New_York')).toBe(false)
  })

  it('always returns false for UTC', () => {
    expect(hasDstChangeWithinWeek('UTC')).toBe(false)
  })

  it('always returns false for India (no DST)', () => {
    expect(hasDstChangeWithinWeek('Asia/Kolkata')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getDstChangeInfo
// ---------------------------------------------------------------------------
describe('getDstChangeInfo', () => {
  it('returns null when no DST change within 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    expect(getDstChangeInfo('America/New_York')).toBeNull()
  })

  it('returns forward direction before spring-forward', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-06T12:00:00.000Z'))
    const info = getDstChangeInfo('America/New_York')
    expect(info?.direction).toBe('forward')
    expect(info?.date).toBeTruthy()
  })

  it('returns back direction before fall-back (US, November 3 2024)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-10-30T12:00:00.000Z')) // 4 days before fall-back
    const info = getDstChangeInfo('America/New_York')
    expect(info?.direction).toBe('back')
  })
})

// ---------------------------------------------------------------------------
// detectUserTimezone / detectUserCity
// ---------------------------------------------------------------------------
describe('detectUserTimezone', () => {
  it('returns a non-empty string', () => {
    const tz = detectUserTimezone()
    expect(typeof tz).toBe('string')
    expect(tz.length).toBeGreaterThan(0)
  })
})

describe('detectUserCity', () => {
  it('returns an object with label and timezone strings', () => {
    const city = detectUserCity()
    expect(typeof city.label).toBe('string')
    expect(typeof city.timezone).toBe('string')
    expect(city.label.length).toBeGreaterThan(0)
  })

  it('strips underscores from the city label', () => {
    const city = detectUserCity()
    expect(city.label).not.toContain('_')
  })
})

// ---------------------------------------------------------------------------
// isValidIanaTimezone — RED: function does not exist yet
// ---------------------------------------------------------------------------
describe('isValidIanaTimezone', () => {
  it('returns true for valid IANA timezones', () => {
    expect(isValidIanaTimezone('America/New_York')).toBe(true)
    expect(isValidIanaTimezone('Europe/London')).toBe(true)
    expect(isValidIanaTimezone('Asia/Kolkata')).toBe(true)
    expect(isValidIanaTimezone('UTC')).toBe(true)
  })

  it('returns false for made-up timezone strings', () => {
    expect(isValidIanaTimezone('NOT_A_TIMEZONE')).toBe(false)
    expect(isValidIanaTimezone('America/Fake_City')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidIanaTimezone('')).toBe(false)
  })
})
