'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, MessageSquare, Activity, TrendingUp, CheckCircle } from "lucide-react"

interface AnalyticsStats {
    totalCompanies: number
    totalInterviews: number
    totalTemplates: number
    activeUsers: number
    systemUptime: number
    avgInterviewScore: number
    completionRate: number
    monthlyGrowth: {
        companies: number
        interviews: number
        users: number
    }
}interface AnalyticsStatsCardsProps {
    stats: AnalyticsStats
    isLoading: boolean
}

export const AnalyticsStatsCards = ({ stats, isLoading }: AnalyticsStatsCardsProps) => {
    const cards = [
        {
            title: "Total Companies",
            value: stats.totalCompanies,
            change: `+${stats.monthlyGrowth.companies}%`,
            icon: Building2,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Total Interviews",
            value: stats.totalInterviews,
            change: `+${stats.monthlyGrowth.interviews}%`,
            icon: MessageSquare,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Total Templates",
            value: stats.totalTemplates,
            change: "Active templates",
            icon: CheckCircle,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
        },
        {
            title: "Active Users",
            value: stats.activeUsers,
            change: `+${stats.monthlyGrowth.users}%`,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "System Uptime",
            value: `${stats.systemUptime}%`,
            change: "Excellent",
            icon: Activity,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "Avg Score",
            value: stats.avgInterviewScore,
            change: "Above average",
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="border-border/50">
                        <CardHeader>
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">
                            {card.value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-600 font-medium">{card.change}</span> this month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
