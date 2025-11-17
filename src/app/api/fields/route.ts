import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, fields } from "@/db"
import { desc, eq } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    // Check if field with the same name already exists
    const [existingField] = await db
      .select()
      .from(fields)
      .where(eq(fields.name, name.trim()))
      .limit(1)

    if (existingField) {
      return NextResponse.json(
        { error: "A field with this name already exists" },
        { status: 409 }
      )
    }

    const [field] = await db
      .insert(fields)
      .values({
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description?.trim() || null,
        pricePerHour: parseInt(pricePerHour),
        imageUrl: imageUrl?.trim() || null,
      })
      .returning()

    return NextResponse.json({
      message: "Field created successfully",
      field
    }, { status: 201 })
  } catch (error) {
    console.error("Field creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Allow public access to view fields
    const fieldsList = await db
      .select({
        id: fields.id,
        name: fields.name,
        description: fields.description,
        pricePerHour: fields.pricePerHour,
        imageUrl: fields.imageUrl,
        createdAt: fields.createdAt,
      })
      .from(fields)
      .orderBy(desc(fields.createdAt))

    return NextResponse.json({ fields: fieldsList })
  } catch (error) {
    console.error("Fields fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}