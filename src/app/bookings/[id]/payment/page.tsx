"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import FilePreviewUpload from "@/components/file-preview-upload"
import { formatRupiah } from "@/lib/currency"

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

export default function PaymentProofPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && params.id) {
      fetchBooking()
    }
  }, [status, router, params.id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setBooking(data.booking)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
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

      setBooking(prev => prev ? { ...prev, proofImageUrl: uploadData.url } : null)
      setUploadSuccess(true)
    } finally {
      setIsUploading(false)
    }
  }

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

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Payment Proof Uploaded!</CardTitle>
            <CardDescription>
              Your payment proof has been successfully submitted and is now under review.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Payment Proof</CardTitle>
          <CardDescription>
            Please upload a screenshot or photo of your payment confirmation to complete your booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{booking.field.name}</h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div>
                Date: {format(new Date(booking.startTime), "MMMM d, yyyy")}
              </div>
              <div>
                Time: {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
              </div>
              <div>
                Duration: {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60))} hours
              </div>
              <div>
                Payment Type: {booking.paymentType === "DEPOSIT" ? "Deposit" : "Full Payment"}
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium">Amount Paid: </span>
              <span className="text-green-600 font-bold">{formatRupiah(booking.amountPaid)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Payment Proof Image</h4>
              <FilePreviewUpload
                onUpload={handleFileUpload}
                placeholder="Click to upload payment proof"
                className="w-full"
                accept="image/jpeg,image/png,image/webp,image/gif"
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={isUploading}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Upload Guidelines:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload a clear screenshot or photo of your payment confirmation</li>
                <li>• Make sure the payment amount and transaction details are visible</li>
                <li>• Accepted formats: JPEG, PNG, WebP, GIF</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Your booking will be reviewed after upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {isUploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading payment proof...</p>
        </div>
      )}
    </div>
  )
}