import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db, users, fields, bookings } from "@/db"
import { eq, count, sql } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { cache } from "react"

// Cache the function to avoid repeated database calls
const getDashboardStats = cache(async () => {
  const [
    totalUsers,
    totalFields,
    totalBookings,
    pendingBookings,
    approvedBookingsRevenue
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(fields),
    db.select({ count: count() }).from(bookings),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "PENDING")),
    db.select({ total: sql<number>`sum(${bookings.amountPaid})` }).from(bookings).where(eq(bookings.status, "APPROVED"))
  ])

  return {
    totalUsers: totalUsers[0].count,
    totalFields: totalFields[0].count,
    totalBookings: totalBookings[0].count,
    pendingBookings: pendingBookings[0].count,
    totalRevenue: approvedBookingsRevenue[0].total || 0
  }
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Add caching headers for better performance
    const stats = await getDashboardStats()

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}