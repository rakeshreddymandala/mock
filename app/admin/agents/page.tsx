"use client"

import { useState } from "react"
import { Bot, RefreshCw, Activity, AlertTriangle, Search, Plus, MoreHorizontal, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { AdminLayout } from "../components/AdminLayout"
import { useRealtimeAgents } from "./hooks/useRealtimeAgents"
import { useBulkOperations } from "./hooks/useBulkOperations"
import { AgentsStatsCards } from "./components/AgentsStatsCards"
import { AgentsList } from "./components/AgentsList"
import { BulkOperationsDialog } from "./components/BulkOperationsDialog"

export default function AgentsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [showSelection, setShowSelection] = useState(false)
    const [showBulkDialog, setShowBulkDialog] = useState(false)

    const { 
        agents, 
        summary, 
        isLoading, 
        error, 
        lastFetch,
        refetch,
        isConnectedToElevenLabs,
        isEmpty 
    } = useRealtimeAgents(true, 30000) // Auto-refresh every 30 seconds

    const { performBulkOperation, isLoading: bulkLoading } = useBulkOperations()

    // Filter agents based on search query
    const filteredAgents = agents.filter(agent => 
        agent.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.templateDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.targetRole.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatLastUpdate = (date: Date | null) => {
        if (!date) return "Never"
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
        
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
    }

    const handleAgentClick = (agent: any) => {
        if (showSelection) {
            // In selection mode, clicking toggles selection
            const isSelected = selectedAgents.includes(agent.templateId)
            if (isSelected) {
                setSelectedAgents(prev => prev.filter(id => id !== agent.templateId))
            } else {
                setSelectedAgents(prev => [...prev, agent.templateId])
            }
        } else {
            // Normal mode, navigate to agent details
            router.push(`/admin/agents/${agent.templateId}`)
        }
    }

    const handleBulkOperation = async (operation: string, params?: any) => {
        const result = await performBulkOperation(operation as any, selectedAgents, params)
        
        if (result.success) {
            // Refresh the data after successful bulk operation
            refetch()
            
            // Clear selection if all operations succeeded
            if (result.result?.failedCount === 0) {
                setSelectedAgents([])
                setShowSelection(false)
            }
        }
        
        return {
            success: result.success,
            results: result.result ? {
                successCount: result.result.successCount,
                failureCount: result.result.failedCount,
                errors: result.result.warnings?.map(w => `${w.agentId}: ${w.reason}`)
            } : undefined,
            error: result.error
        }
    }

    const toggleSelectionMode = () => {
        setShowSelection(!showSelection)
        if (showSelection) {
            setSelectedAgents([])
        }
    }

    const selectAllAgents = () => {
        if (selectedAgents.length === filteredAgents.length) {
            setSelectedAgents([])
        } else {
            setSelectedAgents(filteredAgents.map(agent => agent.templateId))
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Agents Management</h1>
                        <p className="text-muted-foreground text-lg">
                            Real-time monitoring of ElevenLabs AI agents created through admin portal
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Selection Mode Indicators */}
                        {showSelection && (
                            <>
                                <Badge variant="secondary">
                                    {selectedAgents.length} selected
                                </Badge>
                                {selectedAgents.length > 0 && (
                                    <Button 
                                        onClick={() => setShowBulkDialog(true)}
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Bulk Operations
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Connection Status */}
                        <div className="flex items-center space-x-2">
                            <Badge variant={isConnectedToElevenLabs ? "default" : "destructive"}>
                                <Activity className="w-3 h-3 mr-1" />
                                {isConnectedToElevenLabs ? "Live" : "Offline"}
                            </Badge>
                            {summary && (
                                <span className="text-sm text-muted-foreground">
                                    Updated {formatLastUpdate(lastFetch)}
                                </span>
                            )}
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={toggleSelectionMode}>
                                    {showSelection ? (
                                        <>
                                            <Square className="w-4 h-4 mr-2" />
                                            Exit Selection
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4 mr-2" />
                                            Select Agents
                                        </>
                                    )}
                                </DropdownMenuItem>
                                
                                {showSelection && filteredAgents.length > 0 && (
                                    <DropdownMenuItem onClick={selectAllAgents}>
                                        {selectedAgents.length === filteredAgents.length ? 'Deselect All' : 'Select All'}
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={refetch}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh Data
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => router.push('/admin/templates')} className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Template
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="font-medium">Error loading real-time agent data</p>
                        </div>
                        <p className="text-sm mt-1">{error}</p>
                        <Button
                            onClick={refetch}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* Connection Warning */}
                {!isConnectedToElevenLabs && !error && summary && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="font-medium">Limited Data Available</p>
                        </div>
                        <p className="text-sm mt-1">
                            Not connected to ElevenLabs API. Showing template data only.
                        </p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="animate-slide-up">
                    <AgentsStatsCards summary={summary} isLoading={isLoading} />
                </div>

                {/* Empty State */}
                {isEmpty && !isLoading && (
                    <div className="text-center py-12">
                        <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium text-foreground mb-2">No Agents Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Agents will appear here automatically when you create interview templates through the admin portal.
                        </p>
                        <Button variant="outline" onClick={() => router.push('/admin/templates')}>
                            Create Your First Template
                        </Button>
                    </div>
                )}

                {/* Search and Filters */}
                {!isEmpty && (
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search agents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        {searchQuery && (
                            <Badge variant="secondary">
                                {filteredAgents.length} of {agents.length} agents
                            </Badge>
                        )}
                    </div>
                )}

                {/* Agents List */}
                {!isEmpty && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Bot className="w-6 h-6 mr-3 text-primary" />
                                <h2 className="text-2xl font-semibold text-foreground">
                                    {searchQuery ? `Search Results (${filteredAgents.length})` : `All Agents (${agents.length})`}
                                </h2>
                            </div>
                            {summary && !searchQuery && (
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>✅ {summary.activeAgents} Active</span>
                                    <span>⚠️ {summary.failedAgents} Failed</span>
                                    <span>💬 {summary.totalConversations} Total Conversations</span>
                                </div>
                            )}
                        </div>
                        
                        <AgentsList 
                            agents={filteredAgents}
                            isLoading={isLoading}
                            selectedAgents={selectedAgents}
                            onSelectionChange={setSelectedAgents}
                            showSelection={showSelection}
                            onAgentClick={handleAgentClick}
                        />
                    </div>
                )}

                {/* Bulk Operations Dialog */}
                <BulkOperationsDialog
                    open={showBulkDialog}
                    onOpenChange={setShowBulkDialog}
                    selectedAgents={selectedAgents}
                    onBulkOperation={handleBulkOperation}
                    isLoading={bulkLoading}
                />
            </div>
        </AdminLayout>
    )
}