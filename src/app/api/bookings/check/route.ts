import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings } from "@/db"
import { eq, and, or, lte, gt, lt, gte, inArray, desc } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const date = searchParams.get('date')

    if (!fieldId || !date) {
      return NextResponse.json(
        { error: "Missing fieldId or date parameter" },
        { status: 400 }
      )
    }

    // Get all bookings for this field on this date
    const existingBookings = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        namaTim: bookings.namaTim,
        noWhatsapp: bookings.noWhatsapp,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.fieldId, fieldId),
          // Check bookings on the same date (regardless of status for debugging)
          // We'll use a date comparison that works across timezones
        )
      )
      .orderBy(bookings.startTime)

    // Filter bookings for the specific date in the user's timezone
    const targetDate = new Date(date)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    const sameDateBookings = existingBookings.filter(booking => {
      if (booking.startTime) {
        const bookingDate = new Date(booking.startTime)
        const bookingDateStr = bookingDate.toISOString().split('T')[0]
        return bookingDateStr === targetDateStr
      }
      return false
    })

    return NextResponse.json({
      fieldId,
      targetDate: targetDateStr,
      totalBookings: existingBookings.length,
      sameDateBookings: sameDateBookings.length,
      bookings: sameDateBookings.map(b => ({
        id: b.id,
        status: b.status,
        startTime: b.startTime,
        endTime: b.endTime,
        timeRange: `${new Date(b.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(b.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
        namaTim: b.namaTim,
        createdAt: b.createdAt
      }))
    })
  } catch (error) {
    console.error("Check bookings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}