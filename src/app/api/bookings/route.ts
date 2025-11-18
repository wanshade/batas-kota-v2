import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, users, fields } from "@/db"
import { eq, and, or, lte, gt, lt, gte, inArray, desc } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { calculateBookingPriceServer } from "@/lib/schedule-server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - No session user" },
        { status: 401 }
      )
    }

    // Get user ID from session - it might be in session.user.id or session.user.sub
    const userId = (session.user as any).id || (session.user as any).sub

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID in session" },
        { status: 401 }
      )
    }

    const { fieldId, date, startTime, endTime, paymentType, amountPaid, namaTim, noWhatsapp } = await request.json()

    console.log('Received booking request:', { fieldId, date, startTime, endTime, paymentType, amountPaid, namaTim, noWhatsapp })

    if (!fieldId || !date || !startTime || !endTime || !paymentType || !namaTim || !noWhatsapp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    // Use the exact times provided by time slots - no rounding needed
    // Calculate duration in hours
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

    // Calculate price using jadwal.json
    const bookingDate = new Date(date)
    const startTimeString = startDate.toTimeString().slice(0, 5)
    const endTimeString = endDate.toTimeString().slice(0, 5)

    const calculatedPrice = calculateBookingPriceServer(bookingDate, startTimeString, endTimeString)

    if (calculatedPrice === 0) {
      return NextResponse.json(
        { error: "Invalid time slot - not available in schedule" },
        { status: 400 }
      )
    }

    // Calculate the actual amount to be paid based on payment type
    let actualAmountPaid = calculatedPrice
    if (paymentType === "DEPOSIT") {
      actualAmountPaid = Math.round(calculatedPrice * 0.3) // 30% deposit
    }

    if (durationHours < 1) {
      return NextResponse.json(
        { error: "Minimum booking duration is 1 hour" },
        { status: 400 }
      )
    }

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
              lte(bookings.startTime, startDate),
              gt(bookings.endTime, startDate)
            ),
            // Overlap case 2: booking starts before our end time and ends after our end time
            and(
              lt(bookings.startTime, endDate),
              gte(bookings.endTime, endDate)
            ),
            // Overlap case 3: booking starts after our start time and ends before our end time
            and(
              gte(bookings.startTime, startDate),
              lte(bookings.endTime, endDate)
            )
          )
        )
      )

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 409 }
      )
    }

    
  const [booking] = await db
      .insert(bookings)
      .values({
        id: crypto.randomUUID(),
        userId,
        fieldId,
        date: new Date(date),
        startTime: startDate,
        endTime: endDate,
        paymentType: paymentType as "FULL" | "DEPOSIT",
        amountPaid: actualAmountPaid, // Use server-calculated amount instead of frontend value
        namaTim,
        noWhatsapp,
        status: "PENDING",
      })
      .returning()

    // Fetch related data (note: we no longer use pricePerHour from fields)
    const [field] = await db
      .select({
        name: fields.name,
      })
      .from(fields)
      .where(eq(fields.id, fieldId))
      .limit(1)

    const [user] = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: {
          id: booking.id,
          field: field || { name: 'Unknown Field' },
          startTime: booking.startTime,
          endTime: booking.endTime,
          amountPaid: booking.amountPaid,
          calculatedPrice,
          paymentType: booking.paymentType,
          status: booking.status,
          durationHours
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id || (session.user as any).sub

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      )
    }

    const userBookings = await db
      .select({
        id: bookings.id,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        paymentType: bookings.paymentType,
        amountPaid: bookings.amountPaid,
        proofImageUrl: bookings.proofImageUrl,
        createdAt: bookings.createdAt,
        field: {
          id: fields.id,
          name: fields.name,
          imageUrl: fields.imageUrl,
          pricePerHour: fields.pricePerHour,
        },
      })
      .from(bookings)
      .leftJoin(fields, eq(bookings.fieldId, fields.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))

    return NextResponse.json({ bookings: userBookings })
  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}