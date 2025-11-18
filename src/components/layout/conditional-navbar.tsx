"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navigation/navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // Don't render navbar for admin routes and auth pages
  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null
  }

  return <Navbar />
}