import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Clock,
    Calendar,
    Play,
    Eye,
    Download,
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3
} from "lucide-react"
import type { ResultMetric } from "@/hooks/useStudentResults"

interface ResultsMetricsListProps {
    results: ResultMetric[]
    isLoading: boolean
    onViewDetails: (sessionId: string) => void
    onExportResults?: (sessionId: string) => void
}

export function ResultsMetricsList({
    results,
    isLoading,
    onViewDetails,
    onExportResults
}: ResultsMetricsListProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}m ${secs}s`
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
                {status.replace('-', ' ')}
            </Badge>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400"
        if (score >= 75) return "text-blue-400"
        if (score >= 60) return "text-yellow-400"
        return "text-red-400"
    }

    const getScoreIcon = (score: number) => {
        if (score >= 75) return <TrendingUp className="w-4 h-4 text-green-400" />
        if (score >= 60) return <Target className="w-4 h-4 text-yellow-400" />
        return <TrendingDown className="w-4 h-4 text-red-400" />
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl animate-pulse">
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                        <p className="text-slate-400 mb-4">
                            Complete some practice sessions to see your results here.
                        </p>
                        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500">
                            <Play className="w-4 h-4 mr-2" />
                            Start Practicing
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {results.map((result) => (
                <Card
                    key={result.sessionId}
                    className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300"
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {/* Left Section: Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-lg font-medium text-white truncate">
                                        {result.templateName}
                                    </h3>
                                    {getStatusBadge(result.status)}
                                    {result.score !== undefined && (
                                        <div className="flex items-center gap-1">
                                            {getScoreIcon(result.score)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(result.startedAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatDuration(result.duration)}
                                    </span>
                                    <span>
                                        {result.responses} responses
                                    </span>
                                    {result.completedAt && (
                                        <span className="text-green-400">
                                            Completed {formatDate(result.completedAt)}
                                        </span>
                                    )}
                                </div>

                                {/* Analysis Summary */}
                                {result.analysis?.aiMetrics && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-500">Correctness:</span>
                                                <span className="ml-1 text-white">
                                                    {result.analysis.aiMetrics.correctness}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Relevance:</span>
                                                <span className="ml-1 text-white">
                                                    {result.analysis.aiMetrics.relevance}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Confidence:</span>
                                                <span className="ml-1 text-white">
                                                    {result.analysis.aiMetrics.confidence}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Professional:</span>
                                                <span className="ml-1 text-white">
                                                    {result.analysis.aiMetrics.professionalism}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Complete:</span>
                                                <span className="ml-1 text-white">
                                                    {result.analysis.aiMetrics.completeness}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Section: Score & Actions */}
                            <div className="flex items-center gap-4">
                                {result.score !== undefined && (
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                            {result.score}%
                                        </div>
                                        <div className="text-xs text-slate-400">Final Score</div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                        onClick={() => onViewDetails(result.sessionId)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                    {result.status === "completed" && onExportResults && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                            onClick={() => onExportResults(result.sessionId)}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Export
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}