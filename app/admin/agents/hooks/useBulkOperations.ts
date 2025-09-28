"use client"

import { useState, useCallback } from "react"

export interface BulkOperationResult {
    operation: string
    requestedCount: number
    processedCount: number
    successCount: number
    failedCount: number
    message: string
    results: any[]
    warnings?: Array<{
        agentId: string
        reason: string
    }>
}

export type BulkOperation = 
    | 'activate' 
    | 'deactivate' 
    | 'delete' 
    | 'update_role' 
    | 'regenerate_failed'

export function useBulkOperations() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null)

    const performBulkOperation = useCallback(async (
        operation: BulkOperation,
        agentIds: string[],
        data?: any
    ): Promise<{ success: boolean; result?: BulkOperationResult; error?: string }> => {
        if (!operation || !agentIds || agentIds.length === 0) {
            return { success: false, error: "Operation and agent IDs are required" }
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/admin/agents/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation,
                    agentIds,
                    data
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.message || `HTTP ${response.status}`)
            }

            setLastResult(result)
            return { success: true, result }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bulk operation failed"
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Convenience methods for specific operations
    const activateAgents = useCallback(async (agentIds: string[]) => {
        return await performBulkOperation('activate', agentIds)
    }, [performBulkOperation])

    const deactivateAgents = useCallback(async (agentIds: string[]) => {
        return await performBulkOperation('deactivate', agentIds)
    }, [performBulkOperation])

    const deleteAgents = useCallback(async (agentIds: string[]) => {
        return await performBulkOperation('delete', agentIds)
    }, [performBulkOperation])

    const updateAgentRole = useCallback(async (agentIds: string[], targetRole: string) => {
        return await performBulkOperation('update_role', agentIds, { targetRole })
    }, [performBulkOperation])

    const regenerateFailedAgents = useCallback(async (agentIds: string[]) => {
        return await performBulkOperation('regenerate_failed', agentIds)
    }, [performBulkOperation])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const clearLastResult = useCallback(() => {
        setLastResult(null)
    }, [])

    return {
        // State
        isLoading,
        error,
        lastResult,

        // Generic operation
        performBulkOperation,

        // Specific operations
        activateAgents,
        deactivateAgents,
        deleteAgents,
        updateAgentRole,
        regenerateFailedAgents,

        // Utility functions
        clearError,
        clearLastResult,

        // Computed values
        hasResult: lastResult !== null,
        isSuccess: lastResult?.successCount ? lastResult.successCount > 0 : false,
        hasWarnings: lastResult?.warnings && lastResult.warnings.length > 0,
    }
}