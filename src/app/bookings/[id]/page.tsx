"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { formatRupiah } from "@/lib/currency";
import {
  MapPin,
  Clock,
  Calendar,
  User,
  Image,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  CreditCard,
  FileText,
  Info,
  DollarSign,
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
  user: {
    name: string;
    email: string;
  };
}

interface BookingDetailsResponse {
  booking: Booking;
  relatedBookings: Booking[];
}

export default function BookingDetailsPageRedesigned() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [bookingData, setBookingData] = useState<BookingDetailsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchBooking();
    }
  }, [status, router, params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setBookingData(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          bgGradient: "from-amber-400 to-orange-400",
          icon: Clock3,
          label: "Pending Approval",
        };
      case "APPROVED":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          bgGradient: "from-emerald-400 to-green-500",
          icon: CheckCircle2,
          label: "Approved",
        };
      case "REJECTED":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          bgGradient: "from-red-400 to-rose-500",
          icon: XCircle,
          label: "Rejected",
        };
      case "COMPLETED":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          bgGradient: "from-blue-400 to-indigo-500",
          icon: CheckCircle2,
          label: "Completed",
        };
      case "CANCELLED":
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          bgGradient: "from-slate-400 to-gray-500",
          icon: AlertCircle,
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          bgGradient: "from-slate-400 to-gray-500",
          icon: AlertCircle,
          label: "Unknown",
        };
    }
  };

  const calculateDuration = () => {
    if (!bookingData) return 0;
    return bookingData.relatedBookings.reduce(
      (total, b) =>
        total +
        Math.round(
          (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) /
            (1000 * 60 * 60)
        ),
      0
    );
  };

  const calculateTotalCost = () => {
    if (!bookingData) return 0;
    return bookingData.relatedBookings.reduce((total, b) => {
      const duration = Math.round(
        (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) /
          (1000 * 60 * 60)
      );
      return total + b.field.pricePerHour * duration;
    }, 0);
  };

  const calculateTotalAmountPaid = () => {
    if (!bookingData) return 0;
    return bookingData.relatedBookings.reduce(
      (total, b) => total + b.amountPaid,
      0
    );
  };

  const groupSlotsByDate = () => {
    if (!bookingData) return {};

    const slotsByDate: Record<string, Booking[]> = {};
    bookingData.relatedBookings.forEach((booking) => {
      const date = format(new Date(booking.startTime), "yyyy-MM-dd");
      if (!slotsByDate[date]) {
        slotsByDate[date] = [];
      }
      slotsByDate[date].push(booking);
    });

    return slotsByDate;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
        {/* Back Navigation Skeleton */}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-9 w-32 mb-2" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="container mx-auto px-4 pb-16 max-w-7xl">
          <div className="relative h-96 rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-emerald-100 to-slate-100">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <Skeleton className="h-10 w-72 mb-3 bg-white/30" />
                  <Skeleton className="h-6 w-56 bg-white/30" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Skeleton className="h-8 w-36 mb-1 bg-white/30" />
                    <Skeleton className="h-4 w-28 bg-white/30" />
                  </div>
                  <Skeleton className="h-10 w-36 rounded-full bg-white/30 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-24 rounded-2xl bg-white/50" />
              <Skeleton className="h-40 rounded-2xl bg-white/50" />
              <Skeleton className="h-32 rounded-2xl bg-white/50" />
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-48 rounded-2xl bg-white/50" />
              <Skeleton className="h-64 rounded-2xl bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-light text-slate-900 mb-3">
            Booking not found
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The booking you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link href="/dashboard">
            <Button className="rounded-full px-8 py-6 h-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const booking = bookingData.booking;
  const slotsByDate = groupSlotsByDate();
  const totalSlots = bookingData.relatedBookings.length;
  const duration = calculateDuration();
  const totalCost = calculateTotalCost();
  const totalAmountPaid = calculateTotalAmountPaid();
  const remainingAmount = totalCost - totalAmountPaid;
  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-all duration-300 group font-medium"
        >
          <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-base">Back to Dashboard</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-7xl">
        {/* Hero Section with Field Image */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-16 shadow-2xl group">
          {booking.field.imageUrl ? (
            <>
              <img
                src={booking.field.imageUrl}
                alt={booking.field.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 flex items-center justify-center">
              <div className="text-center">
                <Image className="w-20 h-20 text-white/80 mb-4" />
                <div className="text-white/90 text-xl font-light">
                  No field image available
                </div>
              </div>
            </div>
          )}

          {/* Overlay with field name and status */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-light text-white leading-tight">
                  {booking.field.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90 text-lg">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {booking.paymentType === "DEPOSIT"
                      ? "Deposit Payment"
                      : "Full Payment"}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {totalSlots} slot{totalSlots !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {duration} hour{duration !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-light text-white mb-1">
                    {formatRupiah(totalAmountPaid)}
                  </div>
                  <div className="text-white/80 text-sm">Total Paid</div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border backdrop-blur-sm bg-white/90 shadow-lg ${statusInfo.color}`}
                >
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">{statusInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Date & Time Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-light text-slate-900">
                    Booking Schedule
                  </h2>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    {totalSlots} slot{totalSlots !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(slotsByDate).map(([date, slots]) => (
                  <div
                    key={date}
                    className="border-l-4 border-emerald-200 pl-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-lg">
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {slots.length} slot{slots.length !== 1 ? "s" : ""} •{" "}
                          {slots.reduce(
                            (total, slot) =>
                              total +
                              Math.round(
                                (new Date(slot.endTime).getTime() -
                                  new Date(slot.startTime).getTime()) /
                                  (1000 * 60 * 60)
                              ),
                            0
                          )}{" "}
                          hours
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {slots.map((slot, index) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-xl border border-emerald-100"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">
                              {format(new Date(slot.startTime), "h:mm a")} -{" "}
                              {format(new Date(slot.endTime), "h:mm a")}
                            </div>
                            <div className="text-slate-600 text-sm">
                              {Math.round(
                                (new Date(slot.endTime).getTime() -
                                  new Date(slot.startTime).getTime()) /
                                  (1000 * 60 * 60)
                              )}{" "}
                              hours
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Proof Card */}
            {booking.proofImageUrl && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-light text-slate-900">
                    Payment Proof
                  </h2>
                </div>
                <div
                  className="relative group cursor-pointer"
                  onClick={() => window.open(booking.proofImageUrl!, "_blank")}
                >
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                    <img
                      src={booking.proofImageUrl}
                      alt="Payment proof"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2 shadow-lg">
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        View Full Size
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Click to view payment proof in new tab
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-4 space-y-8">
            {/* Payment Summary Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 shadow-lg border border-emerald-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-md">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-light text-slate-900">
                  Payment Summary
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-medium text-emerald-700 text-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Total Amount Paid
                  </span>
                  <span>{formatRupiah(totalAmountPaid)}</span>
                </div>
                {booking.paymentType === "DEPOSIT" && remainingAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Remaining (Pay on-site)
                    </span>
                    <span>{formatRupiah(remainingAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-light text-slate-900 mb-8">
                Actions
              </h2>
              <div className="space-y-4">
                {booking.status === "PENDING" && !booking.proofImageUrl && (
                  <Button
                    asChild
                    className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium"
                  >
                    <Link href={`/bookings/${booking.id}/payment`}>
                      <FileText className="w-5 h-5 mr-2" />
                      Upload Payment Proof
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-14 rounded-full border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 text-lg font-medium"
                >
                  <Link href={`/fields/${booking.field.id}`}>
                    <MapPin className="w-5 h-5 mr-2" />
                    View Field Details
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full h-14 rounded-full border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 text-lg font-medium"
                >
                  <Link href="/dashboard">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Booking Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200/50 shadow-sm">
              <h2 className="text-2xl font-light text-slate-900 mb-8">
                Booking Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900 text-lg">
                      {booking.user.name}
                    </div>
                    <div className="text-slate-600">{booking.user.email}</div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-200/50 space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium text-slate-900 text-sm">
                      Booking ID
                    </div>
                    <div className="text-slate-600 text-sm font-mono bg-white/70 rounded-xl px-4 py-3 border border-slate-200/50 shadow-sm">
                      {booking.id}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-slate-900 text-sm">
                      Booking Session
                    </div>
                    <div className="text-slate-600 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(
                        new Date(booking.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </div>
                    <div className="text-xs text-slate-500 ml-6">
                      {totalSlots} booking{totalSlots !== 1 ? "s" : ""} in this
                      session
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
