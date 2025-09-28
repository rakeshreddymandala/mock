import { useState, useEffect, useCallback } from "react"

export interface ResultMetric {
    sessionId: string
    templateId: string
    templateName: string
    status: "in-progress" | "completed" | "abandoned"
    startedAt: Date
    completedAt?: Date
    duration: number
    score?: number
    responses: number
    analysis?: {
        localMetrics: {
            avgLatency: string
            avgWords: string
            vocabRichness: string
            clarity: string
        }
        aiMetrics: {
            correctness: number
            relevance: number
            completeness: number
            confidence: number
            professionalism: number
            recommendation: string
        }
    }
    finalScore?: {
        score: number
        breakdown: {
            latency: string
            avgWords: string
            vocabRichness: string
            clarity: string
            correctness: number
            relevance: number
            completeness: number
            confidence: number
            professionalism: number
        }
        interpretation: string
    }
}

export interface ResultsAnalytics {
    totalSessions: number
    completedSessions: number
    averageScore: number
    timeSpent: number
    improvementTrend: number[]
    strongAreas: string[]
    weakAreas: string[]
    lastActivity: Date
    streakDays: number
    completionRate: number
    skillProgress: {
        communication: number
        technicalKnowledge: number
        problemSolving: number
        confidence: number
        professionalism: number
    }
}

export interface UseStudentResultsReturn {
    results: ResultMetric[]
    analytics: ResultsAnalytics | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
    filterResults: (status?: string, sortBy?: string) => Promise<void>
}

export function useStudentResults(): UseStudentResultsReturn {
    const [results, setResults] = useState<ResultMetric[]>([])
    const [analytics, setAnalytics] = useState<ResultsAnalytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchResults = useCallback(async (status?: string, sortBy?: string) => {
        try {
            setIsLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams()
            if (status && status !== "all") params.append("status", status)
            if (sortBy) params.append("sortBy", sortBy)
            params.append("includeAnalytics", "true")
            params.append("limit", "50")

            const response = await fetch(`/api/student/results?${params}`)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("unauthorized")
                }
                throw new Error(`Failed to fetch results: ${response.statusText}`)
            }

            const data = await response.json()
            setResults(data.results || [])
            setAnalytics(data.analytics || null)

        } catch (err) {
            console.error("Error fetching student results:", err)
            setError(err instanceof Error ? err.message : "Failed to load results")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const refresh = useCallback(async () => {
        await fetchResults()
    }, [fetchResults])

    const filterResults = useCallback(async (status?: string, sortBy?: string) => {
        await fetchResults(status, sortBy)
    }, [fetchResults])

    useEffect(() => {
        fetchResults()
    }, [fetchResults])

    return {
        results,
        analytics,
        isLoading,
        error,
        refresh,
        filterResults
    }
}