"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import { formatRupiah } from "@/lib/currency"
import {
  BarChart3,
  Calendar,
  Users,
  Settings,
  Home,
  MapPin,
  Plus,
  RefreshCw
} from "lucide-react"

interface Field {
  id: string
  name: string
  description: string | null
  pricePerHour: number
  imageUrl: string | null
  createdAt: string
  _count: {
    bookings: number
  }
}

export default function AdminFieldsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-video bg-slate-200"></div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-10 bg-slate-200 rounded flex-1"></div>
              <div className="h-10 bg-slate-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const fetchFields = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch('/api/admin/fields', {
        cache: refresh ? 'no-store' : 'default'
      })

      if (response.ok) {
        const data = await response.json()
        setFields(data.fields)
        setLastRefreshed(new Date().toLocaleTimeString())
      } else {
        console.error("Failed to fetch fields")
      }
    } catch (error) {
      console.error("Error fetching fields:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchFields()
    }
  }, [status, router])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        fetchFields(false) // Auto-refresh without loading indicator
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [status])

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
      icon: Calendar
    },
    {
      title: "Fields",
      href: "/admin/fields",
      icon: MapPin,
      current: true
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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
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
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading fields...</p>
          </div>
        </div>
      </div>
    )
  }

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
              <h2 className="text-2xl font-semibold text-slate-900">Field Management</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage your soccer fields and pricing
                {lastRefreshed && (
                  <span className="ml-2 text-xs text-emerald-600">
                    (Updated: {lastRefreshed})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFields(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/fields/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Field
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : fields.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No fields found</h3>
            <p className="text-gray-600 mb-4">Add your first soccer field to get started</p>
            <Link href="/admin/fields/new">
              <Button>Add Field</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardHeader className="p-0">
                {field.imageUrl && (
                  <div className="aspect-video bg-gray-200 rounded-t-lg">
                    <img
                      src={field.imageUrl}
                      alt={field.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{field.name}</CardTitle>
                  <Badge variant="secondary">
                    {field._count.bookings} bookings
                  </Badge>
                </div>
                <CardDescription className="mb-4 line-clamp-2">
                  {field.description || "No description provided"}
                </CardDescription>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {formatRupiah(field.pricePerHour)}/hr
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/admin/fields/${field.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                  <Link href={`/admin/fields/${field.id}/edit`} className="flex-1">
                    <Button className="w-full">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  )
}