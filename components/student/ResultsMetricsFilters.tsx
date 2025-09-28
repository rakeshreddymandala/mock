import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Filter, SortAsc } from "lucide-react"

interface ResultsMetricsFiltersProps {
    statusFilter: string
    sortBy: string
    onStatusChange: (status: string) => void
    onSortChange: (sortBy: string) => void
    onRefresh: () => void
    isLoading: boolean
}

export function ResultsMetricsFilters({
    statusFilter,
    sortBy,
    onStatusChange,
    onSortChange,
    onRefresh,
    isLoading
}: ResultsMetricsFiltersProps) {
    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {/* Filters Section */}
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <Select value={statusFilter} onValueChange={onStatusChange}>
                                <SelectTrigger className="md:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sessions</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="abandoned">Abandoned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <SortAsc className="w-4 h-4 text-slate-400" />
                            <Select value={sortBy} onValueChange={onSortChange}>
                                <SelectTrigger className="md:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Most Recent</SelectItem>
                                    <SelectItem value="score">Highest Score</SelectItem>
                                    <SelectItem value="duration">Longest Duration</SelectItem>
                                    <SelectItem value="template">Template Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex gap-2">
                        <Button
                            onClick={onRefresh}
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(statusFilter !== "all" || sortBy !== "recent") && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-400">Active filters:</span>
                            {statusFilter !== "all" && (
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
                                    Status: {statusFilter}
                                </span>
                            )}
                            {sortBy !== "recent" && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                    Sort: {sortBy}
                                </span>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    onStatusChange("all")
                                    onSortChange("recent")
                                }}
                                className="text-xs text-slate-500 hover:text-slate-300"
                            >
                                Clear all
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}