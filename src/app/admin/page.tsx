"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import EnhancedDashboardContent from "@/components/admin/enhanced-dashboard-content"
import AdminSkeleton from "@/components/admin/admin-skeleton"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect unauthenticated users immediately
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Show skeleton while session is loading
  if (status === "loading") {
    return <AdminSkeleton />
  }

  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EnhancedDashboardContent />
    </Suspense>
  )
}