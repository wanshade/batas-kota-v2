import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TimeSlotBookingForm from "@/components/time-slot-booking-form";
import { formatRupiah } from "@/lib/currency";
import { db, fields, bookings, users, bookingStatusEnum } from "@/db";
import { eq, and, asc, inArray } from "drizzle-orm";

async function getField(id: string) {
  // Get field details
  const fieldResults = await db
    .select()
    .from(fields)
    .where(eq(fields.id, id))
    .limit(1);

  if (!fieldResults || fieldResults.length === 0) {
    notFound();
  }

  const field = fieldResults[0];

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
        email: users.email,
      },
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(
      and(
        eq(bookings.fieldId, id),
        inArray(bookings.status, ["PENDING", "APPROVED"])
      )
    )
    .orderBy(asc(bookings.startTime));

  // Transform the data to match the expected interface
  const transformedBookings = fieldBookings.map((booking) => ({
    id: booking.id,
    status: booking.status as string, // Cast to string since we filtered out nulls
    startTime: booking.startTime,
    endTime: booking.endTime,
    user: booking.user,
  }));

  return {
    ...field,
    bookings: transformedBookings,
  };
}

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const field = await getField(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          {field.imageUrl && (
            <div className="aspect-video bg-gray-200">
              <img
                src={field.imageUrl}
                alt={field.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6">
            <CardTitle className="mb-4 text-2xl">{field.name}</CardTitle>
            <CardDescription className="text-lg mb-6">
              {field.description ||
                "Lapangan mini soccer profesional dengan rumput berkualitas, pencahayaan, dan fasilitas lengkap. Sempurna untuk sesi latihan dan pertandingan persahabatan."}
            </CardDescription>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Sistem harga</div>
                <div className="text-lg font-semibold">Berdasarkan Jadwal</div>
                <div className="text-xs text-gray-500 mt-1">
                  Harga berbeda per slot waktu
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Tipe lapangan</div>
                <div className="text-lg font-semibold">Mini Soccer</div>
              </div>
            </div>

            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold mb-3">Fasilitas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>• Rumput profesional</div>
                <div>• Pencahayaan lampu</div>
                <div>• Ruang ganti</div>
                <div>• Area parkir</div>
                <div>• Air minum</div>
                <div>• P3K</div>
              </div>
            </div>

            <div className="border-t pt-8 mt-8">
              <TimeSlotBookingForm
                fieldId={field.id}
                fieldName={field.name}
                existingBookings={field.bookings}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
