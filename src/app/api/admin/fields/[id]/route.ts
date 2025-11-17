import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, fields, bookings, users } from "@/db"
import { eq, desc } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch field details
    const [field] = await db
      .select()
      .from(fields)
      .where(eq(fields.id, id))
      .limit(1)

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 })
    }

    // Fetch all bookings for this field with user details
    const fieldBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        amountPaid: bookings.amountPaid,
        proofImageUrl: bookings.proofImageUrl,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        createdAt: bookings.createdAt,
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.fieldId, id))
      .orderBy(desc(bookings.startTime))

    return NextResponse.json({
      field,
      bookings: fieldBookings
    })

  } catch (error) {
    console.error("Error fetching field details:", error)
    return NextResponse.json(
      { error: "Failed to fetch field details" },
      { status: 500 }
    )
  }
}