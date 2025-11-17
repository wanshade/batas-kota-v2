import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import { db, users, fields, bookings } from "@/db"
import { eq, desc, count, sql, gte, and } from "drizzle-orm"
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Settings,
  Home,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Activity
} from "lucide-react"

async function getAnalyticsData() {
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
    recentBookings,
    bookingStats,
    fieldPerformance
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

    // Total revenue
    db.select({ total: sql<number>`sum(${bookings.amountPaid})` }).from(bookings).where(eq(bookings.status, "APPROVED")),

    // Monthly revenue
    db.select({
      total: sql<number>`sum(${bookings.amountPaid})`,
      count: count()
    }).from(bookings).where(and(eq(bookings.status, "APPROVED"), gte(bookings.createdAt, thirtyDaysAgo))),

    // New users this month
    db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),

    // Recent bookings for analytics
    db
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
      .limit(10),

    // Booking status distribution
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
      })
      .from(fields)
      .leftJoin(bookings, eq(fields.id, bookings.fieldId))
      .groupBy(fields.id, fields.name)
      .orderBy(sql`${count(bookings.id)} desc`)
      .limit(5)
  ])

  return {
    totalUsers: totalUsers[0].count,
    totalFields: totalFields[0].count,
    totalBookings: totalBookings[0].count,
    pendingBookings: pendingBookings[0].count,
    approvedBookings: approvedBookings[0].count,
    rejectedBookings: rejectedBookings[0].count,
    totalRevenue: totalRevenue[0].total || 0,
    monthlyRevenue: monthlyRevenue[0].total || 0,
    monthlyBookings: monthlyRevenue[0].count,
    newUsersThisMonth: newUsersThisMonth[0].count,
    recentBookings,
    bookingStats,
    fieldPerformance: fieldPerformance.map(field => ({
      ...field,
      _count: { bookings: field.bookingCount }
    }))
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function generateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Disable static generation for now during migration
export const dynamic = 'force-dynamic'

export default async function AdminAnalytics() {
  const analytics = await getAnalyticsData()

  const navigationItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: Home,
      current: false
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: Calendar,
      count: analytics.pendingBookings
    },
    {
      title: "Fields",
      href: "/admin/fields",
      icon: MapPin
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: true
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings
    }
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Batas Kota</h1>
              <p className="text-sm text-slate-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  item.current
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
                {item.count && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-slate-200 rounded-full">
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin User Badge */}
        <AdminUserBadge />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h2>
              <p className="text-sm text-slate-500 mt-1">
                Detailed insights and performance metrics for your booking system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Activity className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{formatCurrency(analytics.monthlyRevenue)} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalBookings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.monthlyBookings} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.newUsersThisMonth} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalFields.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.approvedBookings} approved bookings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Booking Status Distribution
                </CardTitle>
                <CardDescription>
                  Overview of all booking statuses in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-600">{analytics.approvedBookings}</div>
                    <div className="text-sm text-emerald-700 font-medium">Approved</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      {analytics.totalBookings > 0 ?
                        `${((analytics.approvedBookings / analytics.totalBookings) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-3xl font-bold text-amber-600">{analytics.pendingBookings}</div>
                    <div className="text-sm text-amber-700 font-medium">Pending</div>
                    <div className="text-xs text-amber-600 mt-1">
                      {analytics.totalBookings > 0 ?
                        `${((analytics.pendingBookings / analytics.totalBookings) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{analytics.rejectedBookings}</div>
                    <div className="text-sm text-red-700 font-medium">Rejected</div>
                    <div className="text-xs text-red-600 mt-1">
                      {analytics.totalBookings > 0 ?
                        `${((analytics.rejectedBookings / analytics.totalBookings) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
                <CardDescription>
                  Performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approval Rate</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {analytics.totalBookings > 0 ?
                        `${((analytics.approvedBookings / analytics.totalBookings) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Rate</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {analytics.totalBookings > 0 ?
                        `${((analytics.pendingBookings / analytics.totalBookings) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Revenue/Booking</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {analytics.approvedBookings > 0 ?
                        formatCurrency(analytics.totalRevenue / analytics.approvedBookings) :
                        '$0'
                      }
                    </span>
                    <DollarSign className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Fields & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top Performing Fields
                </CardTitle>
                <CardDescription>
                  Fields with the highest number of bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.fieldPerformance.length > 0 ? (
                    analytics.fieldPerformance.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-700">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{field.name}</div>
                            <div className="text-sm text-muted-foreground">Field #{field.id.slice(-6)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{field._count.bookings}</div>
                          <div className="text-sm text-muted-foreground">bookings</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No field data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Booking Activity
                </CardTitle>
                <CardDescription>
                  Latest booking transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentBookings.length > 0 ? (
                    analytics.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            booking.status === 'APPROVED'
                              ? 'bg-emerald-500'
                              : booking.status === 'PENDING'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium">{booking.field?.name || 'Unknown Field'}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.user?.name || 'Unknown User'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(booking.amountPaid)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No recent bookings</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}