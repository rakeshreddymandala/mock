"use client"

import { useState, useEffect, useCallback } from "react"

export interface AgentStatistics {
    totalInterviews: number
    completedInterviews: number
    inProgressInterviews: number
    averageScore: number | null
    successRate: number
    lastUsed: string | null
}

export interface AgentLiveData {
    name?: string
    status?: string
    conversationsCount?: number
    lastUsed?: string | null
    model?: string
    language?: string
    createdAt?: string | null
}

export interface DetailedAgent {
    templateId: string
    templateTitle: string
    templateDescription: string
    targetRole: string
    questions: any[]
    questionsCount: number
    agentPrompt: string
    useCustomPrompt: boolean
    createdAt: string
    updatedAt: string
    isActive: boolean
    agentId: string
    agentStatus: string
    agentCreationError: string | null
    liveData: AgentLiveData | null
    elevenLabsError: string | null
    statistics: AgentStatistics
    classification: {
        isRealAgent: boolean
        isFailed: boolean
        isPlaceholder: boolean
        isActive: boolean
        hasLiveData: boolean
    }
}

export interface AgentAnalytics {
    timeframe: string
    agentInfo: {
        templateId: string
        templateTitle: string
        targetRole: string
        questionsCount: number
        createdAt: string
    }
    summary: {
        totalInterviews: number
        completedInterviews: number
        inProgressInterviews: number
        pendingInterviews: number
        completionRate: number
        averageScore: number | null
        performanceGrade: string
        scoreRange: {
            min: number | null
            max: number | null
        }
        duration: {
            total: number
            average: number
        }
    }
    charts: {
        interviewsOverTime: Array<{
            date: string
            interviews: number
            completed: number
            averageScore: number | null
        }>
        scoreDistribution: Array<{
            range: string
            count: number
            averageScore: number | null
        }>
    }
    recentActivity: Array<{
        candidateName: string
        candidateEmail: string
        status: string
        score: number | null
        createdAt: string
        completedAt: string | null
        duration: number | null
    }>
}

export function useAgentDetails(agentId: string | null) {
    const [agent, setAgent] = useState<DetailedAgent | null>(null)
    const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastFetch, setLastFetch] = useState<Date | null>(null)

    const fetchAgentDetails = useCallback(async () => {
        if (!agentId) return

        try {
            setError(null)
            setIsLoading(true)

            const response = await fetch(`/api/admin/agents/${agentId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const result = await response.json()
            setAgent(result.agent)
            setLastFetch(new Date())
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch agent details"
            setError(errorMessage)
            console.error("Error fetching agent details:", err)
        } finally {
            setIsLoading(false)
        }
    }, [agentId])

    const fetchAgentAnalytics = useCallback(async (timeframe = '30d') => {
        if (!agentId) return

        try {
            const response = await fetch(`/api/admin/agents/${agentId}/analytics?timeframe=${timeframe}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const result = await response.json()
            setAnalytics(result.analytics)
        } catch (err) {
            console.error("Error fetching agent analytics:", err)
        }
    }, [agentId])

    const updateAgent = useCallback(async (updateData: Partial<{
        title: string
        description: string
        questions: any[]
        agentPrompt: string
        useCustomPrompt: boolean
        isActive: boolean
    }>) => {
        if (!agentId) return { success: false, error: "No agent ID" }

        try {
            const response = await fetch(`/api/admin/agents/${agentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            const result = await response.json()
            
            // Refresh agent details after successful update
            await fetchAgentDetails()
            
            return { success: true, data: result }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update agent"
            return { success: false, error: errorMessage }
        }
    }, [agentId, fetchAgentDetails])

    const deleteAgent = useCallback(async () => {
        if (!agentId) return { success: false, error: "No agent ID" }

        try {
            const response = await fetch(`/api/admin/agents/${agentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
            }

            const result = await response.json()
            return { success: true, data: result }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete agent"
            return { success: false, error: errorMessage }
        }
    }, [agentId])

    // Fetch details when agentId changes
    useEffect(() => {
        if (agentId) {
            fetchAgentDetails()
            fetchAgentAnalytics()
        }
    }, [agentId, fetchAgentDetails, fetchAgentAnalytics])

    return {
        // Data
        agent,
        analytics,
        
        // State
        isLoading,
        error,
        lastFetch,
        
        // Actions
        refetch: fetchAgentDetails,
        fetchAnalytics: fetchAgentAnalytics,
        updateAgent,
        deleteAgent,
        
        // Computed values
        hasData: agent !== null,
        isRealAgent: agent?.classification.isRealAgent || false,
        isActive: agent?.isActive || false,
        hasFailed: agent?.classification.isFailed || false,
    }
}