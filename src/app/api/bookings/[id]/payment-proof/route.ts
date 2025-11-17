import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, fields, users } from "@/db"
import { eq, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function POST(
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

    const { proofImageUrl } = await request.json()

    if (!proofImageUrl) {
      return NextResponse.json(
        { error: "Proof image URL is required" },
        { status: 400 }
      )
    }

    // First check if the booking belongs to the current user
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
      .limit(1)

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    if (booking.proofImageUrl) {
      return NextResponse.json(
        { error: "Payment proof has already been uploaded" },
        { status: 400 }
      )
    }

    // Update the booking with the proof image URL
    const [updatedBooking] = await db
      .update(bookings)
      .set({ proofImageUrl })
      .where(eq(bookings.id, id))
      .returning()

    // Fetch related data for response
    const [field] = await db
      .select({
        name: fields.name,
        pricePerHour: fields.pricePerHour,
      })
      .from(fields)
      .where(eq(fields.id, updatedBooking.fieldId))
      .limit(1)

    const [user] = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, updatedBooking.userId))
      .limit(1)

    return NextResponse.json({
      message: "Payment proof uploaded successfully",
      booking: {
        ...updatedBooking,
        field: field || { name: 'Unknown Field', pricePerHour: 0 },
        user: user || { name: 'Unknown User', email: 'unknown@example.com' }
      }
    })
  } catch (error) {
    console.error("Payment proof upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}