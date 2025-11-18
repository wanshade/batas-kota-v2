export interface TimeSlot {
  jam: string
  harga: number
}

export interface ScheduleData {
  Senin_sd_Kamis: TimeSlot[]
  Jumat: TimeSlot[]
  Sabtu: TimeSlot[]
  Minggu: TimeSlot[]
}

export type DayType = 'Senin_sd_Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'

// Function to get day type from a date
export function getDayType(date: Date): DayType {
  const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' })

  switch (dayName) {
    case 'Senin':
    case 'Selasa':
    case 'Rabu':
    case 'Kamis':
      return 'Senin_sd_Kamis'
    case 'Jumat':
      return 'Jumat'
    case 'Sabtu':
      return 'Sabtu'
    case 'Minggu':
      return 'Minggu'
    default:
      return 'Senin_sd_Kamis'
  }
}

// Function to parse time slot "jam" field into start and end times
export function parseTimeSlot(jam: string): { start: string; end: string } {
  const [start, end] = jam.split(' - ')
  // Convert dot format to colon format for Date compatibility
  const startFormatted = start.replace('.', ':')
  const endFormatted = end.replace('.', ':')
  return { start: startFormatted, end: endFormatted }
}

// Function to check if a time falls within a time slot
export function isTimeInSlot(checkTime: string, slotJam: string): boolean {
  const { start, end } = parseTimeSlot(slotJam)
  return checkTime >= start && checkTime <= end
}

// Function to get schedule data (client-side only - uses API)
export async function getScheduleData(): Promise<ScheduleData> {
  try {
    const response = await fetch('/api/schedule')
    if (!response.ok) throw new Error('Failed to fetch schedule')
    const { schedule } = await response.json()
    return schedule
  } catch (error) {
    console.error('Error reading schedule file:', error)
    return {
      Senin_sd_Kamis: [],
      Jumat: [],
      Sabtu: [],
      Minggu: []
    }
  }
}

// Function to get available time slots for a specific date (client-side only)
export async function getAvailableTimeSlots(date: Date): Promise<TimeSlot[]> {
  try {
    const response = await fetch('/api/schedule')
    if (!response.ok) throw new Error('Failed to fetch schedule')
    const { schedule } = await response.json()
    const dayType = getDayType(date)
    return schedule[dayType] || []
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return []
  }
}

// Note: calculateBookingPrice has been moved to schedule-server.ts for server-side use only
// Import calculateBookingPriceServer from schedule-server.ts instead

// Function to get price for a specific time slot (client-side only)
export async function getTimeSlotPrice(date: Date, timeSlot: string): Promise<number> {
  try {
    const response = await fetch('/api/schedule')
    if (!response.ok) throw new Error('Failed to fetch schedule')
    const { schedule } = await response.json()
    const dayType = getDayType(date)
    const timeSlots = schedule[dayType] || []
    const slot = timeSlots.find((s: TimeSlot) => s.jam === timeSlot)
    return slot ? slot.harga : 0
  } catch (error) {
    console.error('Error getting time slot price:', error)
    return 0
  }
}