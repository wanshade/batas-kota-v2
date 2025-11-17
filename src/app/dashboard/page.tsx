"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { formatRupiah } from "@/lib/currency"
import PaymentUploadModal from "@/components/payment-upload-modal"
import { Calendar, DollarSign, TrendingUp, User, MapPin, CreditCard, ChevronRight, Activity, Users } from "lucide-react"

interface Booking {
  id: string
  status: string
  startTime: string
  endTime: string
  amountPaid: number
  paymentType: string
  proofImageUrl?: string
  createdAt: string
  field: {
    id: string
    name: string
    imageUrl?: string
    pricePerHour: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchBookings()
    }
  }, [status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()

      if (response.ok) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-900 border-amber-300"
      case "APPROVED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300"
      case "REJECTED":
        return "bg-red-100 text-red-900 border-red-300"
      case "COMPLETED":
        return "bg-blue-100 text-blue-900 border-blue-300"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "default"
      case "APPROVED":
        return "default"
      case "REJECTED":
        return "destructive"
      case "COMPLETED":
        return "secondary"
      case "CANCELLED":
        return "outline"
      default:
        return "outline"
    }
  }

  const handlePaymentUploadSuccess = () => {
    // Refresh bookings to show updated status
    fetchBookings()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-3 bg-gray-200 rounded-lg" />
            <Skeleton className="h-6 w-96 bg-gray-200 rounded-lg" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 bg-gray-200 rounded mb-2" />
                  <Skeleton className="h-4 w-32 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bookings section skeleton */}
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40 bg-gray-200 rounded-lg" />
            <Skeleton className="h-10 w-36 bg-gray-200 rounded-lg" />
          </div>

          {/* Booking cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-48 bg-gray-200 rounded" />
                        <Skeleton className="h-6 w-24 bg-gray-200 rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="space-y-2">
                            <Skeleton className="h-4 w-16 bg-gray-200 rounded" />
                            <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalBookings = bookings.length
  const approvedBookings = bookings.filter(b => b.status === "APPROVED").length
  const completedBookings = bookings.filter(b => b.status === "COMPLETED").length
  const totalSpent = bookings.filter(b => b.status === "APPROVED" || b.status === "COMPLETED").reduce((sum, b) => sum + b.amountPaid, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your soccer field bookings and explore premium venues
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Total Bookings
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalBookings}
              </div>
              <div className="text-sm text-gray-600">
                {totalBookings > 0 ? `Bookings made` : 'Start booking fields'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Completed
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {completedBookings}
              </div>
              <div className="text-sm text-gray-600">
                {completedBookings > 0 ? 'Sessions completed' : 'No completed sessions'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Approved
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {approvedBookings}
              </div>
              <div className="text-sm text-gray-600">
                {approvedBookings > 0 ? 'Bookings confirmed' : 'No confirmed bookings'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Total Spent
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatRupiah(totalSpent)}
              </div>
              <div className="text-sm text-gray-600">
                {totalSpent > 0 ? 'Total amount spent' : 'No spending yet'}
              </div>
            </CardContent>
          </Card>
        </div>

  
        {/* Recent Bookings */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/bookings">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                View All
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          {bookings.length === 0 ? (
            <Card className="border-0 shadow-md text-center py-12">
              <CardContent>
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No bookings yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start exploring and booking premium soccer fields in your area
                </p>
                <Link href="/fields">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg">
                    Explore Fields
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <Card key={booking.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {booking.field.name}
                          </h3>
                          <Badge
                            variant={getStatusVariant(booking.status) as any}
                            className={`${getStatusColor(booking.status)} border font-medium`}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Date
                            </div>
                            <div className="text-gray-900 font-medium">
                              {format(new Date(booking.startTime), "MMM d, yyyy")}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Time
                            </div>
                            <div className="text-gray-900 font-medium">
                              {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Duration
                            </div>
                            <div className="text-gray-900 font-medium">
                              {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60))}h
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Payment
                            </div>
                            <div className="text-gray-900 font-medium">
                              {booking.paymentType === "DEPOSIT" ? "Deposit" : "Full Payment"}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">
                                Amount Paid
                              </div>
                              <div className="text-xl font-bold text-emerald-600">
                                {formatRupiah(booking.amountPaid)}
                              </div>
                              {booking.paymentType === "DEPOSIT" && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Remaining {formatRupiah(booking.field.pricePerHour * Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)) - booking.amountPaid)} on-site
                                </div>
                              )}
                            </div>

                            <div className="flex gap-3">
                              {booking.status === "PENDING" && !booking.proofImageUrl && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setPaymentModalOpen(true)
                                  }}
                                >
                                  Upload Payment
                                </Button>
                              )}
                              <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                <Link href={`/bookings/${booking.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        </div>

      {/* Payment Upload Modal */}
      <PaymentUploadModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        booking={selectedBooking}
        onSuccess={handlePaymentUploadSuccess}
      />
    </div>
  )
}