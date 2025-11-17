import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db, bookings, users, fields } from "@/db"
import { desc, eq } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { cache } from "react"

// Cache the function to avoid repeated database calls
const getRecentBookings = cache(async () => {
  return await db
    .select({
      id: bookings.id,
      status: bookings.status,
      amountPaid: bookings.amountPaid,
      createdAt: bookings.createdAt,
      user: {
        name: users.name,
        email: users.email,
      },
      field: {
        name: fields.name,
      },
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(fields, eq(bookings.fieldId, fields.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recentBookings = await getRecentBookings()

    return NextResponse.json(recentBookings, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30'
      }
    })

  } catch (error) {
    console.error("Error fetching recent bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent bookings" },
      { status: 500 }
    )
  }
}