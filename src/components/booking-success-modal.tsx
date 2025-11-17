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
import { CheckCircle2, Calendar, Clock, DollarSign } from "lucide-react"

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  fieldName: string
  date: string
  startTime: string
  endTime: string
  amount: number
  paymentType: string
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  fieldName,
  date,
  startTime,
  endTime,
  amount,
  paymentType
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
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
            🏟️ Booking Confirmed!
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Your soccer field booking has been successfully created. Get ready for an amazing game!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Field Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Field</div>
            <div className="font-semibold text-gray-900 text-lg">{fieldName}</div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Date</div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatDate(date)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Time</div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatTime(startTime)} - {formatTime(endTime)}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Amount</div>
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
              {paymentType === 'DEPOSIT' ? '💰 Deposit Payment' : '💵 Full Payment'}
            </span>
            {paymentType === 'DEPOSIT' && (
              <p className="text-xs text-gray-500 mt-2">
                Remaining balance to be paid at the field
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-2">What's Next?</div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Upload payment proof if required</li>
              <li>• Wait for admin approval</li>
              <li>• Check your email for confirmation</li>
              <li>• Arrive 15 minutes before game time</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={handleViewBookings}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              View My Bookings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}