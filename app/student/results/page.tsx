"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, BarChart3 } from "lucide-react"
import { useStudentResults } from "@/hooks/useStudentResults"
import { ResultsMetricsOverview } from "@/components/student/ResultsMetricsOverview"
import { ResultsMetricsList } from "@/components/student/ResultsMetricsList"
import { ResultsMetricsFilters } from "@/components/student/ResultsMetricsFilters"

export default function StudentResultsPage() {
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("recent")
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list")
    const router = useRouter()

    const {
        results,
        analytics,
        isLoading,
        error,
        refresh,
        filterResults
    } = useStudentResults()

    const handleFilterChange = async (status: string) => {
        setStatusFilter(status)
        await filterResults(status, sortBy)
    }

    const handleSortChange = async (sort: string) => {
        setSortBy(sort)
        await filterResults(statusFilter, sort)
    }

    const handleViewDetails = (sessionId: string) => {
        router.push(`/student/results/${sessionId}`)
    }

    const handleExportResults = (sessionId: string) => {
        // TODO: Implement export functionality
        console.log("Export results for session:", sessionId)
    }

    // Handle authentication error
    if (error === "unauthorized") {
        router.push('/student/login')
        return null
    }

    if (error && error !== "unauthorized") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">Error loading results</div>
                    <div className="text-slate-400 mb-4">{error}</div>
                    <Button onClick={refresh} className="bg-emerald-600 hover:bg-emerald-500">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/student/dashboard')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Practice Results</h1>
                            <p className="text-slate-400 mt-2">
                                Track your progress and analyze your performance
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                onClick={() => setViewMode("list")}
                                className="border-slate-700"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Sessions
                            </Button>
                            <Button
                                variant={viewMode === "analytics" ? "default" : "outline"}
                                onClick={() => setViewMode("analytics")}
                                className="border-slate-700"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content based on view mode */}
                {viewMode === "analytics" ? (
                    /* Analytics View */
                    analytics ? (
                        <ResultsMetricsOverview
                            analytics={analytics}
                            isLoading={isLoading}
                        />
                    ) : (
                        <div className="text-center text-slate-400 py-12">
                            Complete more sessions to see detailed analytics
                        </div>
                    )
                ) : (
                    /* Sessions List View */
                    <div className="space-y-6">
                        {/* Analytics Overview (condensed) */}
                        {analytics && (
                            <ResultsMetricsOverview
                                analytics={analytics}
                                isLoading={isLoading}
                            />
                        )}

                        {/* Filters */}
                        <ResultsMetricsFilters
                            statusFilter={statusFilter}
                            sortBy={sortBy}
                            onStatusChange={handleFilterChange}
                            onSortChange={handleSortChange}
                            onRefresh={refresh}
                            isLoading={isLoading}
                        />

                        {/* Results List */}
                        <ResultsMetricsList
                            results={results}
                            isLoading={isLoading}
                            onViewDetails={handleViewDetails}
                            onExportResults={handleExportResults}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}