import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    Clock,
    Calendar,
    Eye,
    TrendingUp,
    BarChart3
} from "lucide-react"

export function DashboardRecentResults() {
    const router = useRouter()
    const { results, isLoading } = useStudentResults()

    // Get only the 3 most recent results for dashboard
    const recentResults = results.slice(0, 3)

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        return `${minutes}m`
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            completed: "bg-green-500/20 text-green-400 border-green-500/30",
            "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            abandoned: "bg-red-500/20 text-red-400 border-red-500/30"
        }
        const className = variants[status] || variants.completed

        return (
            <Badge className={className}>
                {status === 'completed' ? 'Done' : status === 'in-progress' ? 'Active' : 'Stopped'}
            </Badge>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400"
        if (score >= 75) return "text-blue-400"
        if (score >= 60) return "text-yellow-400"
        return "text-red-400"
    }

    if (isLoading) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Recent Practice Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Practice Results</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/student/results')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    View All
                </Button>
            </CardHeader>
            <CardContent>
                {recentResults.length > 0 ? (
                    <div className="space-y-4">
                        {recentResults.map((result) => (
                            <div
                                key={result.sessionId}
                                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/student/results/${result.sessionId}`)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-white truncate">
                                            {result.templateName}
                                        </h4>
                                        {getStatusBadge(result.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(result.startedAt)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDuration(result.duration)}
                                        </span>
                                    </div>
                                </div>
                                {result.score !== undefined && (
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                                            {result.score}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No practice results yet</p>
                        <Button
                            size="sm"
                            onClick={() => router.push('/student/practice')}
                            className="mt-2 bg-gradient-to-r from-emerald-600 to-blue-600"
                        >
                            Start Practicing
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}