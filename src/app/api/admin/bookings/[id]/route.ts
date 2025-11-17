import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, bookings, users, fields } from "@/db"
import { eq } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    const { id } = await params

    if (!["APPROVED", "REJECTED", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning()

    // Fetch related data for response
    const [user] = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, booking.userId))
      .limit(1)

    const [field] = await db
      .select({
        name: fields.name,
      })
      .from(fields)
      .where(eq(fields.id, booking.fieldId))
      .limit(1)

    return NextResponse.json({
      message: "Booking status updated successfully",
      booking: {
        ...booking,
        user: user || { name: 'Unknown User', email: 'unknown@example.com' },
        field: field || { name: 'Unknown Field' }
      }
    })
  } catch (error) {
    console.error("Booking status update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}