"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import FilePreviewUpload from "@/components/file-preview-upload"
import { formatRupiah } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign, Upload, CheckCircle } from "lucide-react"

interface Booking {
  id: string
  status: string
  startTime: string
  endTime: string
  amountPaid: number
  paymentType: string
  proofImageUrl?: string
  createdAt: string
  field: {
    id: string
    name: string
    imageUrl?: string
    pricePerHour: number
  }
}

interface PaymentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  onSuccess?: () => void
}

export default function PaymentUploadModal({ isOpen, onClose, booking, onSuccess }: PaymentUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!booking) throw new Error("No booking found")

    setIsUploading(true)

    try {
      // First upload the file to get the URL
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Failed to upload file")
      }

      // Then update the booking with the image URL
      const updateResponse = await fetch(`/api/bookings/${booking.id}/payment-proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proofImageUrl: uploadData.url }),
      })

      const updateData = await updateResponse.json()

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update payment proof")
      }

      setUploadSuccess(true)
      setTimeout(() => {
        setUploadSuccess(false)
        onClose()
        onSuccess?.()
      }, 2000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading && !uploadSuccess) {
      onClose()
    }
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {uploadSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              Payment Proof Uploaded!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-6">
              Your payment proof has been successfully submitted and is now under review.
            </DialogDescription>
            <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
              Got it
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Upload Payment Proof
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Please upload a screenshot or photo of your payment confirmation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{booking.field.name}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="text-gray-900 font-medium">Date</div>
                      <div>{format(new Date(booking.startTime), "MMM d, yyyy")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div>
                      <div className="text-gray-900 font-medium">Time</div>
                      <div>{format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {booking.paymentType === "DEPOSIT" ? "Deposit" : "Full Payment"}
                    </span>
                    <div className="text-lg font-bold text-emerald-600">
                      {formatRupiah(booking.amountPaid)}
                    </div>
                  </div>
                  {booking.paymentType === "DEPOSIT" && (
                    <div className="text-xs text-gray-500 mt-1">
                      Remaining {formatRupiah(booking.field.pricePerHour * Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)) - booking.amountPaid)} on-site
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Payment Proof Image
                  </h4>
                  <FilePreviewUpload
                    onUpload={handleFileUpload}
                    placeholder="Click to upload payment proof"
                    className="w-full"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    maxSize={5 * 1024 * 1024} // 5MB
                    disabled={isUploading}
                  />
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Upload a clear screenshot or photo of your payment confirmation</li>
                    <li>• Make sure the payment amount and transaction details are visible</li>
                    <li>• Accepted formats: JPEG, PNG, WebP, GIF</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Your booking will be reviewed after upload</li>
                  </ul>
                </div>
              </div>

              {/* Loading State */}
              {isUploading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading payment proof...</p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}