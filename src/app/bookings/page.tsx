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
  ArrowLeft,
  Filter,
  ChevronDown,
  Info,
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

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
            booking.field.id === group[0].field.id &&
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

  const filteredGroups = bookingGroups.filter(group =>
    statusFilter === "all" || group[0].status === statusFilter
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FAF7F2] to-[#F5F0E8]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 bg-gray-200 rounded-lg" />
              <Skeleton className="h-8 w-64 bg-gray-200 rounded-lg" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 bg-gray-200 rounded mb-4" />
                    <Skeleton className="h-8 w-20 bg-gray-200 rounded mb-2" />
                    <Skeleton className="h-3 w-32 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bookings Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((j) => (
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
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const approvedBookings = bookings.filter((b) => b.status === "APPROVED").length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalSpent = bookings
    .filter((b) => b.status === "APPROVED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.amountPaid, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FAF7F2] to-[#F5F0E8]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#703B3B] to-[#8B4F4F] rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Semua Pemesanan</h1>
                <p className="text-gray-600">Kelola dan lihat semua pemesanan lapangan sepak bola Anda</p>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#E1D0B3]/20 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#703B3B]"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="APPROVED">Disetujui</option>
              <option value="COMPLETED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-[#703B3B]" />
                  <span className="text-2xl font-bold text-gray-900">{totalBookings}</span>
                </div>
                <div className="text-sm text-gray-600">Total Pemesanan</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-[#8B4F4F]" />
                  <span className="text-2xl font-bold text-gray-900">{pendingBookings}</span>
                </div>
                <div className="text-sm text-gray-600">Menunggu Konfirmasi</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{approvedBookings}</span>
                </div>
                <div className="text-sm text-gray-600">Disetujui</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{completedBookings}</span>
                </div>
                <div className="text-sm text-gray-600">Selesai</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-[#703B3B]" />
                  <span className="text-xl font-bold text-[#703B3B]">{formatRupiah(totalSpent)}</span>
                </div>
                <div className="text-sm text-gray-600">Total Pengeluaran</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {statusFilter === "all" ? "Belum ada pemesanan" : `Tidak ada pemesanan dengan status ${statusFilter}`}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {statusFilter === "all"
                    ? "Mulai jelajahi dan pesan lapangan sepak bola premium di area Anda"
                    : "Coba ubah filter status untuk melihat pemesanan lainnya"
                  }
                </p>
                {statusFilter === "all" && (
                  <Link href="/fields">
                    <Button className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                      <Target className="w-4 h-4 mr-2" />
                      Jelajahi Lapangan
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((bookingGroup, groupIndex) => {
              const mainBooking = bookingGroup[0];
              const totalAmount = bookingGroup.reduce((sum, b) => sum + b.amountPaid, 0);
              const totalDuration = bookingGroup.reduce((sum, b) =>
                sum + Math.round((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)), 0
              );
              const allDates = [...new Set(bookingGroup.map(b => format(new Date(b.startTime), "d MMM yyyy")))];
              const allTimes = bookingGroup.map(b =>
                `${format(new Date(b.startTime), "h:mm a")} - ${format(new Date(b.endTime), "h:mm a")}`
              );

              return (
                <Card key={`${mainBooking.id}-group`} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                      {/* Field Info */}
                      <div className="lg:col-span-1">
                        <div className="font-semibold text-gray-900 mb-2">{mainBooking.field.name}</div>
                        {bookingGroup.length > 1 && (
                          <div className="text-xs text-[#703B3B] font-medium bg-[#703B3B]/10 px-2 py-1 rounded-full inline-block">
                            {bookingGroup.length} slot terkait
                          </div>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div className="lg:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Tanggal & Waktu</div>
                        <div className="font-medium text-gray-900">
                          {allDates.length === 1 ? allDates[0] : `${allDates.length} tanggal`}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {bookingGroup.length === 1 ? allTimes[0] : `${bookingGroup.length} slot`}
                        </div>
                        {bookingGroup.length > 1 && (
                          <details className="mt-1">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                              Lihat semua slot
                            </summary>
                            <div className="mt-1 text-xs text-gray-500 pl-4">
                              {allTimes.map((time, i) => (
                                <div key={i}>• {time}</div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>

                      {/* Duration & Payment */}
                      <div className="lg:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Durasi & Pembayaran</div>
                        <div className="font-medium text-gray-900">{totalDuration} jam</div>
                        <div className="text-sm text-gray-700">
                          {mainBooking.paymentType === "DEPOSIT" ? "DP (30%)" : "Lunas"}
                        </div>
                        {mainBooking.paymentType === "DEPOSIT" && (
                          <div className="text-xs text-gray-500">
                            +{formatRupiah(mainBooking.field.pricePerHour * totalDuration - totalAmount)} di tempat
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="lg:col-span-1">
                        <div className="text-sm text-gray-600 mb-1">Total Biaya</div>
                        <div className="font-bold text-lg text-[#703B3B]">
                          {formatRupiah(totalAmount)}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="lg:col-span-1">
                        <div className="mb-3">
                          <Badge
                            className={`${getStatusColor(mainBooking.status)} border font-medium flex items-center gap-2 w-fit`}
                          >
                            {getStatusIcon(mainBooking.status)}
                            {mainBooking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                          {mainBooking.status === "PENDING" && !mainBooking.proofImageUrl && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white shadow-md hover:shadow-lg transition-all duration-200"
                              onClick={() => {
                                setSelectedBooking(mainBooking);
                                setPaymentModalOpen(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Upload Bukti
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8]">
                            <Link href={`/bookings/${mainBooking.id}`}>
                              Detail
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

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