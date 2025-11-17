"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import QuickBookingModal from "@/components/admin/quick-booking-modal"
import { formatRupiah } from "@/lib/currency"
import {
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  Home,
  MapPin,
  Clock,
  ArrowLeft,
  User,
  Coins,
  Plus,
} from "lucide-react";
import { DateScroller } from "@/components/ui/date-scroller"
import { cn } from "@/lib/utils"

interface Field {
  id: string
  name: string
  description: string | null
  pricePerHour: number
  imageUrl: string | null
  createdAt: string
}

interface Booking {
  id: string
  status: string
  startTime: string
  endTime: string
  amountPaid: number
  user: {
    name: string
    email: string
  }
}

interface HourlyBooking {
  hour: string // Now represents time slot like "06:00 - 08:00"
  booking: Booking | null
}

export default function AdminFieldDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [field, setField] = useState<Field | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>("")

  useEffect(() => {
    const getFieldId = async () => {
      const { id } = await params
      setFieldId(id)
    }
    getFieldId()
  }, [params])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && fieldId) {
      fetchFieldData()
    }
  }, [status, router, fieldId])

  const fetchFieldData = async () => {
    try {
      setIsLoading(true)
      if (!fieldId) return
      const response = await fetch(`/api/admin/fields/${fieldId}`)

      if (response.ok) {
        const data = await response.json()
        setField(data.field)
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Failed to fetch field data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getHourlyBookings = (date: string): HourlyBooking[] => {
    const hourlyBookings: HourlyBooking[] = []

    // Generate 2-hour slots from 6:00 AM to 9:00 PM (last slot: 9PM-11PM)
    for (let hour = 6; hour <= 21; hour += 2) {
      const startHour = hour.toString().padStart(2, '0')
      const endHour = (hour + 2).toString().padStart(2, '0')
      const slotString = `${startHour}:00 - ${endHour}:00`

      // Check if there are any bookings that overlap with this 2-hour slot
      const booking = bookings.find(booking => {
        const bookingDate = new Date(booking.startTime).toISOString().split('T')[0]
        const bookingHour = new Date(booking.startTime).getHours()
        return bookingDate === date && bookingHour >= hour && bookingHour < hour + 2
      })

      hourlyBookings.push({
        hour: slotString,
        booking: booking || null
      })
    }

    return hourlyBookings
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleQuickBook = (timeSlot: string) => {
    // Extract the start time from the slot string (e.g., "06:00 - 08:00" -> "06:00")
    const startTime = timeSlot.split(' - ')[0]
    setSelectedTime(startTime)
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    // Refresh the field data to show the new booking
    fetchFieldData()
  }

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
      icon: CalendarIcon
    },
    {
      title: "Fields",
      href: "/admin/fields",
      icon: MapPin,
      current: false
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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Batas Kota Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="font-semibold text-slate-900">Batas Kota</h1>
                <p className="text-sm text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-64" />
                </div>
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Field Info Skeleton */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Bookings Skeleton */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Create skeleton time slots */}
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!field) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Batas Kota Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="font-semibold text-slate-900">Batas Kota</h1>
                <p className="text-sm text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Field not found</h2>
            <p className="text-slate-600 mb-4">The field you're looking for doesn't exist.</p>
            <Link href="/admin/fields">
              <Button>Back to Fields</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const hourlyBookings = getHourlyBookings(selectedDate)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Batas Kota Logo"
              className="h-10 w-auto object-contain"
            />
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
            <div className="flex items-center gap-4">
              <Link href="/admin/fields">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{field.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Field details and hourly bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="text-lg px-3 py-1">
                {formatRupiah(field.pricePerHour)}/hour
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Field Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Field Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {field.imageUrl && (
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={field.imageUrl}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Description</h3>
                    <p className="text-sm text-slate-600">
                      {field.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Price per Hour</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatRupiah(field.pricePerHour)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Created</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(field.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Bookings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>2-Hour Slot Bookings</CardTitle>
                    <DateScroller
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </div>
                  <CardDescription>
                    View and manage 2-hour slot bookings for {field.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hourlyBookings.map(({ hour, booking }) => {
                      // Extract the start time from the slot string (e.g., "06:00 - 08:00" -> "06:00")
                      const startTime = hour.split(' - ')[0];
                      const bookingDateTime = new Date(`${selectedDate}T${startTime}:00+08:00`);
                      const isPastTime = bookingDateTime < new Date();
                      return (
                      <div
                        key={hour}
                        className={`p-4 rounded-lg border ${
                          booking
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-dashed border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-sm">{hour}</span>
                          </div>
                          {booking && (
                            <Badge className={`text-xs ${getBookingStatusColor(booking.status)}`}>
                              {booking.status}
                            </Badge>
                          )}
                        </div>

                        {booking ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-medium text-slate-900 truncate">
                                {booking.user.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-600">
                                {formatRupiah(booking.amountPaid)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleQuickBook(hour)}
                            className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                            disabled={isPastTime}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Quick Book
                          </Button>
                        )}
                      </div>
                    )})}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Quick Booking Modal */}
      {field && (
        <QuickBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          fieldId={field.id}
          fieldName={field.name}
          fieldPricePerHour={field.pricePerHour}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}