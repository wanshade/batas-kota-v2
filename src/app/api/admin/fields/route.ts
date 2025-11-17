import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, fields, bookings } from "@/db"
import { eq, desc, count } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fieldsData = await db
      .select({
        id: fields.id,
        name: fields.name,
        description: fields.description,
        pricePerHour: fields.pricePerHour,
        imageUrl: fields.imageUrl,
        createdAt: fields.createdAt,
        bookingCount: count(bookings.id),
      })
      .from(fields)
      .leftJoin(bookings, eq(fields.id, bookings.fieldId))
      .groupBy(fields.id, fields.name, fields.description, fields.pricePerHour, fields.imageUrl, fields.createdAt)
      .orderBy(desc(fields.createdAt))

    return NextResponse.json({
      fields: fieldsData.map(field => ({
        ...field,
        _count: {
          bookings: field.bookingCount
        }
      }))
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error("Error fetching admin fields:", error)
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    )
  }
}