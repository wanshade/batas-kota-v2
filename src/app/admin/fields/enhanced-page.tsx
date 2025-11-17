"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/admin-layout"
import { formatRupiah } from "@/lib/currency"
import {
  MapPin,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Image as ImageIcon
} from "lucide-react"

interface Field {
  id: string
  name: string
  description: string | null
  pricePerHour: number
  imageUrl: string | null
  createdAt: string
  bookingCount: number
  revenue: number
}

export default function EnhancedFieldsPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchFields = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch('/api/admin/fields')
      const data = await response.json()

      if (response.ok) {
        setFields(data.fields || [])
      } else {
        console.error("Failed to fetch fields:", data.error || 'Unknown error')
      }
    } catch (error) {
      console.error("Failed to fetch fields:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <AdminLayout
      title="Field Management"
      description="Manage your soccer field venues and pricing"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchFields(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/fields/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Field
            </Button>
          </Link>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fields</p>
                <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fields.reduce((sum, field) => sum + field.bookingCount, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fields.length > 0
                    ? formatRupiah(Math.round(fields.reduce((sum, field) => sum + field.pricePerHour, 0) / fields.length))
                    : formatRupiah(0)
                  }
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields Grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : fields.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No fields yet</h3>
          <p className="text-gray-500 mb-6">Add your first soccer field to get started</p>
          <Link href="/admin/fields/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Field
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card key={field.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Field Image */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {field.imageUrl ? (
                  <img
                    src={field.imageUrl}
                    alt={field.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.svg'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {field.bookingCount} bookings
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Field Name and Price */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                      {field.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{field.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatRupiah(field.pricePerHour)}</p>
                      <p className="text-xs text-gray-500">per hour</p>
                    </div>
                  </div>

                  {/* Field Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Bookings</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{field.bookingCount}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Revenue</span>
                      </div>
                      <p className="text-lg font-semibold text-green-900">{formatRupiah(field.revenue)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/admin/fields/${field.id}`} className="flex-1">
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/fields/${field.id}/edit`} className="flex-1">
                      <Button className="w-full flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}