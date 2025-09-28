"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Bot, 
    Activity, 
    Clock, 
    MessageSquare, 
    Settings,
    AlertTriangle,
    CheckCircle2,
    Pause
} from "lucide-react"
import { DetailedAgent } from "../hooks/useAgentDetails"

interface AgentOverviewTabProps {
    agent: DetailedAgent
    onEdit: () => void
    onDelete: () => void
}

export function AgentOverviewTab({ agent, onEdit, onDelete }: AgentOverviewTabProps) {
    const getStatusIcon = () => {
        if (!agent.isActive) return <Pause className="w-4 h-4 text-gray-500" />
        if (agent.agentCreationError) return <AlertTriangle className="w-4 h-4 text-red-500" />
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }

    const getStatusBadge = () => {
        if (!agent.isActive) return <Badge variant="secondary">Inactive</Badge>
        if (agent.agentCreationError) return <Badge variant="destructive">Failed</Badge>
        return <Badge variant="default">Active</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Agent Status Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{agent.templateTitle}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                    {getStatusIcon()}
                                    {getStatusBadge()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Settings className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-primary">{agent.statistics.totalInterviews}</div>
                            <div className="text-sm text-muted-foreground">Total Interviews</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {agent.statistics.averageScore?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Average Score</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {agent.statistics.successRate?.toFixed(1) || 'N/A'}%
                            </div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Agent Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Agent Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="mt-1">{agent.templateDescription || 'No description provided'}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Role</label>
                        <p className="mt-1 capitalize">{agent.targetRole}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Interview Questions</label>
                        <div className="mt-2 space-y-2">
                            {agent.questions.map((questionObj, index) => (
                                <div key={questionObj.id || index} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                                    </div>
                                    <p className="text-sm">
                                        {typeof questionObj === 'string' ? questionObj : questionObj.question}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Agent Prompt</label>
                        <div className="mt-2 p-3 bg-muted/20 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{agent.agentPrompt}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Technical Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="font-medium text-muted-foreground">Agent ID</label>
                            <code className="block mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                                {agent.agentId}
                            </code>
                        </div>
                        <div>
                            <label className="font-medium text-muted-foreground">Template ID</label>
                            <code className="block mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                                {agent.templateId}
                            </code>
                        </div>
                        <div>
                            <label className="font-medium text-muted-foreground">Created</label>
                            <p className="mt-1">{formatDate(agent.createdAt)}</p>
                        </div>
                        <div>
                            <label className="font-medium text-muted-foreground">Last Updated</label>
                            <p className="mt-1">{formatDate(agent.updatedAt)}</p>
                        </div>
                    </div>

                    {agent.agentCreationError && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-medium">Agent Creation Error</span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300">{agent.agentCreationError}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="text-red-800 dark:text-red-200">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Delete Agent</h4>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete this agent and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={onDelete}
                            className="ml-4"
                        >
                            Delete Agent
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}