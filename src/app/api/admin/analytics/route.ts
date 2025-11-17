import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db, users, fields, bookings } from "@/db"
import { eq, desc, count, sql, gte, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import { cache } from "react"

// Cache the function to avoid repeated database calls
const getAnalyticsData = cache(async () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalUsers,
    totalFields,
    totalBookings,
    pendingBookings,
    approvedBookings,
    rejectedBookings,
    completedBookings,
    totalRevenue,
    monthlyRevenue,
    newUsersThisMonth,
    recentBookings,
    bookingStats,
    fieldPerformance,
    monthlyStats
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

    // Completed bookings
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "COMPLETED")),

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

    // Recent bookings for activity
    db
      .select({
        id: bookings.id,
        status: bookings.status,
        startTime: bookings.startTime,
        amountPaid: bookings.amountPaid,
        user: {
          name: users.name,
        },
        field: {
          name: fields.name,
        },
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(fields, eq(bookings.fieldId, fields.id))
      .orderBy(desc(bookings.startTime))
      .limit(10),

    // Booking status breakdown
    db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .groupBy(bookings.status),

    // Field performance
    db
      .select({
        id: fields.id,
        name: fields.name,
        bookingCount: count(bookings.id),
        revenue: sql<number>`sum(${bookings.amountPaid})`,
      })
      .from(fields)
      .leftJoin(bookings, eq(fields.id, bookings.fieldId))
      .groupBy(fields.id, fields.name)
      .orderBy(sql`${count(bookings.id)} desc`)
      .limit(8),

    // Monthly stats for growth calculation
    db
      .select({
        month: sql<string>`date_trunc('month', ${bookings.createdAt})`,
        bookingCount: count(),
        revenue: sql<number>`sum(${bookings.amountPaid})`,
        userCount: sql<number>`count(distinct ${bookings.userId})`
      })
      .from(bookings)
      .where(gte(bookings.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`date_trunc('month', ${bookings.createdAt})`)
      .orderBy(sql`date_trunc('month', ${bookings.createdAt}) desc`)
      .limit(3)
  ])

  // Calculate derived metrics
  const statusBreakdown = bookingStats.reduce((acc, curr) => {
    if (curr.status) {
      acc[curr.status] = curr.count
    }
    return acc
  }, {} as Record<string, number>)

  const totalUsersCount = totalUsers[0].count
  const totalBookingsCount = totalBookings[0].count
  const approvedBookingsCount = approvedBookings[0].count
  const totalRevenueAmount = totalRevenue[0].total || 0
  const monthlyRevenueAmount = monthlyRevenue[0]?.total || 0
  const newUsersCount = newUsersThisMonth[0].count

  // Calculate average booking value
  const averageBookingValue = totalRevenueAmount > 0 && approvedBookingsCount > 0
    ? Math.round(totalRevenueAmount / approvedBookingsCount)
    : 0

  // Calculate success rate
  const successRate = totalBookingsCount > 0
    ? Math.round((approvedBookings[0].count / totalBookingsCount) * 100)
    : 0

  // Calculate user growth
  const userGrowthRate = monthlyStats.length >= 2
    ? Math.round(((monthlyStats[0]?.userCount || 0) - (monthlyStats[1]?.userCount || 0)) / (monthlyStats[1]?.userCount || 1) * 100)
    : 0

  return {
    totalUsers: totalUsersCount,
    totalFields: totalFields[0].count,
    totalBookings: totalBookingsCount,
    pendingBookings: pendingBookings[0].count,
    approvedBookings: approvedBookings[0].count,
    rejectedBookings: rejectedBookings[0].count,
    completedBookings: completedBookings[0].count,
    totalRevenue: totalRevenueAmount,
    monthlyRevenue: monthlyRevenueAmount,
    newUsersThisMonth: newUsersCount,
    averageBookingValue,
    successRate,
    userGrowthRate,
    statusBreakdown,
    recentBookings,
    fieldPerformance: fieldPerformance.map(field => ({
      ...field,
      revenue: field.revenue || 0
    }))
  }
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analyticsData = await getAnalyticsData()

    return NextResponse.json(analyticsData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}