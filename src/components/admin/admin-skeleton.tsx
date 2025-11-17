import { BarChart3 } from "lucide-react"

export default function AdminSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Batas Kota</h1>
              <p className="text-sm text-slate-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <nav className="flex-1 p-4 space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
            </div>
          ))}
        </nav>

        {/* User Badge Skeleton */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 h-auto rounded-lg">
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-20 mb-1 animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header Skeleton */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-16 mb-2 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 bg-slate-200 rounded w-40 animate-pulse" />
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse" />
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-28 mb-1 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-40 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-slate-200 rounded w-16 mb-1 animate-pulse ml-auto" />
                      <div className="h-3 bg-slate-200 rounded w-20 animate-pulse ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}