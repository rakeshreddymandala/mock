"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AdminLayout } from "../../components/AdminLayout"
import { useAgentPage } from "../hooks/useAgentPage"
import { AgentOverviewTab } from "../components/AgentOverviewTab"
import { AgentAnalyticsTab } from "../components/AgentAnalyticsTab"
import { AgentSettingsTab } from "../components/AgentSettingsTab"
import { AgentEditDialog } from "../components/AgentEditDialog"
import { AgentDeleteDialog } from "../components/AgentDeleteDialog"

export default function AgentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const agentId = params.id as string
    
    const {
        agent,
        analytics,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        showEditDialog,
        showDeleteDialog,
        isUpdating,
        analyticsLoading,
        analyticsError,
        handleEdit,
        handleDelete,
        handleSaveEdit,
        handleConfirmDelete,
        handleToggleStatus,
        handleRegenerateAgent,
        handleCloseEditDialog,
        handleCloseDeleteDialog,
        fetchAnalytics
    } = useAgentPage(agentId)

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (error || !agent) {
        return (
            <AdminLayout>
                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.push('/admin/agents')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Agents
                        </Button>
                    </div>
                    <Card>
                        <CardContent className="text-center py-12">
                            <h3 className="text-lg font-medium mb-2">Agent Not Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {error || "The requested agent could not be found."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.push('/admin/agents')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Agents
                        </Button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{agent.templateTitle}</h1>
                                <span className="text-sm text-muted-foreground">
                                    {agent.targetRole} interview
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <AgentOverviewTab 
                            agent={agent}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <AgentAnalyticsTab 
                            analytics={analytics}
                            isLoading={analyticsLoading}
                            error={analyticsError}
                            onRefresh={fetchAnalytics}
                        />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <AgentSettingsTab 
                            agent={agent}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            onRegenerateAgent={handleRegenerateAgent}
                            isLoading={isUpdating}
                        />
                    </TabsContent>
                </Tabs>

                {/* Edit Dialog */}
                <AgentEditDialog
                    open={showEditDialog}
                    onOpenChange={handleCloseEditDialog}
                    agent={agent}
                    onSave={handleSaveEdit}
                    isLoading={isUpdating}
                />

                {/* Delete Dialog */}
                <AgentDeleteDialog
                    open={showDeleteDialog}
                    onOpenChange={handleCloseDeleteDialog}
                    agent={agent}
                    onConfirm={handleConfirmDelete}
                    isLoading={isUpdating}
                />
            </div>
        </AdminLayout>
    )
}