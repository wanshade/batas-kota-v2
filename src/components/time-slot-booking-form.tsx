"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { formatRupiah } from "@/lib/currency"
import { getAvailableTimeSlots, getTimeSlotPrice, parseTimeSlot, TimeSlot } from "@/lib/schedule"
import { Clock, CheckCircle, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useBookingStore } from "@/stores/booking-store"

interface Booking {
  id: string
  startTime: Date
  endTime: Date
  status: string
}

interface TimeSlotBookingFormProps {
  fieldId: string
  fieldName: string
  existingBookings: Booking[]
}

export default function TimeSlotBookingForm({ fieldId, fieldName, existingBookings }: TimeSlotBookingFormProps) {
  const { data: session } = useSession()
  const router = useRouter()

  // Zustand store
  const {
    selectedSlotsByDate,
    formData,
    addSlotToDate,
    clearAllSlots,
    setFormData,
    getCurrentDateSlots,
    getAllSelectedSlots,
    getTotalSlotCount
  } = useBookingStore()

  // Local state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [pricing, setPricing] = useState({ deposit: 0, remaining: 0, total: 0 })

  useEffect(() => {
    if (formData.date) {
      loadAvailableTimeSlots()
    }
  }, [formData.date])

  const loadAvailableTimeSlots = async () => {
    try {
      const date = new Date(formData.date)
      const slots = await getAvailableTimeSlots(date)
      setAvailableTimeSlots(slots)
    } catch (error) {
      console.error("Error loading time slots:", error)
      setError("Failed to load available time slots")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ [field]: value })
  }

  const toggleTimeSlot = (slotJam: string) => {
    addSlotToDate(formData.date, slotJam)
  }

  const isSlotBooked = (slotJam: string): boolean => {
    const { start, end } = parseTimeSlot(slotJam)
    const bookingDate = formData.date

    // Check if already booked
    const isAlreadyBooked = existingBookings.some(booking => {
      const bookingDateStr = format(booking.startTime, 'yyyy-MM-dd')
      if (bookingDateStr !== bookingDate) return false

      const bookingStart = format(booking.startTime, 'HH:mm')
      const bookingEnd = format(booking.endTime, 'HH:mm')

      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      )
    })

    if (isAlreadyBooked) return true

    // Check if time has passed
    const today = new Date()
    const selectedDate = new Date(formData.date)
    const isToday = format(today, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

    if (isToday) {
      const currentTime = format(today, 'HH:mm')
      if (currentTime >= end) {
        return true // Time slot has passed
      }
    }

    return false
  }

  const isTimePassed = (slotJam: string): boolean => {
    const { end } = parseTimeSlot(slotJam)
    const today = new Date()
    const selectedDate = new Date(formData.date)
    const isToday = format(today, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

    if (isToday) {
      const currentTime = format(today, 'HH:mm')
      return currentTime >= end
    }
    return false
  }

  const calculateTotalPrice = async (): Promise<number> => {
    let totalPrice = 0

    for (const [date, slots] of Object.entries(selectedSlotsByDate)) {
      const bookingDate = new Date(date)
      for (const slotJam of slots) {
        const slotPrice = await getTimeSlotPrice(bookingDate, slotJam)
        totalPrice += slotPrice
      }
    }

    return totalPrice
  }

  const calculatePrice = async () => {
    const total = await calculateTotalPrice()

    if (formData.paymentType === "DEPOSIT") {
      return {
        deposit: Math.round(total * 0.3),
        remaining: Math.round(total * 0.7),
        total
      }
    }

    return {
      deposit: 0,
      remaining: 0,
      total
    }
  }

  // Note: getBookingTimes is no longer needed since we support multiple dates
// All booking times are handled individually in the submit function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!session) {
      setError("Please sign in to make a booking")
      setIsLoading(false)
      return
    }

    const allSelectedSlots = getAllSelectedSlots()
    if (allSelectedSlots.length === 0) {
      setError("Please select at least one time slot")
      setIsLoading(false)
      return
    }

    if (!formData.namaTim.trim()) {
      setError("Please enter team name")
      setIsLoading(false)
      return
    }

    if (!formData.noWhatsapp.trim()) {
      setError("Please enter WhatsApp number")
      setIsLoading(false)
      return
    }

    // Validate WhatsApp number format (Indonesian format: 08xxx or 62xxx)
    const whatsappRegex = /^(08\d{8,11}|62\d{8,11})$/
    if (!whatsappRegex.test(formData.noWhatsapp.replace(/[\s-]/g, ''))) {
      setError("Please enter a valid WhatsApp number (e.g., 08123456789 or 628123456789)")
      setIsLoading(false)
      return
    }

    const pricing = await calculatePrice()

    try {
      // Create a single booking with multiple time slots
      const allSelectedSlots = getAllSelectedSlots()
      const timeSlotsForApi = allSelectedSlots.map(({ date, slots }) =>
        slots.map(slot => ({ date, slot }))
      ).flat()

      const response = await fetch("/api/bookings/multi-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldId,
          timeSlots: timeSlotsForApi,
          paymentType: formData.paymentType,
          namaTim: formData.namaTim,
          noWhatsapp: formData.noWhatsapp
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create booking")
        setIsLoading(false)
        return
      }

      // Store the selected slots before clearing
      const currentSelectedSlots = getAllSelectedSlots()

      // Create booking data for the payment page
      const bookingData = {
        bookingId: data.booking?.bookings?.[0]?.id || 'unknown',
        fieldName: fieldName,
        timeSlots: currentSelectedSlots.map(({ date, slots }) =>
          slots.map(slot => ({ date, slot }))
        ).flat(),
        totalAmount: data.booking?.totalAmount || 0,
        amountPaid: data.booking?.amountPaid || 0,
        paymentType: data.booking?.paymentType || 'FULL',
        slotCount: data.booking?.slotCount || 0,
        namaTim: formData.namaTim,
        noWhatsapp: formData.noWhatsapp
      }

      // Encode booking data for URL
      const encodedBookingData = btoa(JSON.stringify(bookingData))

      // Clear all selected slots after successful booking
      clearAllSlots()

      // Redirect to payment page
      router.push(`/bookings/payment?booking=${encodedBookingData}`)
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    calculatePrice().then(setPricing)
  }, [formData.date, selectedSlotsByDate, formData.paymentType])

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="namaTim">Nama Tim</Label>
            <Input
              id="namaTim"
              type="text"
              placeholder="Masukkan nama tim"
              value={formData.namaTim}
              onChange={(e) => handleInputChange("namaTim", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="noWhatsapp">No. WhatsApp</Label>
            <Input
              id="noWhatsapp"
              type="text"
              placeholder="Contoh: 08123456789"
              value={formData.noWhatsapp}
              onChange={(e) => handleInputChange("noWhatsapp", e.target.value)}
              required
            />
          </div>
        </div>

        {formData.date && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Cara memesan:</span>
              </div>
              <ol className="text-xs text-blue-800 space-y-1 ml-6">
                <li>1. Pilih tanggal yang diinginkan</li>
                <li>2. Klik pada beberapa slot waktu yang tersedia (hijau)</li>
                <li>3. Pilih jenis pembayaran dan pesan semua slot yang dipilih</li>
              </ol>
            </div>

            {/* Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTimeSlots.map((slot) => {
                const isBooked = isSlotBooked(slot.jam)
                const isPassed = isTimePassed(slot.jam)
                const isSelected = getCurrentDateSlots(formData.date).includes(slot.jam)
                const canSelect = !isBooked && !isPassed

                return (
                  <button
                    key={slot.jam}
                    type="button"
                    onClick={() => canSelect && toggleTimeSlot(slot.jam)}
                    disabled={isBooked || isPassed}
                    className={`p-4 rounded-lg border text-left transition-all min-h-[100px] ${
                      isBooked
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        : isPassed
                          ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          : isSelected
                            ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                            : session
                              ? 'border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                              : 'border-dashed border-gray-300 bg-white hover:border-blue-50 hover:border-blue-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">{slot.jam}</span>
                        </div>
                        <div className="text-xs font-semibold text-green-600">
                          {formatRupiah(slot.harga)}
                        </div>
                      </div>

                      {isBooked ? (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600">Tidak Tersedia</span>
                        </div>
                      ) : isPassed ? (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-sm font-medium text-red-600">Terlewat</span>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-1">
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span className="text-xs text-emerald-600">Dipilih</span>
                            </>
                          ) : session ? (
                            <>
                              <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                              <span className="text-xs text-gray-500">Tersedia</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-600">Masuk untuk pesan</span>
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
            {getTotalSlotCount() > 0 && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-emerald-900">
                    Slot Waktu yang Dipilih:
                  </span>
                  <button
                    onClick={() => clearAllSlots()}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Hapus Semua
                  </button>
                </div>
                <div className="space-y-2 mb-3">
                  {getAllSelectedSlots().map(({ date, slots }) => (
                    <div key={date} className="bg-white p-2 rounded border">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {format(new Date(date), 'EEEE, d MMMM yyyy')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {slots.map(slot => (
                          <Badge key={slot} variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-emerald-700 font-medium">
                  Total Slots: {getTotalSlotCount()} slot
                </div>
              </div>
            )}
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
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || getTotalSlotCount() === 0}
        >
          {isLoading ? "Creating Booking..." : "Book Now"}
        </Button>
      </form>
    </>
  )
}