import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, users, bookings } from "@/db"
import { eq, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin or the booking owner
    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    const isAdmin = currentUser?.role === "ADMIN"

    // Get the booking with proof image
    const whereConditions = [eq(bookings.id, id)]

    if (!isAdmin) {
      whereConditions.push(eq(bookings.userId, session.user.id))
    }

    const [booking] = await db
      .select({ proofImageUrl: bookings.proofImageUrl })
      .from(bookings)
      .where(and(...whereConditions))
      .limit(1)

    if (!booking || !booking.proofImageUrl) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      )
    }

    // Parse the data URL
    const dataUrl = booking.proofImageUrl
    const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/)

    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      )
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': 'inline; filename="payment-proof.png"',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("Payment proof display error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}