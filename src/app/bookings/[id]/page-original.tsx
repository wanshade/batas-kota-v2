"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { formatRupiah } from "@/lib/currency"
import { MapPin, Clock, Calendar, User, Image, ChevronLeft, ArrowRight, CheckCircle2, XCircle, Clock3, AlertCircle } from "lucide-react"

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
  user: {
    name: string
    email: string
  }
}

export default function BookingDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && params.id) {
      fetchBooking()
    }
  }, [status, router, params.id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setBooking(data.booking)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
          label: "Pending Approval"
        }
      case "APPROVED":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Approved"
        }
      case "REJECTED":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          label: "Rejected"
        }
      case "COMPLETED":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle2,
          label: "Completed"
        }
      case "CANCELLED":
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: AlertCircle,
          label: "Cancelled"
        }
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: AlertCircle,
          label: "Unknown"
        }
    }
  }

  const calculateDuration = () => {
    if (!booking) return 0
    return Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60))
  }

  const calculateTotalCost = () => {
    if (!booking) return 0
    const duration = calculateDuration()
    return booking.field.pricePerHour * duration
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Back Navigation Skeleton */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="container mx-auto px-4 pb-16 max-w-6xl">
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <Skeleton className="w-full h-full" />

            {/* Overlay Content Skeleton */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <Skeleton className="h-10 w-64 mb-2 bg-white/20" />
                  <Skeleton className="h-6 w-48 bg-white/20" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Skeleton className="h-8 w-32 mb-1 bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                  </div>
                  <Skeleton className="h-8 w-32 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Date & Time Card Skeleton */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-12 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Details Card Skeleton */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-8">
              {/* Payment Summary Card Skeleton */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card Skeleton */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                <Skeleton className="h-7 w-24 mb-6" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </div>

              {/* Booking Info Card Skeleton */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50">
                <Skeleton className="h-7 w-40 mb-6" />
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200/50">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-64 bg-white/50 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Booking not found</h2>
          <p className="text-slate-600 mb-6">The booking you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const duration = calculateDuration()
  const totalCost = calculateTotalCost()
  const remainingAmount = totalCost - booking.amountPaid
  const statusInfo = getStatusInfo(booking.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16 max-w-6xl">
        {/* Hero Section with Field Image */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-12 shadow-2xl">
          {booking.field.imageUrl ? (
            <img
              src={booking.field.imageUrl}
              alt={booking.field.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Image className="w-16 h-16 text-white/80" />
            </div>
          )}

          {/* Overlay with field name and status */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                  {booking.field.name}
                </h1>
                <p className="text-white/80 text-lg">
                  {booking.paymentType === "DEPOSIT" ? "Deposit Payment" : "Full Payment"} • {duration} hour{duration !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-light text-white">{formatRupiah(booking.amountPaid)}</div>
                  <div className="text-white/80 text-sm">Amount Paid</div>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color} bg-white/90 backdrop-blur-sm`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium">{statusInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date & Time Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h2 className="text-xl font-light text-slate-900 mb-6">Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Date</div>
                    <div className="text-slate-600 mt-1">
                      {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Time</div>
                    <div className="text-slate-600 mt-1">
                      {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Proof Card */}
            {booking.proofImageUrl && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                <h2 className="text-xl font-light text-slate-900 mb-6">Payment Proof</h2>
                <div className="relative group cursor-pointer" onClick={() => window.open(booking.proofImageUrl!, '_blank')}>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={booking.proofImageUrl}
                      alt="Payment proof"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-sm font-medium">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-3">
                  Click to view payment proof in new tab
                </p>
              </div>
            )}

            {/* Field Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h2 className="text-xl font-light text-slate-900 mb-6">Field Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Field Name</span>
                  <span className="font-medium text-slate-900">{booking.field.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Price per Hour</span>
                  <span className="font-medium text-slate-900">{formatRupiah(booking.field.pricePerHour)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600">Total Cost</span>
                  <span className="font-semibold text-lg text-slate-900">{formatRupiah(totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-8">
            {/* Payment Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h2 className="text-xl font-light text-slate-900 mb-6">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Field Cost ({duration}h × {formatRupiah(booking.field.pricePerHour)})</span>
                  <span>{formatRupiah(totalCost)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-900">
                  <span>Amount Paid</span>
                  <span className="text-emerald-600">{formatRupiah(booking.amountPaid)}</span>
                </div>
                {booking.paymentType === "DEPOSIT" && remainingAmount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Remaining (Pay on-site)</span>
                    <span>{formatRupiah(remainingAmount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between font-semibold text-lg text-slate-900">
                    <span>Total</span>
                    <span>{formatRupiah(totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h2 className="text-xl font-light text-slate-900 mb-6">Actions</h2>
              <div className="space-y-3">
                {booking.status === "PENDING" && !booking.proofImageUrl && (
                  <Button asChild className="w-full rounded-full h-12 bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/bookings/${booking.id}/payment`}>
                      Upload Payment Proof
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="w-full rounded-full h-12 border-slate-200 hover:bg-slate-50">
                  <Link href={`/fields/${booking.field.id}`}>
                    View Field Details
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full rounded-full h-12 border-slate-200 hover:bg-slate-50">
                  <Link href="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Booking Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/50">
              <h2 className="text-xl font-light text-slate-900 mb-6">Booking Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{booking.user.name}</div>
                    <div className="text-slate-600 text-sm">{booking.user.email}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/50">
                  <div className="font-medium text-slate-900 text-sm mb-1">Booking ID</div>
                  <div className="text-slate-600 text-sm font-mono bg-white/50 rounded-lg px-3 py-2 border border-slate-200/50">
                    {booking.id}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm mb-1">Booked on</div>
                  <div className="text-slate-600 text-sm">
                    {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}