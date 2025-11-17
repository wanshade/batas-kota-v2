"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import { format } from "date-fns"
import {
  BarChart3,
  Calendar,
  Users,
  Settings,
  Home,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter
} from "lucide-react"

interface Booking {
  id: string
  status: string
  startTime: string
  endTime: string
  amountPaid: number
  paymentType: string
  proofImageUrl?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  field: {
    name: string
    pricePerHour: number
  }
}

interface BookingsResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  statusCounts: Record<string, number>
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject" | null
    bookingId: string | null
    bookingDetails: string | null
  }>({ type: null, bookingId: null, bookingDetails: null })

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const fetchBookings = useCallback(async (page: number = currentPage, status: string = statusFilter, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status !== 'ALL' && { status })
      })

      const response = await fetch(`/api/admin/bookings?${params}`)
      const data = await response.json()

      if (response.ok) {
        setBookings(data.bookings)
        setPagination(data.pagination)
        setStatusCounts(data.statusCounts)
      } else {
        console.error("Failed to fetch bookings:", data.error || 'Unknown error')
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchBookings()
    }
  }, [status, router, fetchBookings])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBookings(currentPage, statusFilter, true) // Refresh the list
      } else {
        console.error("Failed to update booking status")
      }
    } catch (error) {
      console.error("Failed to update booking status:", error)
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/8"></div>
            <div className="h-8 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const handleActionClick = (type: "approve" | "reject", booking: Booking) => {
    const bookingDetails = `${booking.field.name} for ${booking.user.name} on ${format(new Date(booking.startTime), "MMM d, yyyy")} at ${format(new Date(booking.startTime), "h:mm a")}`
    setConfirmAction({
      type,
      bookingId: booking.id,
      bookingDetails
    })
  }

  const confirmActionHandler = () => {
    if (confirmAction.type && confirmAction.bookingId) {
      const status = confirmAction.type === "approve" ? "APPROVED" : "REJECTED"
      updateBookingStatus(confirmAction.bookingId, status)
      setConfirmAction({ type: null, bookingId: null, bookingDetails: null })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
      icon: Calendar,
      current: true
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

  if (status === "loading") {
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
          <div className="text-center">Loading...</div>
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
              <h2 className="text-2xl font-semibold text-slate-900">Booking Management</h2>
              <p className="text-sm text-slate-500 mt-1">
                Review and manage all booking requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBookings(currentPage, statusFilter, true)}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>
                    Manage booking requests and payment verifications
                    {pagination.total > 0 && (
                      <span className="ml-2 font-medium text-slate-700">
                        ({pagination.total} total)
                      </span>
                    )}
                  </CardDescription>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        All ({pagination.total})
                      </SelectItem>
                      <SelectItem value="PENDING">
                        Pending ({statusCounts.PENDING || 0})
                      </SelectItem>
                      <SelectItem value="APPROVED">
                        Approved ({statusCounts.APPROVED || 0})
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        Rejected ({statusCounts.REJECTED || 0})
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        Completed ({statusCounts.COMPLETED || 0})
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        Cancelled ({statusCounts.CANCELLED || 0})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                  <p className="text-gray-600">
                    {statusFilter !== 'ALL'
                      ? `No ${statusFilter.toLowerCase()} bookings found`
                      : 'No booking requests have been made yet'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{booking.field.name}</div>
                        <div className="text-sm text-gray-500">
                          ${booking.field.pricePerHour}/hr
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{format(new Date(booking.startTime), "MMM d, yyyy")}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${booking.amountPaid}</div>
                      <div className="text-sm text-gray-500">{booking.paymentType}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleActionClick("approve", booking)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleActionClick("reject", booking)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.proofImageUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProof(booking.id)
                              setSelectedProofUrl(`/api/bookings/${booking.id}/payment-proof/image`)
                            }}
                          >
                            View Proof
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <span>
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          {pagination.total} bookings
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(1)
                            fetchBookings(1, statusFilter)
                          }}
                          disabled={!pagination.hasPrev || isLoading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const prevPage = Math.max(1, currentPage - 1)
                            setCurrentPage(prevPage)
                            fetchBookings(prevPage, statusFilter)
                          }}
                          disabled={!pagination.hasPrev || isLoading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const nextPage = Math.min(pagination.pages, currentPage + 1)
                            setCurrentPage(nextPage)
                            fetchBookings(nextPage, statusFilter)
                          }}
                          disabled={!pagination.hasNext || isLoading}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(pagination.pages)
                            fetchBookings(pagination.pages, statusFilter)
                          }}
                          disabled={!pagination.hasNext || isLoading}
                        >
                          Last
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

      {/* Payment Proof Modal */}
      <Dialog open={!!selectedProof} onOpenChange={() => {
        setSelectedProof(null)
        setSelectedProofUrl(null)
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedProofUrl && (
            <div className="flex flex-col items-center">
              <img
                src={selectedProofUrl}
                alt="Payment Proof"
                className="max-w-full max-h-[600px] object-contain rounded-lg border"
                onError={(e) => {
                  console.error('Failed to load image:', selectedProofUrl)
                  console.error('Image loading error details:', e)
                  e.currentTarget.src = '/placeholder-image.svg' // Fallback to SVG placeholder
                }}
                onLoad={() => {
                  console.log('Payment proof image loaded successfully:', selectedProofUrl)
                }}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedProofUrl
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    link.click()
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedProofUrl
                    link.download = `payment-proof-${selectedProof}.png`
                    link.click()
                  }}
                  variant="secondary"
                >
                  Download
                </Button>
                <Button onClick={() => {
                  setSelectedProof(null)
                  setSelectedProofUrl(null)
                }}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog
        open={!!confirmAction.type}
        onOpenChange={() => setConfirmAction({ type: null, bookingId: null, bookingDetails: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction.type === "approve" ? "Approve Booking" : "Reject Booking"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction.type} this booking?
              {confirmAction.bookingDetails && (
                <div className="mt-2 font-medium text-gray-900">
                  {confirmAction.bookingDetails}
                </div>
              )}
              {confirmAction.type === "approve" && (
                <div className="mt-2 text-sm text-green-600">
                  This will confirm the booking and the user will be notified.
                </div>
              )}
              {confirmAction.type === "reject" && (
                <div className="mt-2 text-sm text-red-600">
                  This will reject the booking and the user will be notified.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction({ type: null, bookingId: null, bookingDetails: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmActionHandler}
              variant={confirmAction.type === "reject" ? "destructive" : "default"}
            >
              {confirmAction.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </main>
      </div>
    </div>
  )
}