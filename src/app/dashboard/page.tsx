"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { formatRupiah } from "@/lib/currency";
import PaymentUploadModal from "@/components/payment-upload-modal";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  MapPin,
  CreditCard,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Users,
  Target,
  PlayCircle,
  ArrowUpRight,
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  amountPaid: number;
  paymentType: string;
  proofImageUrl?: string;
  createdAt: string;
  field: {
    id: string;
    name: string;
    imageUrl?: string;
    pricePerHour: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "CANCELLED":
        return "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <Activity className="w-4 h-4" />;
      case "CANCELLED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handlePaymentUploadSuccess = () => {
    fetchBookings();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FAF7F2] to-[#F5F0E8]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 bg-gray-200 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64 bg-gray-200 rounded-lg" />
                  <Skeleton className="h-4 w-96 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                      <Skeleton className="h-10 w-10 bg-gray-200 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-gray-200 rounded mb-2" />
                    <Skeleton className="h-3 w-32 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bookings Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-40 bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-48 bg-gray-200 rounded" />
                        <Skeleton className="h-6 w-24 bg-gray-200 rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="space-y-2">
                            <Skeleton className="h-3 w-16 bg-gray-200 rounded" />
                            <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const totalSpent = bookings
    .filter((b) => b.status === "APPROVED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.amountPaid, 0);

  // Get recent bookings (last 5)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FAF7F2] to-[#F5F0E8]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#703B3B] to-[#8B4F4F] rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your soccer field bookings and explore premium venues
                </p>
              </div>
            </div>
            <Link href="/fields">
              <Button className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <PlayCircle className="w-4 h-4 mr-2" />
                Book New Field
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Total Bookings
                </div>
                <div className="w-10 h-10 bg-[#703B3B]/10 group-hover:bg-[#703B3B]/20 rounded-lg flex items-center justify-center transition-colors">
                  <Calendar className="w-5 h-5 text-[#703B3B]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalBookings}
              </div>
              <div className="text-sm text-gray-600">
                {totalBookings > 0 ? "Total bookings made" : "Start booking fields"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Pending
                </div>
                <div className="w-10 h-10 bg-[#E1D0B3]/20 group-hover:bg-[#E1D0B3]/30 rounded-lg flex items-center justify-center transition-colors">
                  <Clock className="w-5 h-5 text-[#8B4F4F]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {pendingBookings}
              </div>
              <div className="text-sm text-gray-600">
                {pendingBookings > 0 ? "Awaiting confirmation" : "No pending bookings"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Completed
                </div>
                <div className="w-10 h-10 bg-[#703B3B]/10 group-hover:bg-[#703B3B]/20 rounded-lg flex items-center justify-center transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-[#703B3B]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {completedBookings}
              </div>
              <div className="text-sm text-gray-600">
                {completedBookings > 0 ? "Sessions completed" : "No completed sessions"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                  Total Spent
                </div>
                <div className="w-10 h-10 bg-[#E1D0B3]/20 group-hover:bg-[#E1D0B3]/30 rounded-lg flex items-center justify-center transition-colors">
                  <DollarSign className="w-5 h-5 text-[#8B4F4F]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatRupiah(totalSpent)}
              </div>
              <div className="text-sm text-gray-600">
                {totalSpent > 0 ? "Total amount spent" : "No spending yet"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#703B3B] to-[#8B4F4F] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-xl">Recent Bookings</CardTitle>
            </div>
            <Link href="/bookings">
              <Button variant="outline" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8] hover:border-[#703B3B]">
                View All
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No bookings yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start exploring and booking premium soccer fields in your area
                </p>
                <Link href="/fields">
                  <Button className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    <Target className="w-4 h-4 mr-2" />
                    Explore Fields
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="border border-[#E1D0B3]/30 rounded-xl p-6 hover:border-[#703B3B]/50 hover:shadow-sm transition-all duration-200 bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {booking.field.name}
                          </h3>
                          <Badge
                            className={`${getStatusColor(booking.status)} border font-medium flex items-center gap-2`}
                          >
                            {getStatusIcon(booking.status)}
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

                        <div className="pt-4 border-t border-[#E1D0B3]/20">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">
                                Amount Paid
                              </div>
                              <div className="text-2xl font-bold text-[#703B3B]">
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
                                  className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white shadow-md hover:shadow-lg transition-all duration-200"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setPaymentModalOpen(true);
                                  }}
                                >
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Upload Payment
                                </Button>
                              )}
                              <Button asChild variant="outline" size="sm" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8]">
                                <Link href={`/bookings/${booking.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Upload Modal */}
        <PaymentUploadModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          booking={selectedBooking}
          onSuccess={handlePaymentUploadSuccess}
        />
      </div>
    </div>
  );
}