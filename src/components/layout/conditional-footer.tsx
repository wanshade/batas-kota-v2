"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/navigation/footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Don't render footer for admin routes
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return <Footer />
}