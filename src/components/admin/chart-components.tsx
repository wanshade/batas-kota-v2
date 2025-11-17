"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  DollarSign
} from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  iconBg,
  iconColor
}: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> :
                 trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProgressMetricProps {
  title: string
  value: number
  max: number
  label: string
  color?: string
}

export function ProgressMetric({ title, value, max, label, color = "bg-blue-500" }: ProgressMetricProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {value} of {max} total
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatusBreakdownProps {
  data: Record<string, number>
  total: number
  title: string
}

export function StatusBreakdown({ data, total, title }: StatusBreakdownProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Activity className="w-4 h-4" />
      case 'pending':
        return <Calendar className="w-4 h-4" />
      case 'rejected':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>Total: {total}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data).map(([status, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                    <span className="ml-1">{status}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{count}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface SimpleBarProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
}

export function SimpleBarChart({ title, data, maxValue }: SimpleBarProps) {
  const max = maxValue || Math.max(...data.map(d => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = max > 0 ? (item.value / max) * 100 : 0
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.color || 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}