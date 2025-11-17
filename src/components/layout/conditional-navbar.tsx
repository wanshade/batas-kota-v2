"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navigation/navbar"

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // Don't render navbar for admin routes
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return <Navbar />
}