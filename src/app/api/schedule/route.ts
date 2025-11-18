import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "public", "jadwal.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Schedule file not found" },
        { status: 404 }
      )
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const scheduleData = JSON.parse(fileContent)

    return NextResponse.json({ schedule: scheduleData })
  } catch (error) {
    console.error("Error reading schedule:", error)
    return NextResponse.json(
      { error: "Failed to read schedule data" },
      { status: 500 }
    )
  }
}