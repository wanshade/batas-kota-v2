// WITA (GMT+8) timezone utilities

export const WITA_TIMEZONE = 'Asia/Makassar'

/**
 * Get current date in WITA timezone (GMT+8)
 * @returns Date string in YYYY-MM-DD format
 */
export function getWITADateString(): string {
  const now = new Date()
  // Convert to WITA (GMT+8)
  const witaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000))
  return witaTime.toISOString().split('T')[0]
}

/**
 * Get current time in WITA timezone
 * @returns Current time in WITA timezone
 */
export function getWITANow(): Date {
  const now = new Date()
  // Convert to WITA (GMT+8)
  return new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000))
}

/**
 * Check if a time slot is available for booking based on current time
 * @param date - Date string in YYYY-MM-DD format
 * @param hour - Hour in 24-hour format (6-23)
 * @returns true if slot is available, false if it's in the past
 */
export function isTimeSlotAvailable(date: string, hour: number): boolean {
  const witaNow = getWITANow()
  const slotDate = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`)

  // If slot is today, check if it's at least 15 minutes in the future
  if (date === getWITADateString()) {
    const fifteenMinutesFromNow = new Date(witaNow.getTime() + 15 * 60 * 1000)
    return slotDate > fifteenMinutesFromNow
  }

  // If slot is in the future, it's available
  return slotDate > witaNow
}

/**
 * Get the minimum date that can be booked (today in WITA)
 * @returns Date string in YYYY-MM-DD format
 */
export function getMinBookingDate(): string {
  return getWITADateString()
}

/**
 * Check if a time slot has passed (is in the past)
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns true if the slot has passed, false otherwise
 */
export function isTimeSlotPassed(date: string, time: string): boolean {
  const witaNow = getWITANow()
  const slotDateTime = new Date(`${date}T${time}:00`)

  // If slot is not today, it hasn't passed yet
  if (date !== getWITADateString()) {
    return false
  }

  // Check if slot time is earlier than current time
  return slotDateTime <= witaNow
}

/**
 * Get time slot status information
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns Object with status information
 */
export function getTimeSlotStatus(date: string, time: string): {
  status: 'available' | 'passed' | 'future' | 'today'
  description: string
  isInPast: boolean
} {
  const witaNow = getWITANow()
  const slotDateTime = new Date(`${date}T${time}:00`)
  const isInPast = isTimeSlotPassed(date, time)

  if (date !== getWITADateString()) {
    const tomorrow = new Date(witaNow)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date === tomorrow.toISOString().split('T')[0]) {
      return {
        status: 'future',
        description: 'Besok',
        isInPast
      }
    }

    return {
      status: 'future',
      description: 'Mendatang',
      isInPast
    }
  }

  if (isInPast) {
    return {
      status: 'passed',
      description: 'Sudah Lewat',
      isInPast: true
    }
  }

  // Check if it's at least 15 minutes in the future
  const fifteenMinutesFromNow = new Date(witaNow.getTime() + 15 * 60 * 1000)
  if (slotDateTime > fifteenMinutesFromNow) {
    return {
      status: 'available',
      description: 'Tersedia',
      isInPast
    }
  }

  return {
    status: 'today',
    description: 'Terlalu Dekat',
    isInPast
  }
}