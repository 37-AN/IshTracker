'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface AnalyticsDashboardProps {
  stats?: {
    total: number
    open: number
    resolved: number
    aiAccuracy: number
  }
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const defaultStats = {
    total: 0,
    open: 0,
    resolved: 0,
    aiAccuracy: 87
  }

  const currentStats = stats || defaultStats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">AI Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.aiAccuracy}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Issue resolved</p>
              <p className="text-xs text-neutral-500">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">AI resolution generated</p>
              <p className="text-xs text-neutral-500">15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">New issue created</p>
              <p className="text-xs text-neutral-500">1 hour ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
