"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/admin-layout"
import { MetricCard, StatusBreakdown, SimpleBarChart, ProgressMetric } from "@/components/admin/chart-components"
import { formatRupiah } from "@/lib/currency"
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Activity,
  FileText
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalFields: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  completedBookings: number
  totalRevenue: number
  monthlyRevenue: number
  newUsersThisMonth: number
  averageBookingValue: number
  successRate: number
  userGrowthRate: number
  statusBreakdown: Record<string, number>
  recentBookings: any[]
  fieldPerformance: Array<{
    id: string
    name: string
    bookingCount: number
    revenue: number
  }>
}

export default function EnhancedAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalFields: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
    averageBookingValue: 0,
    successRate: 0,
    userGrowthRate: 0,
    statusBreakdown: {},
    recentBookings: [],
    fieldPerformance: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        const data = await response.json()

        if (response.ok) {
          setAnalyticsData(data)
        } else {
          console.error("Failed to fetch analytics data:", data.error || 'Unknown error')
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout
        title="Analytics & Insights"
        description="Track your business performance and customer behavior"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Analytics & Insights"
      description="Track your business performance and customer behavior"
      actions={
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            Last 30 days
          </Badge>
        </div>
      }
    >
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={formatRupiah(analyticsData.totalRevenue)}
          description="All time earnings"
          trend="up"
          trendValue={`+${analyticsData.monthlyRevenue > 0 ? Math.round((analyticsData.monthlyRevenue / analyticsData.totalRevenue) * 100) : 0}% this month`}
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-green-50 to-emerald-100"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Total Bookings"
          value={analyticsData.totalBookings.toLocaleString()}
          description="All reservations"
          trend="up"
          trendValue={`${analyticsData.approvedBookings} approved`}
          icon={Calendar}
          iconBg="bg-gradient-to-br from-blue-50 to-indigo-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Users"
          value={analyticsData.totalUsers.toLocaleString()}
          description="Registered customers"
          trend={analyticsData.userGrowthRate > 0 ? "up" : "down"}
          trendValue={`${analyticsData.userGrowthRate > 0 ? '+' : ''}${analyticsData.userGrowthRate}% growth`}
          icon={Users}
          iconBg="bg-gradient-to-br from-purple-50 to-pink-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Success Rate"
          value={`${analyticsData.successRate}%`}
          description="Booking approval rate"
          trend={analyticsData.successRate > 80 ? "up" : "neutral"}
          trendValue={`${analyticsData.approvedBookings} approved`}
          icon={Target}
          iconBg="bg-gradient-to-br from-teal-50 to-cyan-100"
          iconColor="text-teal-600"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Pending Reviews"
          value={analyticsData.pendingBookings.toLocaleString()}
          description="Awaiting approval"
          icon={Clock}
          iconBg="bg-gradient-to-br from-amber-50 to-orange-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Avg. Booking Value"
          value={formatRupiah(analyticsData.averageBookingValue)}
          description="Per transaction"
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-violet-50 to-purple-100"
          iconColor="text-violet-600"
        />
        <MetricCard
          title="Completed Bookings"
          value={analyticsData.completedBookings.toLocaleString()}
          description="Successful events"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-green-50 to-emerald-100"
          iconColor="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Booking Status Breakdown */}
        <StatusBreakdown
          data={analyticsData.statusBreakdown}
          total={analyticsData.totalBookings}
          title="Booking Status"
        />

        {/* Field Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Field Performance
            </CardTitle>
            <CardDescription>
              Most popular venues by bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.fieldPerformance.slice(0, 5).map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-500">{field.bookingCount} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatRupiah(field.revenue)}</div>
                    <div className="text-sm text-gray-500">
                      Avg: {field.bookingCount > 0 ? formatRupiah(Math.round(field.revenue / field.bookingCount)) : formatRupiah(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest booking activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentBookings.length > 0 ? (
              analyticsData.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      booking.status === 'APPROVED'
                        ? 'bg-green-500'
                        : booking.status === 'PENDING'
                        ? 'bg-amber-500'
                        : booking.status === 'REJECTED'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">{booking.field?.name || 'Unknown Field'}</div>
                      <div className="text-sm text-gray-500">
                        {booking.user?.name || 'Unknown User'} • {booking.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatRupiah(booking.amountPaid)}</div>
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
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}