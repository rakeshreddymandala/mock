'use client'

import { AdminLayout } from "../components/AdminLayout"
import { AnalyticsStatsCards } from "./components/AnalyticsStatsCards"
import { AnalyticsCharts } from "./components/AnalyticsCharts"
import { useAnalyticsData } from "./hooks/useAnalyticsData"
import { Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/dateUtils"

export default function AdminAnalyticsPage() {
  const { stats, isLoading } = useAnalyticsData()

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Analytics Overview</h1>
            <p className="text-muted-foreground text-lg">Platform performance and usage metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="border-border/50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border/50">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {formatDate(new Date())}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-slide-up">
          <AnalyticsStatsCards stats={stats} isLoading={isLoading} />
        </div>

        {/* Charts */}
        <div className="animate-slide-up">
          <AnalyticsCharts stats={stats} isLoading={isLoading} />
        </div>
      </div>
    </AdminLayout>
  )
}