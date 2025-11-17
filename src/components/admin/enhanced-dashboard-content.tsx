"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import { formatRupiah } from "@/lib/currency"
import {
  BarChart3,
  Calendar,
  Coins,
  Users,
  TrendingUp,
  TrendingDown,
  Home,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  DollarSign,
  Target,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  CreditCard
} from "lucide-react"

interface EnhancedDashboardStats {
  totalUsers: number
  totalFields: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  totalRevenue: number
  monthlyRevenue: number
  monthlyBookings: number
  newUsersThisMonth: number
  averageBookingValue: number
  occupancyRate: number
}

interface RecentBooking {
  id: string
  status: string
  startTime: string
  amountPaid: number
  user: {
    name: string
    email: string
  }
  field: {
    name: string
    pricePerHour: number
  }
}

interface FieldPerformance {
  id: string
  name: string
  bookingCount: number
  revenue: number
  occupancyRate: number
}

export default function EnhancedDashboardContent() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<EnhancedDashboardStats>({
    totalUsers: 0,
    totalFields: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyBookings: 0,
    newUsersThisMonth: 0,
    averageBookingValue: 0,
    occupancyRate: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [fieldPerformance, setFieldPerformance] = useState<FieldPerformance[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchEnhancedDashboardData = async () => {
      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          fetch('/api/admin/dashboard/enhanced-stats'),
          fetch('/api/admin/dashboard/recent-bookings')
        ])

        if (isMounted) {
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json()
            setRecentBookings(bookingsData)
          }
        }
      } catch (error) {
        console.error('Failed to fetch enhanced dashboard data:', error)
      }
    }

    fetchEnhancedDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  const navigationItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: Home,
      current: true
    },
    {
      title: "Bookings",
      href: "/admin/bookings",
      icon: Calendar,
      count: stats.pendingBookings
    },
    {
      title: "Fields",
      href: "/admin/fields",
      icon: MapPin
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users
    }
  ]

  const MetricCard = ({
    title,
    value,
    description,
    trend,
    trendValue,
    icon: Icon,
    iconBg,
    iconColor
  }: {
    title: string
    value: string | number
    description?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    icon: any
    iconBg: string
    iconColor: string
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> :
                 trend === 'down' ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Batas Kota Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Batas Kota</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  item.current
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-5 h-5 ${item.current ? 'text-emerald-600' : 'text-gray-500'}`}>
                  <Icon />
                </div>
                <span className={`font-medium ${item.current ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {item.title}
                </span>
                {item.count && item.count > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.count}
                  </Badge>
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
        {/* Enhanced Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-lg text-gray-500 mt-1">
                Welcome back, {session?.user?.name}! Here's your business performance at a glance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Data
              </Button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={formatRupiah(stats.totalRevenue)}
              description="All time revenue"
              trend="up"
              trendValue="+12% from last month"
              icon={DollarSign}
              iconBg="bg-gradient-to-br from-green-50 to-emerald-100"
              iconColor="text-green-600"
            />
            <MetricCard
              title="Active Users"
              value={stats.totalUsers.toLocaleString()}
              description="Registered customers"
              trend="up"
              trendValue={`+${stats.newUsersThisMonth} this month`}
              icon={Users}
              iconBg="bg-gradient-to-br from-blue-50 to-indigo-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Total Bookings"
              value={stats.totalBookings.toLocaleString()}
              description="All reservations"
              trend="up"
              trendValue={`${stats.monthlyBookings} this month`}
              icon={Calendar}
              iconBg="bg-gradient-to-br from-purple-50 to-pink-100"
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Pending Reviews"
              value={stats.pendingBookings.toLocaleString()}
              description="Awaiting approval"
              icon={AlertCircle}
              iconBg="bg-gradient-to-br from-amber-50 to-orange-100"
              iconColor="text-amber-600"
            />
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              description="Field utilization"
              trend="up"
              trendValue="+5% efficiency"
              icon={Target}
              iconBg="bg-gradient-to-br from-teal-50 to-cyan-100"
              iconColor="text-teal-600"
            />
            <MetricCard
              title="Average Booking"
              value={formatRupiah(stats.averageBookingValue)}
              description="Per transaction"
              trend="up"
              trendValue="+8% value"
              icon={CreditCard}
              iconBg="bg-gradient-to-br from-violet-50 to-purple-100"
              iconColor="text-violet-600"
            />
            <MetricCard
              title="Success Rate"
              value="94%"
              description="Approved bookings"
              trend="up"
              trendValue="+2% quality"
              icon={CheckCircle}
              iconBg="bg-gradient-to-br from-green-50 to-emerald-100"
              iconColor="text-green-600"
            />
          </div>

          {/* Enhanced Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  href="/admin/bookings"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Manage Bookings</div>
                      <div className="text-sm text-gray-500">
                        {stats.pendingBookings} pending review
                      </div>
                    </div>
                  </div>
                  {stats.pendingBookings > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {stats.pendingBookings}
                    </Badge>
                  )}
                </Link>

                <Link
                  href="/admin/fields"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Manage Fields</div>
                      <div className="text-sm text-gray-500">{stats.totalFields} venues</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Manage Users</div>
                      <div className="text-sm text-gray-500">{stats.newUsersThisMonth} new this month</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Enhanced Recent Bookings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-500 shadow-sm'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-500 shadow-sm animate-pulse'
                            : booking.status === 'REJECTED'
                            ? 'bg-red-500 shadow-sm'
                            : 'bg-gray-400 shadow-sm'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {booking.field?.name || 'Unknown Field'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user?.name} • {booking.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatRupiah(booking.amountPaid)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Bookings will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}