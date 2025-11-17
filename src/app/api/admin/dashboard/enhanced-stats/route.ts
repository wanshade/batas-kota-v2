import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db, users, fields, bookings } from "@/db"
import { eq, desc, count, sql, gte, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { cache } from "react"

// Cache the function to avoid repeated database calls
const getEnhancedDashboardStats = cache(async () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalUsers,
    totalFields,
    totalBookings,
    pendingBookings,
    approvedBookings,
    rejectedBookings,
    totalRevenue,
    monthlyRevenue,
    newUsersThisMonth,
    monthlyBookings,
    bookingStats
  ] = await Promise.all([
    // Total users
    db.select({ count: count() }).from(users),

    // Total fields
    db.select({ count: count() }).from(fields),

    // Total bookings
    db.select({ count: count() }).from(bookings),

    // Pending bookings
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "PENDING")),

    // Approved bookings
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "APPROVED")),

    // Rejected bookings
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "REJECTED")),

    // Total revenue from approved bookings
    db.select({
      total: sql<number>`sum(${bookings.amountPaid})`
    }).from(bookings).where(eq(bookings.status, "APPROVED")),

    // Monthly revenue (last 30 days)
    db.select({
      total: sql<number>`sum(${bookings.amountPaid})`,
      count: count()
    }).from(bookings).where(and(
      eq(bookings.status, "APPROVED"),
      gte(bookings.createdAt, thirtyDaysAgo)
    )),

    // New users this month
    db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),

    // Monthly bookings (last 30 days)
    db.select({ count: count() }).from(bookings).where(gte(bookings.createdAt, thirtyDaysAgo)),

    // Additional stats for calculations
    db.select({
      status: bookings.status,
      count: count(),
      totalAmount: sql<number>`sum(${bookings.amountPaid})`
    }).from(bookings).groupBy(bookings.status)
  ])

  // Calculate derived metrics
  const statsArray = bookingStats.reduce((acc, curr) => {
    if (curr.status) {
      acc[curr.status] = { count: curr.count, totalAmount: curr.totalAmount || 0 }
    }
    return acc
  }, {} as Record<string, { count: number; totalAmount: number }>)

  const approvedCount = statsArray.APPROVED?.count || 0
  const pendingCount = statsArray.PENDING?.count || 0
  const totalBookingsCount = (statsArray.APPROVED?.count || 0) + (statsArray.PENDING?.count || 0) + (statsArray.REJECTED?.count || 0)

  // Calculate average booking value
  const averageBookingValue = totalRevenue[0].total > 0 && approvedCount > 0
    ? Math.round(totalRevenue[0].total / approvedCount)
    : 0

  // Calculate occupancy rate (simplified - based on approved bookings vs total bookings)
  const occupancyRate = totalBookingsCount > 0
    ? Math.round((approvedCount / totalBookingsCount) * 100)
    : 0

  return {
    totalUsers: totalUsers[0].count,
    totalFields: totalFields[0].count,
    totalBookings: totalBookings[0].count,
    pendingBookings: pendingBookings[0].count,
    approvedBookings: approvedBookings[0].count,
    rejectedBookings: rejectedBookings[0].count,
    totalRevenue: totalRevenue[0].total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    monthlyBookings: monthlyBookings[0].count,
    newUsersThisMonth: newUsersThisMonth[0].count,
    averageBookingValue,
    occupancyRate
  }
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getEnhancedDashboardStats()

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error("Error fetching enhanced dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch enhanced dashboard stats" },
      { status: 500 }
    )
  }
}