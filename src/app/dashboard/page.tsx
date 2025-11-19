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
                  <Skeleton className="h-8 w-80 bg-gray-200 rounded-lg" />
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

  const recentBookingGroups = groupBookingsBySession(bookings)
    .sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime())
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
                  Selamat datang kembali, {session?.user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-600">
                  Kelola pemesanan lapangan sepak bola Anda dan jelajah venue premium
                </p>
              </div>
            </div>
            <Link href="/fields">
              <Button className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <PlayCircle className="w-4 h-4 mr-2" />
                Pesan Lapangan Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[#FAF7F2]">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Total Bookings */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#703B3B]/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#703B3B]" />
                    </div>
                    <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                      Total Pemesanan
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {totalBookings}
                  </div>
                  <div className="text-sm text-gray-600">
                    {totalBookings > 0 ? "Total pemesanan dibuat" : "Mulai pesan lapangan"}
                  </div>
                </div>

                {/* Pending */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#E1D0B3]/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#8B4F4F]" />
                    </div>
                    <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                      Menunggu
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {pendingBookings}
                  </div>
                  <div className="text-sm text-gray-600">
                    {pendingBookings > 0 ? "Menunggu konfirmasi" : "Tidak ada pemesanan menunggu"}
                  </div>
                </div>

                {/* Completed */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#703B3B]/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#703B3B]" />
                    </div>
                    <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                      Selesai
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {completedBookings}
                  </div>
                  <div className="text-sm text-gray-600">
                    {completedBookings > 0 ? "Sesi selesai" : "Tidak ada sesi selesai"}
                  </div>
                </div>

                {/* Total Spent */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#E1D0B3]/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#8B4F4F]" />
                    </div>
                    <div className="text-gray-600 font-medium text-sm uppercase tracking-wide">
                      Total Pengeluaran
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#703B3B] mb-1">
                    {formatRupiah(totalSpent)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {totalSpent > 0 ? "Total jumlah yang dikeluarkan" : "Belum ada pengeluaran"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E1D0B3]/20">
          <div className="p-6 border-b border-[#E1D0B3]/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#703B3B] to-[#8B4F4F] rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pemesanan Terbaru</h2>
              </div>
              <Link href="/bookings">
                <Button variant="outline" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8] hover:border-[#703B3B]">
                  Lihat Semua
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Belum ada pemesanan</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Mulai jelajahi dan pesan lapangan sepak bola premium di area Anda
                </p>
                <Link href="/fields">
                  <Button className="bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#703B3B] text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    <Target className="w-4 h-4 mr-2" />
                    Jelajahi Lapangan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E1D0B3]/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Lapangan</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Waktu</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Durasi</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Jumlah</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookingGroups.map((bookingGroup, groupIndex) => {
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
                        <tr
                          key={`${mainBooking.id}-group`}
                          className={`border-b border-[#E1D0B3]/10 hover:bg-[#F5F0E8]/30 transition-colors duration-200 ${
                            groupIndex === recentBookingGroups.length - 1 ? 'border-b-0' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{mainBooking.field.name}</div>
                            {bookingGroup.length > 1 && (
                              <div className="text-xs text-[#703B3B] font-medium mt-1">
                                {bookingGroup.length} slot terkait
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700">
                              {allDates.length === 1 ? allDates[0] : `${allDates.length} tanggal`}
                            </div>
                            {allDates.length > 1 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {allDates.join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700">
                              {bookingGroup.length === 1 ? allTimes[0] : `${bookingGroup.length} slot`}
                            </div>
                            {bookingGroup.length > 1 && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {allTimes.slice(0, 2).join(", ")}
                                {allTimes.length > 2 && ` +${allTimes.length - 2} lainnya`}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700">
                              {totalDuration}h
                            </div>
                            {bookingGroup.length > 1 && (
                              <div className="text-xs text-gray-500">
                                {bookingGroup.length} slot × avg {Math.round(totalDuration / bookingGroup.length)}h
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-bold text-[#703B3B]">
                                {formatRupiah(totalAmount)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={`${getStatusColor(mainBooking.status)} border font-medium flex items-center gap-2 w-fit`}
                            >
                              {getStatusIcon(mainBooking.status)}
                              {mainBooking.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
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
                                  Upload
                                </Button>
                              )}
                              <Button asChild variant="outline" size="sm" className="border-[#E1D0B3] text-[#703B3B] hover:bg-[#F5F0E8]">
                                <Link href={`/bookings/${mainBooking.id}`}>
                                  Detail
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
    </div>
  );
}