import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    Target,
    Play,
    Clock,
    Award,
    TrendingUp,
    TrendingDown
} from "lucide-react"

export function DashboardMetricsSummary() {
    const { analytics, isLoading } = useStudentResults()

    if (isLoading || !analytics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-8 bg-slate-700 rounded w-12 mb-2"></div>
                            <div className="h-6 bg-slate-700 rounded w-16"></div>
                            <div className="h-4 bg-slate-700 rounded w-20"></div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        )
    }

    const getScoreTrend = () => {
        if (analytics.improvementTrend.length < 2) return null
        const recent = analytics.improvementTrend.slice(-2)
        const trend = recent[1] - recent[0]
        return trend > 0 ? "up" : trend < 0 ? "down" : "stable"
    }

    const scoreTrend = getScoreTrend()

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Target className="w-8 h-8 text-emerald-500" />
                        {scoreTrend && (
                            <div className={`flex items-center gap-1 ${scoreTrend === 'up' ? 'text-green-400' :
                                    scoreTrend === 'down' ? 'text-red-400' : 'text-slate-400'
                                }`}>
                                {scoreTrend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                    scoreTrend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {analytics.averageScore.toFixed(1)}%
                    </CardTitle>
                    <p className="text-slate-400 text-sm">Average Score</p>
                </CardHeader>
            </Card>

            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Play className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-slate-400">{analytics.completionRate}%</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {analytics.completedSessions}
                    </CardTitle>
                    <p className="text-slate-400 text-sm">Completed Sessions</p>
                </CardHeader>
            </Card>

            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {Math.round(analytics.timeSpent / 3600)}h
                    </CardTitle>
                    <p className="text-slate-400 text-sm">Practice Time</p>
                </CardHeader>
            </Card>

            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <Award className="w-8 h-8 text-yellow-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {analytics.streakDays}
                    </CardTitle>
                    <p className="text-slate-400 text-sm">Day Streak</p>
                </CardHeader>
            </Card>
        </div>
    )
}