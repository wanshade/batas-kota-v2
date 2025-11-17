import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, fields, bookings } from "@/db"
import { eq, count } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get field details
    const fieldResults = await db
      .select({
        id: fields.id,
        name: fields.name,
        description: fields.description,
        pricePerHour: fields.pricePerHour,
        imageUrl: fields.imageUrl,
        createdAt: fields.createdAt,
      })
      .from(fields)
      .where(eq(fields.id, id))

    if (!fieldResults || fieldResults.length === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      )
    }

    const fieldRecord = fieldResults[0]

    // Get booking count separately
    const bookingCountResults = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.fieldId, id))

    const fieldWithCount = {
      ...fieldRecord,
      _count: {
        bookings: bookingCountResults[0]?.count || 0
      }
    }

    return NextResponse.json({ field: fieldWithCount })
  } catch (error) {
    console.error("Field fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    // Check if user is authenticated and is an admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { name, description, pricePerHour, imageUrl } = await request.json()

    if (!name || !pricePerHour) {
      return NextResponse.json(
        { error: "Name and price per hour are required" },
        { status: 400 }
      )
    }

    // Validate price is a positive number
    if (pricePerHour <= 0) {
      return NextResponse.json(
        { error: "Price per hour must be a positive number" },
        { status: 400 }
      )
    }

    const [field] = await db
      .update(fields)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        pricePerHour: parseInt(pricePerHour),
        imageUrl: imageUrl?.trim() || null,
      })
      .where(eq(fields.id, id))
      .returning()

    return NextResponse.json({
      message: "Field updated successfully",
      field
    })
  } catch (error) {
    console.error("Field update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    // Check if user is authenticated and is an admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    // Check if field has any bookings
    const [bookingCount] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.fieldId, id))

    if (bookingCount.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete field with existing bookings" },
        { status: 400 }
      )
    }

    await db.delete(fields).where(eq(fields.id, id))

    return NextResponse.json({
      message: "Field deleted successfully"
    })
  } catch (error) {
    console.error("Field deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}