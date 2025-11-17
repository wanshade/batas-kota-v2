import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import HourlyBookingGrid from "@/components/hourly-booking-grid"
import { formatRupiah } from "@/lib/currency"
import { db, fields, bookings, users, bookingStatusEnum } from "@/db"
import { eq, and, asc, inArray } from "drizzle-orm"

async function getField(id: string) {
  // Get field details
  const fieldResults = await db
    .select()
    .from(fields)
    .where(eq(fields.id, id))
    .limit(1)

  if (!fieldResults || fieldResults.length === 0) {
    notFound()
  }

  const field = fieldResults[0]

  // Get bookings with user data for this field
  const fieldBookings = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      amountPaid: bookings.amountPaid,
      user: {
        name: users.name,
        email: users.email
      }
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(
      and(
        eq(bookings.fieldId, id),
        inArray(bookings.status, ['PENDING', 'APPROVED'])
      )
    )
    .orderBy(asc(bookings.startTime))

  // Transform the data to match the expected interface
  const transformedBookings = fieldBookings.map(booking => ({
    id: booking.id,
    status: booking.status as string, // Cast to string since we filtered out nulls
    startTime: booking.startTime,
    endTime: booking.endTime,
    user: booking.user
  }))

  return {
    ...field,
    bookings: transformedBookings
  }
}

export default async function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const field = await getField(id)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/fields" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        ← Back to Fields
      </Link>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="p-0">
            {field.imageUrl && (
              <div className="aspect-video bg-gray-200 rounded-t-lg">
                <img
                  src={field.imageUrl}
                  alt={field.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="mb-4 text-2xl">{field.name}</CardTitle>
            <CardDescription className="text-lg mb-6">
              {field.description || "Professional mini soccer field with quality turf, lighting, and facilities. Perfect for training sessions and friendly matches."}
            </CardDescription>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Price per hour</div>
                <div className="text-2xl font-bold text-green-600">{formatRupiah(field.pricePerHour)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Field type</div>
                <div className="text-lg font-semibold">Mini Soccer</div>
              </div>
            </div>

            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold mb-3">Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>• Professional turf</div>
                <div>• Flood lighting</div>
                <div>• Changing rooms</div>
                <div>• Parking available</div>
                <div>• Water fountain</div>
                <div>• First aid kit</div>
              </div>
            </div>

            <div className="border-t pt-8 mt-8">
              <HourlyBookingGrid
                fieldId={field.id}
                fieldName={field.name}
                pricePerHour={field.pricePerHour}
                existingBookings={field.bookings}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}