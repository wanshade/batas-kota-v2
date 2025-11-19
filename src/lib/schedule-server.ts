import { readFileSync } from "fs"
import { join } from "path"
import { ScheduleData, getDayType, parseTimeSlot, TimeSlot } from "./schedule"

// Server-side only functions to avoid fs module import in client components

export function getScheduleDataFromFile(): ScheduleData {
  try {
    const filePath = join(process.cwd(), "public", "jadwal.json")
    const fileContent = readFileSync(filePath, "utf8")
    return JSON.parse(fileContent)
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

export function calculateBookingPriceServer(
  date: Date,
  startTime: string,
  endTime: string
): number {
  try {
    const schedule = getScheduleDataFromFile()
    const dayType = getDayType(date)
    const timeSlots = schedule[dayType] || []

    let totalPrice = 0

    // Find which time slots overlap with the booking period
    for (const slot of timeSlots) {
      const { start: slotStart, end: slotEnd } = parseTimeSlot(slot.jam)

      // Check if this time slot overlaps with our booking period
      if ((startTime < slotEnd && endTime > slotStart)) {
        // Calculate the overlap duration
        const overlapStart = startTime > slotStart ? startTime : slotStart
        const overlapEnd = endTime < slotEnd ? endTime : slotEnd

        const startHour = parseInt(overlapStart.split(':')[0])
        const endHour = parseInt(overlapEnd.split(':')[0])
        const durationHours = endHour - startHour

        if (durationHours > 0) {
          const slotStartHour = parseInt(slotStart.split(':')[0])
          const slotEndHour = parseInt(slotEnd.split(':')[0])
          const slotDuration = slotEndHour - slotStartHour
          const hourlyPrice = slot.harga / slotDuration

          totalPrice += hourlyPrice * durationHours
        }
      }
    }

    return Math.round(totalPrice)
  } catch (error) {
    console.error('Error calculating price:', error)
    return 0
  }
}

export function getTimeSlotPriceServer(date: Date, timeSlot: string): number {
  try {
    const schedule = getScheduleDataFromFile()
    const dayType = getDayType(date)
    const timeSlots = schedule[dayType] || []
    const slot = timeSlots.find((s: TimeSlot) => s.jam === timeSlot)
    return slot ? slot.harga : 0
  } catch (error) {
    console.error('Error getting time slot price:', error)
    return 0
  }
}

// Re-export parseTimeSlot for convenience
export { parseTimeSlot }