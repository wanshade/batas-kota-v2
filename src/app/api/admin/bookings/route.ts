import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, users, fields } from "@/db"
import { eq, desc, and, count, gte, lt } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const whereConditions = []
    if (status && status !== 'ALL') {
      whereConditions.push(eq(bookings.status, status as any))
    }

    // Get bookings with pagination and optimized query
    const [bookingsData, totalCountResult, statusCountsResult] = await Promise.all([
      db
        .select({
          id: bookings.id,
          status: bookings.status,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          amountPaid: bookings.amountPaid,
          paymentType: bookings.paymentType,
          proofImageUrl: bookings.proofImageUrl,
          namaTim: bookings.namaTim,
          noWhatsapp: bookings.noWhatsapp,
          createdAt: bookings.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          field: {
            id: fields.id,
            name: fields.name,
            pricePerHour: fields.pricePerHour,
          },
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(fields, eq(bookings.fieldId, fields.id))
        .where(and(...whereConditions))
        .orderBy(desc(bookings.createdAt), desc(bookings.startTime))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: count() })
        .from(bookings)
        .where(and(...whereConditions)),
      db
        .select({
          status: bookings.status,
          count: count(),
        })
        .from(bookings)
        .groupBy(bookings.status)
    ])

    const totalCount = totalCountResult[0].count

    return NextResponse.json({
      bookings: bookingsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      },
      statusCounts: statusCountsResult.reduce((acc, curr) => {
        if (curr.status) {
          acc[curr.status] = curr.count
        }
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error("Admin bookings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fieldId, date, startTime, endTime, customerName, customerEmail, customerPhone, paymentType = "FULL", notes } = body

    // Validate required fields
    if (!fieldId || !date || !startTime || !endTime || !customerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate that field exists
    const [field] = await db
      .select()
      .from(fields)
      .where(eq(fields.id, fieldId))
      .limit(1)

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 })
    }

    // Check for overlapping bookings
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)

    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.fieldId, fieldId))

    const hasOverlap = overlappingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        startDateTime < bookingEnd && endDateTime > bookingStart &&
        booking.status !== "CANCELLED" && booking.status !== "REJECTED"
      )
    })

    if (hasOverlap) {
      return NextResponse.json({ error: "Time slot is already booked" }, { status: 409 })
    }

    // Calculate duration and amount
    const durationInHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
    const amountPaid = Math.round(field.pricePerHour * durationInHours)

    // Create booking with APPROVED status (bypasses approval process)
    const bookingId = nanoid()
    const [booking] = await db
      .insert(bookings)
      .values({
        id: bookingId,
        userId: session.user.id, // Admin creates the booking
        fieldId,
        date: startDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        status: "APPROVED", // Auto-approved for admin bookings
        paymentType,
        amountPaid,
        proofImageUrl: null, // Will be added later if needed
      })
      .returning()

    // Store customer info in a notes field for now
    // In a real implementation, you might want to create a separate customer table
    const customerInfo = {
      name: customerName,
      email: customerEmail || null,
      phone: customerPhone || null,
      notes: notes || null,
      walkIn: true // Mark as walk-in booking
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        customerInfo,
        field: {
          name: field.name,
          pricePerHour: field.pricePerHour
        }
      }
    })

  } catch (error) {
    console.error("Error creating admin booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}