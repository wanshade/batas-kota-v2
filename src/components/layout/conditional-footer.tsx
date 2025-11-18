"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/navigation/footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Don't render footer for admin routes and auth pages
  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null
  }

  return <Footer />
}