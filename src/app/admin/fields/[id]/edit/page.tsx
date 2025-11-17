"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/admin-layout"
import ImageUpload from "@/components/image-upload"
import { formatRupiah } from "@/lib/currency"
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface Field {
  id: string
  name: string
  description?: string
  pricePerHour: number
  imageUrl?: string
  createdAt: string
  _count: {
    bookings: number
  }
}

export default function FieldEditPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [field, setField] = useState<Field | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    imageUrl: "",
  })

  useEffect(() => {
    fetchField()
  }, [params.id])

  const fetchField = async () => {
    try {
      const response = await fetch(`/api/fields/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Field not found")
        } else {
          setError("Failed to fetch field details")
        }
        return
      }

      const data = await response.json()
      const fieldData = data.field

      setField(fieldData)
      setFormData({
        name: fieldData.name || "",
        description: fieldData.description || "",
        pricePerHour: fieldData.pricePerHour?.toString() || "",
        imageUrl: fieldData.imageUrl || "",
      })
    } catch (error) {
      console.error("Error fetching field:", error)
      setError("Failed to fetch field details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/fields/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          pricePerHour: parseInt(formData.pricePerHour),
          imageUrl: formData.imageUrl.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update field")
      }

      setSuccess("Field updated successfully!")

      // Refresh field data
      await fetchField()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating field:", error)
      setError(error instanceof Error ? error.message : "Failed to update field")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!field) return

    const hasBookings = field._count.bookings > 0

    if (hasBookings) {
      setError("Cannot delete field with existing bookings")
      return
    }

    if (!confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/fields/${params.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete field")
      }

      router.push("/admin/fields")
    } catch (error) {
      console.error("Error deleting field:", error)
      setError(error instanceof Error ? error.message : "Failed to delete field")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout title="Edit Field">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!field && error) {
    return (
      <AdminLayout title="Field Not Found">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/fields")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fields
          </Button>
        </div>
      </AdminLayout>
    )
  }

  if (!field) {
    return (
      <AdminLayout title="Field Not Found">
        <div className="flex items-center justify-center min-h-screen">
          <div>Field not found</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Edit ${field?.name || 'Field'}`}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/fields")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Edit Field</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={field._count.bookings > 0 ? "secondary" : "outline"}>
              {field._count.bookings} bookings
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || field._count.bookings > 0}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Field Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Field Information
            </CardTitle>
            <CardDescription>
              Created on {new Date(field.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Current Price:</span>
                <span className="font-semibold">{formatRupiah(field.pricePerHour)}/hour</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Total Bookings:</span>
                <span className="font-semibold">{field._count.bookings}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Status:</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Field Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter field name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Price per Hour (IDR) *</Label>
                  <Input
                    id="pricePerHour"
                    name="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    placeholder="e.g., 100000"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Current: {formatRupiah(field.pricePerHour)}/hour
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the field, facilities, features, etc."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Field Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/field-image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Field preview"
                      className="h-32 w-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x200?text=Field+Image"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/fields")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}