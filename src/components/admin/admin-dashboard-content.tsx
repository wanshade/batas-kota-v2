"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import { formatRupiah } from "@/lib/currency"
import {
  BarChart3,
  Calendar,
  Coins,
  Users,
  TrendingUp,
  Settings,
  Home,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalFields: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
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
  }
}

export default function AdminDashboardContent() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFields: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])

  // Start fetching data immediately without blocking rendering
  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
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
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()

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
              <h2 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h2>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back! Here's what's happening with your booking system.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Fields</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.totalFields.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Bookings</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBookings.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="px-2 py-1 bg-amber-100 rounded-full">
                  <span className="text-xs font-medium text-amber-700">{stats.pendingBookings}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600">Pending Bookings</h3>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingBookings.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
              <p className="text-3xl font-bold text-slate-900">{formatRupiah(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  href="/admin/bookings"
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Manage Bookings</div>
                      <div className="text-sm text-slate-500">Review and approve requests</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>

                <Link
                  href="/admin/fields"
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Manage Fields</div>
                      <div className="text-sm text-slate-500">Add and edit venues</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Manage Users</div>
                      <div className="text-sm text-slate-500">User accounts and roles</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Recent Bookings</h3>
              </div>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          booking.status === 'APPROVED'
                            ? 'bg-emerald-500'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-500'
                            : booking.status === 'REJECTED'
                            ? 'bg-red-500'
                            : 'bg-slate-400'
                        }`} />
                        <div>
                          <div className="font-medium text-slate-900">{booking.field.name}</div>
                          <div className="text-sm text-slate-500">
                            {booking.user.name} • {booking.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{formatRupiah(booking.amountPaid)}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No recent bookings</p>
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