"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah } from "@/lib/currency"
import { Calendar, Clock, DollarSign, Users, CheckCircle2, Building, CreditCard } from "lucide-react"
import Link from "next/link"

interface BookingData {
  bookingId: string
  fieldName: string
  timeSlots: Array<{
    date: string
    slot: string
  }>
  totalAmount: number
  amountPaid: number
  paymentType: string
  slotCount: number
  namaTim: string
  noWhatsapp: string
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get booking data from URL parameters
    const bookingParam = searchParams.get('booking')

    if (bookingParam) {
      try {
        const decodedData = JSON.parse(atob(bookingParam))
        setBookingData(decodedData)
      } catch (error) {
        console.error('Error parsing booking data:', error)
        router.push('/fields')
      }
    } else {
      router.push('/fields')
    }

    setIsLoading(false)
  }, [searchParams, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return date.toLocaleDateString('id-ID', options)
  }

  const groupSlotsByDate = (timeSlots: Array<{ date: string; slot: string }>) => {
    return timeSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot.slot)
      return acc
    }, {} as Record<string, string[]>)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Booking not found</p>
          <Link href="/fields">
            <Button>Back to Fields</Button>
          </Link>
        </div>
      </div>
    )
  }

  const groupedSlots = groupSlotsByDate(bookingData.timeSlots)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            🏟️ Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Your soccer field booking has been successfully created. Please complete the payment to confirm your reservation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Field Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Lapangan</div>
                <div className="font-semibold text-gray-900 text-lg">{bookingData.fieldName}</div>
              </div>

              {/* Team Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-3">
                  <Users className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-xs text-gray-600">Tim</div>
                  <div className="font-semibold text-gray-900 text-sm">{bookingData.namaTim}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">WhatsApp</div>
                  <div className="font-semibold text-gray-900 text-sm">{bookingData.noWhatsapp}</div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Waktu yang Dipesan ({bookingData.slotCount} slot):
                </div>
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {formatDate(date)}
                    </div>
                    <div className="space-y-1">
                      {slots.map((slot, index) => (
                        <div key={index} className="text-sm text-gray-600 ml-2">
                          • {slot}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Harga:</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatRupiah(bookingData.totalAmount)}
                  </div>
                  <div>
                    <span className="text-gray-600">Jumlah Dibayar:</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatRupiah(bookingData.amountPaid)}
                  </div>
                  <div>
                    <span className="text-gray-600">Tipe Pembayaran:</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {bookingData.paymentType === 'DEPOSIT' ? 'Uang Muka (30%)' : 'Pembayaran Penuh'}
                  </div>
                </div>
              </div>

              {/* Payment Type Badge */}
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  bookingData.paymentType === 'DEPOSIT'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {bookingData.paymentType === 'DEPOSIT' ? '💰 Pembayaran Uang Muka' : '💵 Pembayaran Penuh'}
                </span>
                {bookingData.paymentType === 'DEPOSIT' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sisa pembayaran akan dilunasi di lokasi
                  </p>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Informasi Transfer
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nama Penerima:</span>
                    <span className="font-semibold text-gray-900">CV BATAS KOTA POINT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bank Tujuan:</span>
                    <span className="font-semibold text-gray-900">MANDIRI</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">No. Rekening:</span>
                    <span className="font-semibold text-gray-900 font-mono">161-001-647-5977</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link href={`/bookings/${bookingData.bookingId}/payment-proof`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Upload Bukti Pembayaran
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Lihat Dashboard Saya
                  </Button>
                </Link>
                <Link href="/fields">
                  <Button variant="ghost" className="w-full">
                    Booking Lapangan Lain
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Langkah Selanjutnya?</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. Transfer ke rekening yang tertera di atas</p>
                <p>2. Upload bukti pembayaran untuk konfirmasi</p>
                <p>3. Tunggu persetujuan dari admin</p>
                <p>4. Datang 15 menit sebelum waktu pertandingan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}