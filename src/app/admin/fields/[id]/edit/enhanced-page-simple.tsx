"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminLayout from "@/components/admin/admin-layout"
import ImageUpload from "@/components/image-upload"
import { formatRupiah } from "@/lib/currency"
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  Loader2,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  TrendingUp,
  Wifi,
  Car,
  Shield,
  Sun,
  Users,
  Camera,
  Info,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react"

interface Field {
  id: string
  name: string
  description?: string
  pricePerHour: number
  imageUrl?: string
  surfaceType?: string
  dimensions?: string
  capacity?: number
  amenities?: string[]
  isActive?: boolean
  featured?: boolean
  _count: {
    bookings: number
  }
  revenue?: number
  utilizationRate?: number
}

interface Context7Insight {
  type: 'pricing' | 'optimization' | 'maintenance' | 'market'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation?: string
}

export default function EnhancedFieldEditPageSimple() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [field, setField] = useState<Field | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [context7Insights, setContext7Insights] = useState<Context7Insight[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    peakHourPrice: "",
    weekendPrice: "",
    imageUrl: "",
    surfaceType: "natural-grass",
    dimensions: "",
    capacity: "",
    amenities: [] as string[],
    isActive: true,
    featured: false,
  })

  useEffect(() => {
    if (!params.id) return
    fetchField()
    fetchContext7Insights()
  }, [params.id])

  const fetchField = async () => {
    try {
      const response = await fetch(`/api/fields/${params.id}`)
      const data = await response.json()

      if (response.ok && data.field) {
        setField(data.field)
        setFormData({
          name: data.field.name,
          description: data.field.description || "",
          pricePerHour: data.field.pricePerHour.toString(),
          peakHourPrice: data.field.peakHourPrice?.toString() || "",
          weekendPrice: data.field.weekendPrice?.toString() || "",
          imageUrl: data.field.imageUrl || "",
          surfaceType: data.field.surfaceType || "natural-grass",
          dimensions: data.field.dimensions || "",
          capacity: data.field.capacity?.toString() || "10",
          amenities: data.field.amenities || [],
          isActive: data.field.isActive ?? true,
          featured: data.field.featured ?? false,
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

  const fetchContext7Insights = async () => {
    // Simulated Context7 insights
    const insights: Context7Insight[] = [
      {
        type: 'pricing',
        title: 'Optimize Peak Hour Pricing',
        description: 'Fields with similar capacity in your area charge 15-20% more during peak hours',
        impact: 'high',
        actionable: true,
        recommendation: 'Consider setting peak hour price 1.5x base rate'
      },
      {
        type: 'optimization',
        title: 'Improve Weekend Utilization',
        description: 'Your weekend utilization is 35% below industry average',
        impact: 'medium',
        actionable: true,
        recommendation: 'Add weekend promotions or family packages'
      },
    ]
    setContext7Insights(insights)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    setError("")
    setSuccess("")
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("")
    setSuccess("")
  }

  const handleImageUpload = useCallback((imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }))
    setUploadProgress(100)
    setTimeout(() => setUploadProgress(0), 2000)
  }, [])

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        pricePerHour: parseInt(formData.pricePerHour),
        peakHourPrice: formData.peakHourPrice ? parseInt(formData.peakHourPrice) : undefined,
        weekendPrice: formData.weekendPrice ? parseInt(formData.weekendPrice) : undefined,
        imageUrl: formData.imageUrl,
        surfaceType: formData.surfaceType,
        dimensions: formData.dimensions,
        capacity: parseInt(formData.capacity),
        amenities: formData.amenities,
        isActive: formData.isActive,
        featured: formData.featured,
      }

      const response = await fetch(`/api/fields/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Field updated successfully!")
        setField(result.field)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error || "Failed to update field")
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

      if (response.ok) {
        router.push("/admin/fields?message=Field deleted successfully")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete field")
      }
    } catch (error) {
      console.error("Failed to delete field:", error)
      setError("Failed to delete field")
    }
  }

  const getInsightIcon = (type: string) => {
    const icons = {
      pricing: <DollarSign className="w-5 h-5" />,
      optimization: <TrendingUp className="w-5 h-5" />,
      maintenance: <Settings className="w-5 h-5" />,
      market: <Activity className="w-5 h-5" />,
    }
    return icons[type as keyof typeof icons] || <Info className="w-5 h-5" />
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return colors[impact as keyof typeof colors] || colors.low
  }

  if (isLoading) {
    return (
      <AdminLayout title="Loading Field..." description="Please wait while we load the field details.">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!field) {
    return (
      <AdminLayout title="Field Not Found" description="The field you're looking for doesn't exist.">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Field not found</h3>
          <Button onClick={() => router.push("/admin/fields")}>
            Back to Fields
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={`Edit ${field.name}`}
      description="Update field settings, pricing, and availability"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/fields/${field.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={field._count.bookings > 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      {/* Status Messages */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Context7 Insights */}
      {context7Insights.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Activity className="w-5 h-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-blue-700">
              Recommendations to optimize your field performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {context7Insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge className={getImpactColor(insight.impact)} variant="outline">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-blue-700 font-medium">
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6 mt-6">
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
                        <Label htmlFor="surfaceType">Surface Type *</Label>
                        <Select
                          value={formData.surfaceType}
                          onValueChange={(value) => handleSelectChange("surfaceType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select surface type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="natural-grass">Natural Grass</SelectItem>
                            <SelectItem value="artificial-turf">Artificial Turf</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="indoor">Indoor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions *</Label>
                        <Input
                          id="dimensions"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          placeholder="e.g., 40m x 20m"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="capacity">Max Capacity *</Label>
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          placeholder="Maximum players"
                        />
                      </div>
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
                      />
                      <p className="text-sm text-gray-500">
                        {formData.description?.length || 0}/500 characters
                      </p>
                    </div>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pricePerHour">Base Price (IDR) *</Label>
                        <Input
                          id="pricePerHour"
                          name="pricePerHour"
                          type="number"
                          value={formData.pricePerHour}
                          onChange={handleInputChange}
                          placeholder="50000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="peakHourPrice">Peak Hour Price (IDR)</Label>
                        <Input
                          id="peakHourPrice"
                          name="peakHourPrice"
                          type="number"
                          value={formData.peakHourPrice}
                          onChange={handleInputChange}
                          placeholder="75000"
                        />
                        <p className="text-xs text-gray-500">17:00 - 21:00</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weekendPrice">Weekend Price (IDR)</Label>
                        <Input
                          id="weekendPrice"
                          name="weekendPrice"
                          type="number"
                          value={formData.weekendPrice}
                          onChange={handleInputChange}
                          placeholder="80000"
                        />
                        <p className="text-xs text-gray-500">Saturday & Sunday</p>
                      </div>
                    </div>

                    {/* Pricing Recommendations */}
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900">Pricing Recommendations</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Based on your field type and location:
                            </p>
                            <ul className="text-xs text-green-700 mt-2 space-y-1">
                              <li>• Peak hours: {formatRupiah(Math.round(parseInt(formData.pricePerHour) * 1.5))}</li>
                              <li>• Weekends: {formatRupiah(Math.round(parseInt(formData.pricePerHour) * 1.6))}</li>
                              <li>• Off-peak discount: 15-20% for weekday mornings</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Amenities Tab */}
                  <TabsContent value="amenities" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Available Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { id: 'wifi', label: 'WiFi', icon: '📶' },
                          { id: 'parking', label: 'Parking', icon: '🚗' },
                          { id: 'lighting', label: 'Lighting', icon: '💡' },
                          { id: 'showers', label: 'Showers', icon: '🚿' },
                          { id: 'camera', label: 'Security Camera', icon: '📹' },
                          { id: 'security', label: 'Security Guard', icon: '👮' },
                          { id: 'bleachers', label: 'Bleachers', icon: '👥' },
                          { id: 'water', label: 'Water Fountain', icon: '💧' },
                          { id: 'firstaid', label: 'First Aid Kit', icon: '🏥' },
                        ].map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              id={amenity.id}
                              checked={formData.amenities?.includes(amenity.id)}
                              onChange={() => handleAmenityToggle(amenity.id)}
                              className="rounded"
                            />
                            <Label htmlFor={amenity.id} className="flex items-center gap-2 cursor-pointer">
                              <span className="text-lg">{amenity.icon}</span>
                              <span>{amenity.label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Field Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Field Active</Label>
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => handleSelectChange("isActive", checked.toString())}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Featured Field</Label>
                            <Switch
                              checked={formData.featured}
                              onCheckedChange={(checked) => handleSelectChange("featured", checked.toString())}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Field Status</h3>
                        <Card className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Bookings</span>
                              <span className="font-medium">{field._count.bookings}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue</span>
                              <span className="font-medium">{formatRupiah(field.revenue || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Utilization Rate</span>
                              <span className="font-medium">{field.utilizationRate || 0}%</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Image Upload */}
                <div className="space-y-4">
                  <Label>Field Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <ImageUpload
                      onUpload={handleImageUpload}
                      initialImage={formData.imageUrl}
                      accept="image/jpeg,image/png,image/webp"
                      maxSize={5 * 1024 * 1024}
                    />
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Upload Progress</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/fields")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {field.utilizationRate || 0}%
                </div>
                <p className="text-sm text-gray-600">Utilization Rate</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold">{field._count.bookings}</div>
                  <p className="text-xs text-gray-600">Total Bookings</p>
                </div>
                <div>
                  <div className="text-xl font-semibold">
                    {formatRupiah(field.revenue || 0)}
                  </div>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Warning */}
          {field._count.bookings > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Cannot Delete Field</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This field has {field._count.bookings} existing booking{field._count.bookings !== 1 ? 's' : ''}.
                      Delete all bookings first to enable deletion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}