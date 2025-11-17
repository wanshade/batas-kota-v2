import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, users, fields } from "@/db"
import { eq, and, or, lte, gt, lt, gte, inArray, desc } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

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

    const { fieldId, date, startTime, endTime, paymentType, amountPaid } = await request.json()

    if (!fieldId || !date || !startTime || !endTime || !paymentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    let startDate = new Date(startTime)
    let endDate = new Date(endTime)

    // Round to nearest hour
    startDate = new Date(startDate)
    startDate.setMinutes(0, 0, 0)

    endDate = new Date(endDate)
    endDate.setMinutes(0, 0, 0)

    // Ensure end time is at least 1 hour after start time
    if (endDate <= startDate) {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour
    }

    // Calculate duration in hours
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

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
        amountPaid,
        status: "PENDING",
      })
      .returning()

    // Fetch related data
    const [field] = await db
      .select({
        name: fields.name,
        pricePerHour: fields.pricePerHour,
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
          field: field || { name: 'Unknown Field', pricePerHour: 0 },
          startTime: booking.startTime,
          endTime: booking.endTime,
          amountPaid: booking.amountPaid,
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