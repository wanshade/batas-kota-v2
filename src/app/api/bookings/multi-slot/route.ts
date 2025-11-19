import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, users, fields } from "@/db"
import { eq, and, or, lte, gt, lt, gte, inArray, desc } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { calculateBookingPriceServer, parseTimeSlot } from "@/lib/schedule-server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - No session user" },
        { status: 401 }
      )
    }

    // Get user ID from session
    const userId = (session.user as any).id || (session.user as any).sub

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID in session" },
        { status: 401 }
      )
    }

    const { fieldId, timeSlots, paymentType, namaTim, noWhatsapp } = await request.json()

    console.log('Received multi-slot booking request:', { fieldId, timeSlots, paymentType, namaTim, noWhatsapp })

    if (!fieldId || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0 || !paymentType || !namaTim || !noWhatsapp) {
      return NextResponse.json(
        { error: "Missing required fields or invalid time slots" },
        { status: 400 }
      )
    }

    let totalAmount = 0
    const createdBookings = []

    // Process each time slot and create individual bookings with the same group ID
    for (const slotData of timeSlots) {
      const { date, slot } = slotData
      if (!date || !slot) {
        return NextResponse.json(
          { error: "Invalid slot data - missing date or slot" },
          { status: 400 }
        )
      }

      // Parse the time slot (e.g., "16.00 - 18.00")
      const { start, end } = parseTimeSlot(slot)
      const startTime = new Date(`${date}T${start}`)
      const endTime = new Date(`${date}T${end}`)

      // Calculate price for this slot
      const bookingDate = new Date(date)
      const calculatedPrice = calculateBookingPriceServer(bookingDate, start, end)

      if (calculatedPrice === 0) {
        return NextResponse.json(
          { error: `Invalid time slot - not available in schedule: ${slot} on ${date}` },
          { status: 400 }
        )
      }

      totalAmount += calculatedPrice

      // Calculate the actual amount to be paid for this slot
      let actualAmountPaid = calculatedPrice
      if (paymentType === "DEPOSIT") {
        actualAmountPaid = Math.round(calculatedPrice * 0.3) // 30% deposit
      }

      // Check for conflicts with existing bookings for this specific slot
      const existingBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.fieldId, fieldId),
            inArray(bookings.status, ['PENDING', 'APPROVED']),
            or(
              // Overlap case 1: booking starts before our start time and ends after our start time
              and(
                lte(bookings.startTime, startTime),
                gt(bookings.endTime, startTime)
              ),
              // Overlap case 2: booking starts before our end time and ends after our end time
              and(
                lt(bookings.startTime, endTime),
                gte(bookings.endTime, endTime)
              ),
              // Overlap case 3: booking starts after our start time and ends before our end time
              and(
                gte(bookings.startTime, startTime),
                lte(bookings.endTime, endTime)
              )
            )
          )
        )

      if (existingBookings.length > 0) {
        // Log detailed conflict information for debugging
        console.log('Booking conflict detected:', {
          requestedSlot: slot,
          requestedDate: date,
          requestedStart: startTime.toISOString(),
          requestedEnd: endTime.toISOString(),
          conflictingBookings: existingBookings.map(b => ({
            id: b.id,
            status: b.status,
            date: b.date?.toISOString(),
            startTime: b.startTime?.toISOString(),
            endTime: b.endTime?.toISOString(),
            namaTim: b.namaTim,
            createdAt: b.createdAt?.toISOString()
          }))
        })

        return NextResponse.json(
          {
            error: `Time slot ${slot} on ${date} is already booked. Please choose a different time slot.`,
            details: {
              conflictingBookings: existingBookings.length,
              existingBookings: existingBookings.map(b => ({
                id: b.id,
                status: b.status,
                date: b.date?.toISOString().split('T')[0],
                startTime: b.startTime?.toISOString(),
                endTime: b.endTime?.toISOString(),
                namaTim: b.namaTim
              }))
            }
          },
          { status: 409 }
        )
      }

      // Create individual booking
      const [booking] = await db
        .insert(bookings)
        .values({
          id: crypto.randomUUID(), // Unique ID for each booking
          userId,
          fieldId,
          date: bookingDate,
          startTime,
          endTime,
          paymentType: paymentType as "FULL" | "DEPOSIT",
          amountPaid: actualAmountPaid,
          namaTim,
          noWhatsapp,
          status: "PENDING",
        })
        .returning()

      createdBookings.push(booking)
    }

    // Calculate total deposit amount if payment type is DEPOSIT
    const totalDepositAmount = paymentType === "DEPOSIT" ? Math.round(totalAmount * 0.3) : totalAmount

    // Fetch related data
    const [field] = await db
      .select({
        name: fields.name,
      })
      .from(fields)
      .where(eq(fields.id, fieldId))
      .limit(1)

    return NextResponse.json(
      {
        message: "Multi-slot booking created successfully",
        booking: {
          field: field || { name: 'Unknown Field' },
          timeSlots: timeSlots,
          totalAmount,
          amountPaid: totalDepositAmount,
          paymentType,
          status: "PENDING",
          slotCount: createdBookings.length,
          bookings: createdBookings
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Multi-slot booking creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}