"use client"

import { useState, useEffect, useCallback } from "react"

export interface LiveAgentData {
    name: string
    status: string
    conversationsCount: number
    lastUsed: string | null
    model: string
    language: string
    createdAt: string | null
}

export interface RealtimeAgent {
    templateId: string
    templateTitle: string
    templateDescription: string
    targetRole: string
    questionsCount: number
    createdAt: string
    usageCount: number
    agentId: string
    agentStatus: string
    agentCreationError: string | null
    liveData: LiveAgentData | null
    classification: {
        isRealAgent: boolean
        isFailed: boolean
        isPlaceholder: boolean
        isActive: boolean
        hasLiveData: boolean
    }
}

export interface AgentsSummary {
    totalAgents: number
    activeAgents: number
    realAgents: number
    failedAgents: number
    placeholderAgents: number
    totalConversations: number
    elevenLabsConnected: boolean
    lastUpdated: string
}

export interface RealtimeAgentsData {
    agents: RealtimeAgent[]
    summary: AgentsSummary
}

export function useRealtimeAgents(autoRefresh = true, refreshInterval = 30000) {
    const [data, setData] = useState<RealtimeAgentsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastFetch, setLastFetch] = useState<Date | null>(null)

    const fetchAgents = useCallback(async () => {
        try {
            setError(null)
            const response = await fetch("/api/admin/agents/realtime", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()
            
            if (result.error) {
                throw new Error(result.error)
            }

            setData(result)
            setLastFetch(new Date())
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
            setError(errorMessage)
            console.error("Error fetching realtime agents:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const refetch = useCallback(() => {
        setIsLoading(true)
        return fetchAgents()
    }, [fetchAgents])

    // Initial fetch
    useEffect(() => {
        fetchAgents()
    }, [fetchAgents])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(() => {
            fetchAgents()
        }, refreshInterval)

        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, fetchAgents])

    // Helper functions for data analysis
    const getAgentsByRole = useCallback((role: string) => {
        return data?.agents.filter(agent => agent.targetRole === role) || []
    }, [data])

    const getActiveAgents = useCallback(() => {
        return data?.agents.filter(agent => agent.classification.isActive) || []
    }, [data])

    const getFailedAgents = useCallback(() => {
        return data?.agents.filter(agent => agent.classification.isFailed) || []
    }, [data])

    const getRecentAgents = useCallback((hours = 24) => {
        if (!data?.agents) return []
        
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
        return data.agents.filter(agent => 
            new Date(agent.createdAt) > cutoffTime
        )
    }, [data])

    const getTotalConversations = useCallback(() => {
        return data?.summary.totalConversations || 0
    }, [data])

    return {
        // Data
        agents: data?.agents || [],
        summary: data?.summary || null,
        
        // State
        isLoading,
        error,
        lastFetch,
        
        // Actions
        refetch,
        
        // Helper functions
        getAgentsByRole,
        getActiveAgents,
        getFailedAgents,
        getRecentAgents,
        getTotalConversations,
        
        // Computed values
        hasData: data !== null,
        isEmpty: data?.agents.length === 0,
        isConnectedToElevenLabs: data?.summary.elevenLabsConnected === true,
    }
}