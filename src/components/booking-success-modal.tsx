"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { formatRupiah } from "@/lib/currency"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Calendar, Clock, DollarSign, Building, CreditCard } from "lucide-react"

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  fieldName: string
  date: string
  startTime: string
  endTime: string
  amount: number
  paymentType: string
  slotCount?: number
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  fieldName,
  date,
  startTime,
  endTime,
  amount,
  paymentType,
  slotCount = 1
}: BookingSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti when modal opens
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Create soccer-themed confetti
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#10b981', '#22c55e', '#16a34a', '#15803d', '#166534'], // Green shades
          shapes: ['circle', 'square'],
        })

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#22c55e', '#16a34a', '#15803d', '#166534'],
          shapes: ['circle', 'square'],
        })

        // Add some golden particles for premium feel
        confetti({
          ...defaults,
          particleCount: 10,
          origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 },
          colors: ['#fbbf24', '#f59e0b', '#d97706'], // Golden colors
          shapes: ['star'],
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

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

  const handleViewBookings = () => {
    onClose()
    // In a real app, this would navigate to user's bookings
    window.location.href = "/dashboard"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-900">
            🏟️ {slotCount > 1 ? `${slotCount} Pemesanan Dikonfirmasi!` : 'Pemesanan Dikonfirmasi!'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            {slotCount > 1
              ? `${slotCount} slot waktu pemesanan Anda telah berhasil dibuat. Siapkan diri untuk beberapa pertandingan seru!`
              : 'Pemesanan lapangan soccer Anda telah berhasil dibuat. Siapkan diri untuk pertandingan yang seru!'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Field Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Lapangan</div>
            <div className="font-semibold text-gray-900 text-lg">{fieldName}</div>
          </div>

          {/* Booking Details */}
          <div className={`grid gap-4 text-center ${slotCount > 1 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <div className="bg-blue-50 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Tanggal</div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatDate(date)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Waktu</div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatTime(startTime)} - {formatTime(endTime)}
              </div>
            </div>
            {slotCount > 1 && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="w-6 h-6 bg-emerald-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{slotCount}</span>
                </div>
                <div className="text-xs text-gray-600">Slot</div>
                <div className="font-semibold text-gray-900 text-sm">
                  {slotCount} × 2jam
                </div>
              </div>
            )}
            <div className="bg-yellow-50 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Jumlah</div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatRupiah(amount)}
              </div>
            </div>
          </div>

          {/* Payment Type Badge */}
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              paymentType === 'DEPOSIT'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {paymentType === 'DEPOSIT' ? '💰 Pembayaran Uang Muka' : '💵 Pembayaran Penuh'}
            </span>
            {paymentType === 'DEPOSIT' && (
              <p className="text-xs text-gray-500 mt-2">
                Sisa pembayaran akan dilunasi di lokasi
              </p>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Informasi Pembayaran
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
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                Silakan transfer ke rekening di atas dan upload bukti pembayaran untuk konfirmasi pemesanan.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-2">Langkah Selanjutnya?</div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Upload bukti pembayaran jika diperlukan</li>
              <li>• Tunggu persetujuan dari admin</li>
              <li>• Periksa email Anda untuk konfirmasi</li>
              <li>• Datang 15 menit sebelum waktu pertandingan</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Tutup
            </Button>
            <Button
              onClick={handleViewBookings}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Lihat Pemesanan Saya
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}