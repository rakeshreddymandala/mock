import { useState, useCallback } from "react"
import { useAgentDetails } from "./useAgentDetails"

export function useAgentPage(agentId: string) {
    const [activeTab, setActiveTab] = useState("overview")
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)
    const [analyticsError, setAnalyticsError] = useState<string | null>(null)
    
    const {
        agent,
        analytics,
        isLoading,
        error,
        updateAgent,
        deleteAgent,
        fetchAnalytics: originalFetchAnalytics,
        refetch
    } = useAgentDetails(agentId)

    const handleEdit = useCallback(() => {
        setShowEditDialog(true)
    }, [])

    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true)
    }, [])

    const handleSaveEdit = useCallback(async (updateData: any) => {
        setIsUpdating(true)
        try {
            const result = await updateAgent(updateData)
            if (result.success) {
                setShowEditDialog(false)
            }
            return result
        } finally {
            setIsUpdating(false)
        }
    }, [updateAgent])

    const handleConfirmDelete = useCallback(async () => {
        setIsUpdating(true)
        try {
            const result = await deleteAgent()
            if (result.success) {
                setShowDeleteDialog(false)
            }
            return result
        } finally {
            setIsUpdating(false)
        }
    }, [deleteAgent])

    const handleToggleStatus = useCallback(async (active: boolean): Promise<void> => {
        if (!agent) return
        
        setIsUpdating(true)
        try {
            await updateAgent({ isActive: active })
        } finally {
            setIsUpdating(false)
        }
    }, [agent, updateAgent])

    const handleRegenerateAgent = useCallback(async (): Promise<void> => {
        // This would call a regeneration API
        console.log('Regenerating agent...')
        return Promise.resolve()
    }, [])

    const handleCloseEditDialog = useCallback(() => {
        setShowEditDialog(false)
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setShowDeleteDialog(false)
    }, [])

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true)
        setAnalyticsError(null)
        try {
            await originalFetchAnalytics()
        } catch (error) {
            setAnalyticsError(error instanceof Error ? error.message : 'Failed to fetch analytics')
        } finally {
            setAnalyticsLoading(false)
        }
    }, [originalFetchAnalytics])

    return {
        // Data
        agent,
        analytics,
        isLoading,
        error,
        
        // UI State
        activeTab,
        setActiveTab,
        showEditDialog,
        showDeleteDialog,
        isUpdating,
        analyticsLoading,
        analyticsError,
        
        // Actions
        handleEdit,
        handleDelete,
        handleSaveEdit,
        handleConfirmDelete,
        handleToggleStatus,
        handleRegenerateAgent,
        handleCloseEditDialog,
        handleCloseDeleteDialog,
        refetch,
        fetchAnalytics
    }
}