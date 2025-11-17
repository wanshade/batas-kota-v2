import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db, users, bookings } from "@/db"
import { eq, desc, count, sql, and, or, ilike } from "drizzle-orm"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const whereConditions: any[] = []

    if (role && role !== 'ALL') {
      whereConditions.push(eq(users.role, role as any))
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      )
    }

    // Get users with pagination and optimized query
    const usersQuery = db
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
      .orderBy(desc(users.createdAt), users.name)
      .limit(limit)
      .offset(skip)

    if (whereConditions.length > 0) {
      usersQuery.where(and(...whereConditions))
    }

    const [usersData, totalCountResult, roleCountsResult] = await Promise.all([
      usersQuery,
      db
        .select({ count: count() })
        .from(users)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
      db
        .select({
          role: users.role,
          count: count(),
        })
        .from(users)
        .groupBy(users.role)
    ])

    const totalCount = totalCountResult[0].count

    return NextResponse.json({
      users: usersData.map(user => ({
        ...user,
        _count: {
          bookings: user.bookingCount
        }
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      },
      roleCounts: roleCountsResult.reduce((acc, curr) => {
        if (curr.role) {
          acc[curr.role] = curr.count
        }
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, role" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash,
        role: role as 'USER' | 'ADMIN'
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Admin user creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}