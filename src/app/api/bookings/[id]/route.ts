import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, fields, users } from "@/db"
import { eq, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

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

    // First, get the main booking to find the session
    const [mainBooking] = await db
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
        fieldId: bookings.fieldId,
        field: {
          id: fields.id,
          name: fields.name,
          imageUrl: fields.imageUrl,
          pricePerHour: fields.pricePerHour,
        },
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(bookings)
      .leftJoin(fields, eq(bookings.fieldId, fields.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
      .limit(1)

    if (!mainBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Now get all related bookings from the same session (within 1 minute)
    const sessionTime = new Date(mainBooking.createdAt).getTime()
    const oneMinute = 60 * 1000

    const relatedBookings = await db
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
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(bookings)
      .leftJoin(fields, eq(bookings.fieldId, fields.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(and(
        eq(bookings.userId, userId),
        eq(bookings.fieldId, mainBooking.fieldId),
        // Only include bookings with the same status (if status exists)
        mainBooking.status ? eq(bookings.status, mainBooking.status) : undefined,
        // Find bookings created within 1 minute of the main booking
        // This groups bookings from the same session
      ))
      .orderBy(bookings.createdAt)

    // Filter bookings by session time (created within 1 minute)
    const filteredBookings = relatedBookings.filter(booking => {
      const bookingTime = new Date(booking.createdAt).getTime()
      return Math.abs(bookingTime - sessionTime) < oneMinute
    })

    return NextResponse.json({
      booking: mainBooking,
      relatedBookings: filteredBookings
    })
  } catch (error) {
    console.error("Booking fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}