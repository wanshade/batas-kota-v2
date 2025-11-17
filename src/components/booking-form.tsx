"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import BookingSuccessModal from "@/components/booking-success-modal"
import { formatRupiah } from "@/lib/currency"

interface Booking {
  id: string
  startTime: Date
  endTime: Date
  status: string
}

interface BookingFormProps {
  fieldId: string
  fieldName: string
  pricePerHour: number
  existingBookings: Booking[]
}

export default function BookingForm({ fieldId, fieldName, pricePerHour, existingBookings }: BookingFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    duration: "1",
    paymentType: "FULL"
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateEndTime = () => {
    if (!formData.date || !formData.startTime || !formData.duration) return null

    const startDate = new Date(`${formData.date}T${formData.startTime}`)
    const duration = parseInt(formData.duration)
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)

    return endDate
  }

  const calculatePrice = () => {
    const duration = parseInt(formData.duration) || 1
    const totalPrice = pricePerHour * duration

    if (formData.paymentType === "DEPOSIT") {
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

  const checkTimeSlotAvailable = () => {
    if (!formData.date || !formData.startTime || !formData.duration) return false

    const startTime = new Date(`${formData.date}T${formData.startTime}`)
    const duration = parseInt(formData.duration)
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)

    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)

      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      )
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!session) {
      setError("Please sign in to make a booking")
      setIsLoading(false)
      return
    }

    const endTime = calculateEndTime()
    if (!endTime) {
      setError("Invalid time selected")
      setIsLoading(false)
      return
    }

    const isAvailable = checkTimeSlotAvailable()
    if (!isAvailable) {
      setError("This time slot is already booked")
      setIsLoading(false)
      return
    }

    const pricing = calculatePrice()

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldId,
          date: formData.date,
          startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
          endTime: endTime.toISOString(),
          paymentType: formData.paymentType,
          amountPaid: pricing.deposit || pricing.total
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create booking")
      } else {
        setBookingDetails({
          fieldName,
          date: formData.date,
          startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
          endTime: endTime!.toISOString(),
          amount: pricing.deposit || pricing.total,
          paymentType: formData.paymentType
        })
        setShowSuccessModal(true)
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const pricing = calculatePrice()
  const endTime = calculateEndTime()
  const isTimeSlotAvailable = formData.date && formData.startTime && formData.duration ? checkTimeSlotAvailable() : null

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600">Please sign in to make a booking</p>
        <Button asChild className="w-full">
          <a href="/login">Sign In</a>
        </Button>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            min={format(new Date(), "yyyy-MM-dd")}
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            min="06:00"
            max="22:00"
            value={formData.startTime}
            onChange={(e) => handleInputChange("startTime", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (hours)</Label>
          <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="2">2 hours</SelectItem>
              <SelectItem value="3">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {endTime && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <div>End Time: {format(endTime, "h:mm a")}</div>
              {isTimeSlotAvailable === false && (
                <div className="text-red-600 font-medium">Time slot not available</div>
              )}
              {isTimeSlotAvailable === true && (
                <div className="text-green-600 font-medium">Time slot available</div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select value={formData.paymentType} onValueChange={(value) => handleInputChange("paymentType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL">Full Payment ({formatRupiah(pricing.total)})</SelectItem>
              <SelectItem value="DEPOSIT">
                Deposit ({formatRupiah(pricing.deposit)}) - Pay {formatRupiah(pricing.remaining)} on-site
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              {formatRupiah(formData.paymentType === "DEPOSIT" ? pricing.deposit : pricing.total)}
            </span>
          </div>
          {formData.paymentType === "DEPOSIT" && (
            <p className="text-sm text-gray-600 mb-4">
              Remaining {formatRupiah(pricing.remaining)} to be paid on-site
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-red-50 p-3 rounded">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || isTimeSlotAvailable === false}>
          {isLoading ? "Creating Booking..." : "Book Now"}
        </Button>
      </form>

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