"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, ArrowLeft, Plus } from "lucide-react"
import ImageUpload from "@/components/image-upload"

export default function NewFieldPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

    if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [status, session, router])

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
      const response = await fetch("/api/fields", {
        method: "POST",
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
        setSuccess("Field created successfully!")
        // Redirect to edit page after a short delay
        setTimeout(() => {
          router.push(`/admin/fields/${data.field.id}/edit?message=Field created successfully`)
        }, 1500)
      } else {
        setError(data.error || "Failed to create field")
      }
    } catch (error) {
      console.error("Failed to create field:", error)
      setError("Failed to create field")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/fields"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fields
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plus className="h-8 w-8" />
            Create New Field
          </h1>
          <p className="text-gray-600">Add a new soccer field to your facility</p>
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
                Enter the details for the new soccer field
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
                    placeholder="e.g., Field A, Professional Soccer Field"
                    required
                    disabled={isSaving}
                  />
                  <p className="text-sm text-gray-500">
                    Give this field a unique name that players will recognize
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the field, facilities, and features. For example: Professional mini soccer field with quality turf, LED lighting, changing rooms, and parking facilities."
                    rows={4}
                    disabled={isSaving}
                  />
                  <p className="text-sm text-gray-500">
                    Include details about field size, surface type, lighting, and available facilities
                  </p>
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
                  <p className="text-sm text-gray-500">
                    Set the hourly rental rate for this field
                  </p>
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
                        Creating Field...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Field
                      </>
                    )}
                  </Button>
                  <Link href="/admin/fields">
                    <Button type="button" variant="outline" disabled={isSaving}>
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
                Upload a high-quality photo of the soccer field
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={handleImageUpload}
                placeholder="Upload field image"
                accept="image/jpeg,image/png,image/webp"
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={isSaving}
              />
              <p className="text-sm text-gray-500 mt-2">
                Recommended: High-resolution photo showing the entire field
              </p>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">💡 Field Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Field Name:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use unique, descriptive names</li>
                  <li>• Include field size or type if helpful</li>
                  <li>• Examples: "Field A (5v5)", "Turf Field 1"</li>
                </ul>
              </div>

              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Description:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Mention field surface (grass, turf, etc.)</li>
                  <li>• Include available facilities</li>
                  <li>• Note any special features or equipment</li>
                </ul>
              </div>

              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Pricing:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Research local market rates</li>
                  <li>• Consider peak vs off-peak pricing</li>
                  <li>• Factor in maintenance costs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>📸 Photo Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Take photos during daylight</li>
                <li>• Show the entire field if possible</li>
                <li>• Include goal posts and markings</li>
                <li>• Highlight any special features</li>
                <li>• Ensure good lighting and clarity</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}