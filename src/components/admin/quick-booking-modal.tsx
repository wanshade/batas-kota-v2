"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon, Clock, User, Phone, Mail, DollarSign } from "lucide-react"
import { formatRupiah } from "@/lib/currency"

interface QuickBookingModalProps {
  isOpen: boolean
  onClose: () => void
  fieldId: string
  fieldName: string
  fieldPricePerHour: number
  selectedDate: string
  selectedTime: string
  onSuccess: () => void
}

export default function QuickBookingModal({
  isOpen,
  onClose,
  fieldId,
  fieldName,
  fieldPricePerHour,
  selectedDate,
  selectedTime,
  onSuccess
}: QuickBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    duration: "2", // Default 2 hours (matching slot grid)
    paymentType: "FULL",
    notes: ""
  })

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return "00:00"
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = hours + duration
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const calculateTotal = () => {
    const duration = parseInt(formData.duration)
    return fieldPricePerHour * duration
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const startTime = selectedTime
      const endTime = calculateEndTime(selectedTime, parseInt(formData.duration))

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fieldId,
          date: selectedDate,
          startTime,
          endTime,
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim() || undefined,
          customerPhone: formData.customerPhone.trim() || undefined,
          paymentType: formData.paymentType,
          notes: formData.notes.trim() || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      onSuccess()
      onClose()

      // Reset form
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        duration: "2",
        paymentType: "FULL",
        notes: ""
      })

    } catch (error) {
      console.error('Booking error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const endTime = selectedTime ? calculateEndTime(selectedTime, parseInt(formData.duration)) : "00:00"

  // Don't render the modal if we don't have the required data
  if (!selectedTime || !selectedDate) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-green-600" />
            Quick Booking - {fieldName}
          </DialogTitle>
          <DialogDescription>
            Create an instant booking for walk-in customers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span>{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{selectedTime} - {endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{formData.duration} hour(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Total:</span>
                <span className="font-bold text-green-600">{formatRupiah(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Customer Information</h3>

            <div>
              <Label htmlFor="customerName">Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email (optional)"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Booking Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Booking Options</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="4">4 Hours</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select value={formData.paymentType} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">Full Payment</SelectItem>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special notes or requirements"
                rows={2}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}