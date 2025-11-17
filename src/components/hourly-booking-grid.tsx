"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BookingSuccessModal from "@/components/booking-success-modal"
import { formatRupiah } from "@/lib/currency"
import { getWITADateString, getMinBookingDate, isTimeSlotAvailable } from "@/lib/timezone"
import {
  Calendar,
  Clock,
  User,
  Coins,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface Booking {
  id: string
  status: string
  startTime: Date
  endTime: Date
  user: {
    name: string
    email: string
  }
}

interface HourlyBooking {
  startHour: string
  endHour: string
  booking: Booking | null
}

interface HourlyBookingGridProps {
  fieldId: string
  fieldName: string
  pricePerHour: number
  existingBookings: Booking[]
}

export default function HourlyBookingGrid({ fieldId, fieldName, pricePerHour, existingBookings }: HourlyBookingGridProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(getWITADateString())
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [paymentType, setPaymentType] = useState("FULL")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const getHourlyBookings = (date: string): HourlyBooking[] => {
    const hourlyBookings: HourlyBooking[] = []

    // Generate 2-hour slots from 6:00 AM to 9:00 PM (last slot: 20:00-22:00)
    for (let hour = 6; hour <= 20; hour += 2) {
      const startHourString = `${hour.toString().padStart(2, '0')}:00`
      const endHourString = `${(hour + 2).toString().padStart(2, '0')}:00`

      // Check if any existing booking overlaps with this 2-hour slot
      const booking = existingBookings.find(booking => {
        const bookingDate = getLocalDateString(new Date(booking.startTime))
        const bookingStartHour = new Date(booking.startTime).getHours()
        const bookingEndHour = new Date(booking.endTime).getHours()

        return bookingDate === date &&
               !(bookingEndHour <= hour || bookingStartHour >= hour + 2)
      })

      hourlyBookings.push({
        startHour: startHourString,
        endHour: endHourString,
        booking: booking || null
      })
    }

    return hourlyBookings
  }

  
  const isSlotBooked = (startHour: string): boolean => {
    const hourlyBookings = getHourlyBookings(selectedDate)
    const slot = hourlyBookings.find(slot => slot.startHour === startHour)
    return slot?.booking !== null
  }

  const handleSlotClick = (startHour: string) => {
    if (!session) {
      return
    }

    if (isSlotBooked(startHour)) {
      return
    }

    // Check if time slot is in the past (not available for booking)
    const hourNumber = parseInt(startHour.split(':')[0])
    if (!isTimeSlotAvailable(selectedDate, hourNumber)) {
      return
    }

    setSelectedSlots(prev => {
      if (prev.includes(startHour)) {
        return prev.filter(slot => slot !== startHour)
      } else {
        return [startHour] // Only allow one 2-hour slot at a time
      }
    })
  }

  const calculatePrice = () => {
    const twoHourSlots = selectedSlots.length
    const totalPrice = pricePerHour * 2 * twoHourSlots // 2 hours per slot

    if (paymentType === "DEPOSIT") {
      return {
        deposit: Math.round(totalPrice * 0.3),
        remaining: Math.round(totalPrice * 0.7),
        total: totalPrice
      }
    }

    return {
      deposit: 0,
      remaining: 0,
      total: totalPrice
    }
  }

  const createBooking = async () => {
    if (!session || selectedSlots.length === 0) {
      return
    }

    setIsCreatingBooking(true)

    try {
      const selectedSlot = selectedSlots[0] // Only one slot for 2-hour booking
      const startHour = parseInt(selectedSlot.split(':')[0])

      const startTimeString = `${selectedDate}T${selectedSlot}:00`
      const endTimeString = `${selectedDate}T${(startHour + 2).toString().padStart(2, '0')}:00`

      const startTime = new Date(startTimeString)
      const endTime = new Date(endTimeString)

      const pricing = calculatePrice()

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldId,
          date: selectedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          paymentType,
          amountPaid: pricing.deposit || pricing.total
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create booking")
      } else {
        setBookingDetails({
          fieldName,
          date: selectedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          amount: pricing.deposit || pricing.total,
          paymentType
        })
        setShowSuccessModal(true)
        setSelectedSlots([])
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Something went wrong. Please try again."}`)
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const hourlyBookings = getHourlyBookings(selectedDate)
  const pricing = calculatePrice()

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Book This Field</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">Please sign in to make a booking</p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Book This Field</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedSlots([])
                }}
                min={getMinBookingDate()}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">How to book:</span>
              </div>
              <ol className="text-xs text-blue-800 space-y-1 ml-6">
                <li>1. Select your preferred date</li>
                <li>2. Click on available 2-hour time slots (green)</li>
                <li>3. Choose payment type and book</li>
              </ol>
            </div>

            {/* Hourly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {hourlyBookings.map(({ startHour, endHour, booking }) => {
                const hourNumber = parseInt(startHour.split(':')[0])
                const isPastTime = !isTimeSlotAvailable(selectedDate, hourNumber)

                return (
                  <button
                    key={startHour}
                    onClick={() => handleSlotClick(startHour)}
                    disabled={booking !== null || isPastTime}
                  className={`p-4 rounded-lg border text-left transition-all min-h-[100px] ${
                    booking
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : isPastTime
                      ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                      : selectedSlots.includes(startHour)
                      ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{startHour} - {endHour}</span>
                      </div>
                    </div>

                    {booking ? (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">Not Avail</span>
                      </div>
                    ) : isPastTime ? (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">Passed</span>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-1">
                        {selectedSlots.includes(startHour) ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs text-emerald-600">Selected</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                            <span className="text-xs text-gray-500">Available</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
              })}
            </div>

            {/* Selected Slots Summary */}
            {selectedSlots.length > 0 && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-emerald-900">
                    Selected Time Slots:
                  </span>
                  <button
                    onClick={() => setSelectedSlots([])}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedSlots.map(slot => (
                    <Badge key={slot} variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {slot}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-emerald-700">
                  Duration: {selectedSlots.length * 2} hour{selectedSlots.length * 2 > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Payment Type Selection */}
            {selectedSlots.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Type</label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">
                      Full Payment ({formatRupiah(pricing.total)})
                    </SelectItem>
                    <SelectItem value="DEPOSIT">
                      Deposit ({formatRupiah(pricing.deposit)}) - Pay {formatRupiah(pricing.remaining)} on-site
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Pricing and Booking Button */}
            {selectedSlots.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatRupiah(paymentType === "DEPOSIT" ? pricing.deposit : pricing.total)}
                  </span>
                </div>
                {paymentType === "DEPOSIT" && (
                  <p className="text-sm text-gray-600">
                    Remaining {formatRupiah(pricing.remaining)} to be paid on-site
                  </p>
                )}
                <Button
                  onClick={createBooking}
                  disabled={isCreatingBooking || selectedSlots.length === 0}
                  className="w-full"
                >
                  {isCreatingBooking ? "Creating Booking..." : "Book Now"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {bookingDetails && (
        <BookingSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            router.push("/dashboard")
          }}
          fieldName={bookingDetails.fieldName}
          date={bookingDetails.date}
          startTime={bookingDetails.startTime}
          endTime={bookingDetails.endTime}
          amount={bookingDetails.amount}
          paymentType={bookingDetails.paymentType}
        />
      )}
    </>
  )
}