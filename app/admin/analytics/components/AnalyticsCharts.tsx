'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, LineChart, PieChart, Activity } from "lucide-react"

interface AnalyticsStats {
    totalCompanies: number
    totalInterviews: number
    activeUsers: number
    systemUptime: number
    avgInterviewScore: number
    completionRate: number
    monthlyGrowth: {
        companies: number
        interviews: number
        users: number
    }
}

interface AnalyticsChartsProps {
    stats: AnalyticsStats
    isLoading: boolean
}

export const AnalyticsCharts = ({ stats, isLoading }: AnalyticsChartsProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                    <Card key={index} className="border-border/50">
                        <CardHeader>
                            <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Chart Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Interview Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-center space-x-2">
                            {/* Mock Chart Bars */}
                            <div className="flex items-end space-x-2 h-full">
                                <div className="w-8 bg-blue-200 rounded-t" style={{ height: '60%' }} />
                                <div className="w-8 bg-blue-300 rounded-t" style={{ height: '75%' }} />
                                <div className="w-8 bg-blue-400 rounded-t" style={{ height: '90%' }} />
                                <div className="w-8 bg-blue-500 rounded-t" style={{ height: '100%' }} />
                                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '85%' }} />
                                <div className="w-8 bg-blue-700 rounded-t" style={{ height: '95%' }} />
                            </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            Monthly interview volume: {stats.totalInterviews} total
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-green-600" />
                            Company Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center">
                            {/* Mock Line Chart */}
                            <div className="w-full h-32 relative">
                                <svg className="w-full h-full" viewBox="0 0 300 100">
                                    <polyline
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        points="0,80 50,65 100,45 150,30 200,25 250,20 300,15"
                                    />
                                    <circle cx="0" cy="80" r="3" fill="#10b981" />
                                    <circle cx="50" cy="65" r="3" fill="#10b981" />
                                    <circle cx="100" cy="45" r="3" fill="#10b981" />
                                    <circle cx="150" cy="30" r="3" fill="#10b981" />
                                    <circle cx="200" cy="25" r="3" fill="#10b981" />
                                    <circle cx="250" cy="20" r="3" fill="#10b981" />
                                    <circle cx="300" cy="15" r="3" fill="#10b981" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            Total companies: {stats.totalCompanies} (+{stats.monthlyGrowth.companies}% this month)
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-purple-600" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center">
                            {/* Mock Pie Chart */}
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#8b5cf6"
                                        strokeWidth="2"
                                        strokeDasharray={`${stats.completionRate}, 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-semibold">{stats.completionRate}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            Completion rate with avg score: {stats.avgInterviewScore}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-orange-600" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex flex-col justify-center space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Uptime</span>
                                    <span className="text-sm font-bold text-emerald-600">{stats.systemUptime}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{ width: `${stats.systemUptime}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Active Users</span>
                                    <span className="text-sm font-bold text-blue-600">{stats.activeUsers}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(stats.activeUsers / 2, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            System running smoothly with {stats.activeUsers} active users
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}