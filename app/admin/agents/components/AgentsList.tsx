import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, GraduationCap, User, Bot, Activity, MessageSquare, Clock, AlertTriangle, CheckCircle2, Settings } from "lucide-react"
import { RealtimeAgent } from "../hooks/useRealtimeAgents"

interface AgentsListProps {
    agents: RealtimeAgent[]
    isLoading: boolean
    selectedAgents?: string[]
    onSelectionChange?: (agentIds: string[]) => void
    showSelection?: boolean
    onAgentClick?: (agent: RealtimeAgent) => void
}

export function AgentsList({ 
    agents, 
    isLoading, 
    selectedAgents = [], 
    onSelectionChange, 
    showSelection = false,
    onAgentClick
}: AgentsListProps) {
    const handleAgentSelect = (agentId: string, checked: boolean) => {
        if (!onSelectionChange) return
        
        if (checked) {
            onSelectionChange([...selectedAgents, agentId])
        } else {
            onSelectionChange(selectedAgents.filter(id => id !== agentId))
        }
    }

    const handleSelectAll = (sectionAgents: RealtimeAgent[], checked: boolean) => {
        if (!onSelectionChange) return
        
        const sectionIds = sectionAgents.map(agent => agent.templateId)
        
        if (checked) {
            const newSelection = [...selectedAgents]
            sectionIds.forEach(id => {
                if (!newSelection.includes(id)) {
                    newSelection.push(id)
                }
            })
            onSelectionChange(newSelection)
        } else {
            onSelectionChange(selectedAgents.filter(id => !sectionIds.includes(id)))
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader>
                            <div className="h-6 bg-muted animate-pulse rounded w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(2)].map((_, j) => (
                                    <div key={j} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="h-5 bg-muted animate-pulse rounded w-64" />
                                            <div className="h-4 bg-muted animate-pulse rounded w-32" />
                                            <div className="h-3 bg-muted animate-pulse rounded w-48" />
                                        </div>
                                        <div className="h-8 bg-muted animate-pulse rounded w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    // Group agents by target role
    const companyAgents = agents.filter(agent => agent.targetRole === "company")
    const studentAgents = agents.filter(agent => agent.targetRole === "student")  
    const generalAgents = agents.filter(agent => agent.targetRole === "general")

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getStatusIcon = (agent: RealtimeAgent) => {
        if (agent.classification.isFailed) {
            return <AlertTriangle className="w-4 h-4 text-red-500" />
        }
        if (agent.classification.isActive) {
            return <CheckCircle2 className="w-4 h-4 text-green-500" />
        }
        if (agent.classification.isPlaceholder) {
            return <Clock className="w-4 h-4 text-yellow-500" />
        }
        return <Activity className="w-4 h-4 text-blue-500" />
    }

    const getStatusBadge = (agent: RealtimeAgent) => {
        if (agent.classification.isFailed) {
            return <Badge variant="destructive">Failed</Badge>
        }
        if (agent.classification.isActive) {
            return <Badge variant="default">Active</Badge>
        }
        if (agent.classification.isPlaceholder) {
            return <Badge variant="secondary">Placeholder</Badge>
        }
        return <Badge variant="outline">Created</Badge>
    }

    const AgentCard = ({ agent }: { agent: RealtimeAgent }) => {
        const isSelected = selectedAgents.includes(agent.templateId)
        
        return (
            <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group cursor-pointer ${
                isSelected 
                    ? 'bg-primary/5 border-primary/30 shadow-sm' 
                    : 'bg-card/30 border-border/30 hover:bg-card/50'
            }`} onClick={() => onAgentClick?.(agent)}>
                <div className="flex items-start space-x-4">
                    {showSelection && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleAgentSelect(agent.templateId, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                        />
                    )}
                    
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <p className="font-semibold text-foreground">{agent.templateTitle}</p>
                            {getStatusIcon(agent)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                            {agent.templateDescription || 'No description provided'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{agent.questionsCount} questions</span>
                            </span>
                            
                            {agent.liveData && (
                                <span className="flex items-center space-x-1">
                                    <Activity className="w-3 h-3" />
                                    <span>{agent.liveData.conversationsCount} conversations</span>
                                </span>
                            )}
                            
                            <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Created {formatDate(agent.createdAt)}</span>
                            </span>
                        </div>

                        {/* Agent ID and Live Data */}
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
                                {agent.agentId.length > 30 ? `${agent.agentId.substring(0, 30)}...` : agent.agentId}
                            </code>
                            
                            {agent.liveData && (
                                <Badge variant="outline" className="text-xs">
                                    Live Data
                                </Badge>
                            )}
                        </div>

                        {/* Error Message */}
                        {agent.agentCreationError && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                                Error: {agent.agentCreationError}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    {getStatusBadge(agent)}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="transition-opacity duration-200"
                        onClick={(e) => {
                            e.stopPropagation()
                            onAgentClick?.(agent)
                        }}
                    >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                    </Button>
                </div>
            </div>
        )
    }

    const SectionCard = ({ title, icon, agents: sectionAgents, color = "primary" }: { 
        title: string
        icon: React.ReactNode
        agents: RealtimeAgent[]
        color?: string 
    }) => {
        const sectionSelectedCount = sectionAgents.filter(agent => 
            selectedAgents.includes(agent.templateId)
        ).length
        const allSelected = sectionSelectedCount === sectionAgents.length && sectionAgents.length > 0
        const someSelected = sectionSelectedCount > 0 && sectionSelectedCount < sectionAgents.length
        
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl text-foreground">
                        <div className="flex items-center">
                            {showSelection && sectionAgents.length > 0 && (
                                <Checkbox
                                    checked={allSelected}
                                    ref={(ref: HTMLButtonElement | null) => {
                                        if (ref) {
                                            (ref as any).indeterminate = someSelected
                                        }
                                    }}
                                    onCheckedChange={(checked) => handleSelectAll(sectionAgents, checked as boolean)}
                                    className="mr-3"
                                />
                            )}
                            {icon}
                            <span className="ml-2">{title} ({sectionAgents.length})</span>
                            {sectionSelectedCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {sectionSelectedCount} selected
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>
                                {sectionAgents.filter(a => a.classification.isActive).length} active
                            </span>
                            <span>•</span>
                            <span>
                                {sectionAgents.reduce((sum, a) => sum + (a.liveData?.conversationsCount || 0), 0)} conversations
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sectionAgents.map((agent) => (
                            <AgentCard key={agent.templateId} agent={agent} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Company Agents */}
            {companyAgents.length > 0 && (
                <SectionCard
                    title="Company Interview Agents"
                    icon={<Building2 className="w-5 h-5 text-primary" />}
                    agents={companyAgents}
                />
            )}

            {/* Student Agents */}
            {studentAgents.length > 0 && (
                <SectionCard
                    title="Student Practice Agents"
                    icon={<GraduationCap className="w-5 h-5 text-blue-500" />}
                    agents={studentAgents}
                />
            )}

            {/* General User Agents */}
            {generalAgents.length > 0 && (
                <SectionCard
                    title="General User Agents"
                    icon={<User className="w-5 h-5 text-green-500" />}
                    agents={generalAgents}
                />
            )}

            {/* Empty State */}
            {agents.length === 0 && (
                <Card className="border-border/50">
                    <CardContent className="text-center py-12">
                        <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Agents Found</h3>
                        <p className="text-muted-foreground mb-4">
                            Agents created through the admin portal will appear here automatically.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/admin/templates'}>
                            Create Your First Template
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}