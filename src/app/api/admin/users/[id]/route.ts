import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, users, bookings } from "@/db"
import { eq, count, and } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        bookingCount: count(bookings.id),
      })
      .from(users)
      .leftJoin(bookings, eq(users.id, bookings.userId))
      .groupBy(users.id, users.name, users.email, users.role, users.createdAt)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        _count: {
          bookings: user.bookingCount
        }
      }
    })
  } catch (error) {
    console.error("Admin user fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, role } = body

    const { id } = await params

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const [emailTaken] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Admin user update error:", error)
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

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user exists and get booking count
    const [existingUserWithBookings] = await db
      .select({
        id: users.id,
        role: users.role,
        bookingCount: count(bookings.id),
      })
      .from(users)
      .leftJoin(bookings, eq(users.id, bookings.userId))
      .groupBy(users.id, users.role)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUserWithBookings) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin
    if (existingUserWithBookings.role === 'ADMIN') {
      const [adminCount] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'ADMIN'))

      if (adminCount.count <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        )
      }
    }

    // Check if user has bookings
    if (existingUserWithBookings.bookingCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing bookings. Please delete or transfer their bookings first.",
          bookingCount: existingUserWithBookings.bookingCount
        },
        { status: 400 }
      )
    }

    // Delete user
    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUserId: id
    })
  } catch (error) {
    console.error("Admin user deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}