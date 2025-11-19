"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import AdminLayout from "@/components/admin/admin-layout"
import { format } from "date-fns"
import { formatRupiah } from "@/lib/currency"
import {
  Calendar,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

interface Booking {
  id: string
  status: string
  startTime: string
  endTime: string
  amountPaid: number
  paymentType: string
  proofImageUrl?: string
  namaTim?: string
  noWhatsapp?: string
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

export default function EnhancedBookingsPage() {
  const { data: session } = useSession()
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
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const fetchBookings = useCallback(async (page: number = currentPage, status: string = statusFilter, search: string = searchTerm, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status !== 'ALL' && { status }),
        ...(search && { search })
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
  }, [currentPage, statusFilter, searchTerm])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

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
        fetchBookings(currentPage, statusFilter, searchTerm, true)
        setConfirmAction({ type: null, bookingId: null, bookingDetails: null })
      } else {
        console.error("Failed to update booking status")
      }
    } catch (error) {
      console.error("Failed to update booking status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />
      case "REJECTED":
        return <XCircle className="w-4 h-4" />
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

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
    }
  }

  // Group bookings by session (created within 1 minute of each other)
  const groupBookingsBySession = (bookings: Booking[]) => {
    const groups: Booking[][] = [];
    const sortedBookings = [...bookings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const booking of sortedBookings) {
      const bookingTime = new Date(booking.createdAt).getTime();
      const oneMinute = 60 * 1000; // 1 minute in milliseconds

      // Try to find an existing group for this booking
      let foundGroup = false;
      for (const group of groups) {
        const groupTime = new Date(group[0].createdAt).getTime();
        if (Math.abs(bookingTime - groupTime) < oneMinute &&
            booking.field.name === group[0].field.name &&
            booking.user.email === group[0].user.email &&
            booking.status === group[0].status) {
          group.push(booking);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([booking]);
      }
    }

    return groups;
  };

  const bookingGroups = groupBookingsBySession(bookings)
    .sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime());
  return (
    <AdminLayout
      title="Booking Management"
      description="Review and manage all booking requests and payments"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchBookings(currentPage, statusFilter, searchTerm, true)}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.PENDING || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.APPROVED || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.REJECTED || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Manage booking requests and payment verifications
            {pagination.total > 0 && (
              <span className="ml-2 font-medium text-gray-700">
                ({pagination.total} total)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {statusFilter !== 'ALL' || searchTerm
                  ? `No bookings match your criteria`
                  : 'No booking requests have been made yet'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingGroups.map((bookingGroup, groupIndex) => {
                      const mainBooking = bookingGroup[0];
                      const totalAmount = bookingGroup.reduce((sum, b) => sum + b.amountPaid, 0);
                      const totalDuration = bookingGroup.reduce((sum, b) =>
                        sum + Math.round((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)), 0
                      );
                      const allDates = [...new Set(bookingGroup.map(b => format(new Date(b.startTime), "MMM d, yyyy")))];
                      const allTimes = bookingGroup.map(b =>
                        `${format(new Date(b.startTime), "h:mm a")} - ${format(new Date(b.endTime), "h:mm a")}`
                      );

                      return (
                        <TableRow key={`${mainBooking.id}-group`} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{mainBooking.field.name}</div>
                              <div className="text-sm text-gray-500">
                                {formatRupiah(mainBooking.field.pricePerHour)}/hr
                              </div>
                              {bookingGroup.length > 1 && (
                                <div className="text-xs text-blue-600 font-medium mt-1">
                                  {bookingGroup.length} slot terkait
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{mainBooking.namaTim || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{mainBooking.noWhatsapp || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{mainBooking.user.name}</div>
                              <div className="text-sm text-gray-500">{mainBooking.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{allDates.length === 1 ? allDates[0] : `${allDates.length} dates`}</div>
                              <div className="text-sm text-gray-500">
                                {bookingGroup.length === 1 ? allTimes[0] : `${bookingGroup.length} slots`}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Booked: {format(new Date(mainBooking.createdAt), "MMM d, yyyy h:mm a")}
                              </div>
                              {bookingGroup.length > 1 && (
                                <details className="text-xs text-blue-600 cursor-pointer">
                                  <summary>View all slots</summary>
                                  <div className="mt-1 pl-2 text-gray-600">
                                    {allTimes.map((time, i) => (
                                      <div key={i}>• {time}</div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatRupiah(totalAmount)}</div>
                            <div className="text-sm text-gray-500">
                              {totalDuration}h total
                              {bookingGroup.length > 1 && (
                                <span> • {bookingGroup.length} slots</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(mainBooking.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(mainBooking.status)}
                                {mainBooking.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {mainBooking.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleActionClick("approve", mainBooking)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleActionClick("reject", mainBooking)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {mainBooking.proofImageUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProof(mainBooking.id)
                                    setSelectedProofUrl(`/api/bookings/${mainBooking.id}/payment-proof/image`)
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Proof
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Showing {bookingGroups.length} booking groups
                      {bookingGroups.length !== bookings.length && (
                        <span> ({bookings.length} total bookings)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(1)
                        fetchBookings(1, statusFilter, searchTerm)
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
                        fetchBookings(prevPage, statusFilter, searchTerm)
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
                        fetchBookings(nextPage, statusFilter, searchTerm)
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
                        fetchBookings(pagination.pages, statusFilter, searchTerm)
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
            <DialogDescription>
              Review the payment proof submitted by the customer
            </DialogDescription>
          </DialogHeader>
          {selectedProofUrl && (
            <div className="flex flex-col items-center">
              <img
                src={selectedProofUrl}
                alt="Payment Proof"
                className="max-w-full max-h-[600px] object-contain rounded-lg border"
                onError={(e) => {
                  console.error('Failed to load image:', selectedProofUrl)
                  e.currentTarget.src = '/placeholder-image.svg'
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
                  This will confirm the booking and the customer will be notified.
                </div>
              )}
              {confirmAction.type === "reject" && (
                <div className="mt-2 text-sm text-red-600">
                  This will reject the booking and the customer will be notified.
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
    </AdminLayout>
  )
}