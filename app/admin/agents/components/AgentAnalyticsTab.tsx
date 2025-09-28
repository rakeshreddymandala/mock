"use client"

import { AgentAnalyticsChart } from "./AgentAnalyticsChart"
import { AgentAnalytics } from "../hooks/useAgentDetails"

interface AgentAnalyticsTabProps {
    analytics: AgentAnalytics | null
    isLoading: boolean
    error: string | null
    onRefresh: () => void
}

export function AgentAnalyticsTab({ 
    analytics, 
    isLoading, 
    error, 
    onRefresh 
}: AgentAnalyticsTabProps) {
    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-500 rounded" />
                </div>
                <h3 className="font-medium text-lg mb-2">Failed to Load Analytics</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button 
                    onClick={onRefresh}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (isLoading || !analytics) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-4">
                            <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                            <div className="h-4 bg-muted rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-6">
                            <div className="h-6 bg-muted rounded animate-pulse mb-4" />
                            <div className="h-64 bg-muted rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return <AgentAnalyticsChart analytics={analytics} />
}