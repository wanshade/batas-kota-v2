"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import AdminUserBadge from "@/components/admin/admin-user-badge"
import {
  BarChart3,
  Calendar,
  Users,
  Home,
  MapPin,
  TrendingUp,
  FileText
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

const navigationItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    title: "Fields",
    href: "/admin/fields",
    icon: MapPin,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  }
]

export default function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Batas Kota Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Batas Kota</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
                           (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                  <Icon />
                </div>
                <span className={`font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Admin User Badge */}
        <AdminUserBadge />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-lg text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}