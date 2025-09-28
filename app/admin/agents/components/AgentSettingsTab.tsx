"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
    Settings,
    AlertTriangle,
    Clock,
    RefreshCw
} from "lucide-react"
import { DetailedAgent } from "../hooks/useAgentDetails"

interface AgentSettingsTabProps {
    agent: DetailedAgent
    onEdit: () => void
    onToggleStatus: (active: boolean) => Promise<void>
    onRegenerateAgent: () => Promise<void>
    isLoading: boolean
}

export function AgentSettingsTab({ 
    agent, 
    onEdit, 
    onToggleStatus, 
    onRegenerateAgent,
    isLoading 
}: AgentSettingsTabProps) {
    return (
        <div className="space-y-6">
            {/* Quick Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="agent-status">Agent Status</Label>
                            <div className="text-sm text-muted-foreground">
                                {agent.isActive ? 'Agent is active and available for interviews' : 'Agent is inactive'}
                            </div>
                        </div>
                        <Switch
                            id="agent-status"
                            checked={agent.isActive}
                            onCheckedChange={onToggleStatus}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <Button 
                            onClick={onEdit} 
                            className="w-full"
                            disabled={isLoading}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Agent Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Agent Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label className="text-muted-foreground">Target Role</Label>
                            <p className="capitalize font-medium">{agent.targetRole}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Questions Count</Label>
                            <p className="font-medium">{agent.questionsCount}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Prompt Type</Label>
                            <p className="font-medium">
                                {agent.useCustomPrompt ? 'Custom' : 'Generated'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <Badge variant={agent.isActive ? "default" : "secondary"}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ElevenLabs Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>ElevenLabs Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-muted-foreground">Agent ID</Label>
                        <code className="block mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                            {agent.agentId}
                        </code>
                    </div>

                    {agent.liveData && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Live Data</Label>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {agent.liveData.conversationsCount !== undefined && (
                                    <div>
                                        <span className="text-muted-foreground">Conversations:</span>
                                        <span className="ml-2 font-medium">{agent.liveData.conversationsCount}</span>
                                    </div>
                                )}
                                {agent.liveData.model && (
                                    <div>
                                        <span className="text-muted-foreground">Model:</span>
                                        <span className="ml-2 font-medium">{agent.liveData.model}</span>
                                    </div>
                                )}
                                {agent.liveData.language && (
                                    <div>
                                        <span className="text-muted-foreground">Language:</span>
                                        <span className="ml-2 font-medium">{agent.liveData.language}</span>
                                    </div>
                                )}
                                {agent.liveData.lastUsed && (
                                    <div>
                                        <span className="text-muted-foreground">Last Used:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(agent.liveData.lastUsed).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {agent.agentCreationError && (
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center space-x-2 text-red-800 dark:text-red-200 mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-medium">Creation Error</span>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {agent.agentCreationError}
                                </p>
                            </div>
                            <Button 
                                onClick={onRegenerateAgent}
                                variant="outline"
                                disabled={isLoading}
                                className="w-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate Agent
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">
                                {agent.statistics.totalInterviews}
                            </div>
                            <div className="text-sm text-blue-600/80">Total Interviews</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                                {agent.statistics.completedInterviews}
                            </div>
                            <div className="text-sm text-green-600/80">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                            <div className="text-xl font-bold text-yellow-600">
                                {agent.statistics.inProgressInterviews}
                            </div>
                            <div className="text-sm text-yellow-600/80">In Progress</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">
                                {agent.statistics.averageScore?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-purple-600/80">Avg Score</div>
                        </div>
                    </div>

                    {agent.statistics.lastUsed && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Last used: {new Date(agent.statistics.lastUsed).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}