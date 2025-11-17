"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, ArrowLeft, Trash2, Eye } from "lucide-react"
import ImageUpload from "@/components/image-upload"

interface Field {
  id: string
  name: string
  description?: string
  pricePerHour: number
  imageUrl?: string
  _count: {
    bookings: number
  }
}

export default function EditFieldPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [field, setField] = useState<Field | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    imageUrl: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    if (status === "authenticated" && params.id) {
      fetchField()
    }
  }, [status, session, router, params.id])

  const fetchField = async () => {
    try {
      const response = await fetch(`/api/fields/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setField(data.field)
        setFormData({
          name: data.field.name,
          description: data.field.description || "",
          pricePerHour: data.field.pricePerHour.toString(),
          imageUrl: data.field.imageUrl || ""
        })
      } else {
        setError(data.error || "Failed to fetch field")
      }
    } catch (error) {
      console.error("Failed to fetch field:", error)
      setError("Failed to fetch field")
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
    // Clear messages when user starts typing
    setError("")
    setSuccess("")
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }))
    setError("")
    setSuccess("")
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
          name: formData.name,
          description: formData.description,
          pricePerHour: parseInt(formData.pricePerHour),
          imageUrl: formData.imageUrl
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Field updated successfully!")
        setField(data.field)
      } else {
        setError(data.error || "Failed to update field")
      }
    } catch (error) {
      console.error("Failed to update field:", error)
      setError("Failed to update field")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!field) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${field.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/fields/${params.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/fields?message=Field deleted successfully")
      } else {
        setError(data.error || "Failed to delete field")
      }
    } catch (error) {
      console.error("Failed to delete field:", error)
      setError("Failed to delete field")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading field details...</span>
        </div>
      </div>
    )
  }

  if (!field) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Field not found</h2>
          <p className="text-gray-600 mb-6">The field you're looking for doesn't exist.</p>
          <Link href="/admin/fields">
            <Button>Back to Fields</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fields"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fields
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Field</h1>
            <p className="text-gray-600">Update field information and pricing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/fields/${field.id}`}>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Field
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={field._count.bookings > 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Field Information</CardTitle>
              <CardDescription>
                Update the basic information about this soccer field
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Field Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter field name"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the field, facilities, and features"
                    rows={4}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Price per Hour ($) *</Label>
                  <Input
                    id="pricePerHour"
                    name="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="1"
                    step="1"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Link href="/admin/fields">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Field Image */}
          <Card>
            <CardHeader>
              <CardTitle>Field Image</CardTitle>
              <CardDescription>
                Upload a high-quality image of the soccer field
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={handleImageUpload}
                initialImage={formData.imageUrl}
                placeholder="Upload field image"
                accept="image/jpeg,image/png,image/webp"
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={isSaving}
              />
            </CardContent>
          </Card>

          {/* Field Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Field Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-medium">{field._count.bookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Field ID</span>
                <span className="font-mono text-xs">{field.id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {field._count.bookings > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">⚠️ Delete Warning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  This field has {field._count.bookings} booking{field._count.bookings !== 1 ? 's' : ''}.
                  You cannot delete a field with existing bookings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}