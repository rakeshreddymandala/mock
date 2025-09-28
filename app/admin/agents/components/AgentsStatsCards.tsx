import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Activity, AlertTriangle, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react"
import { AgentsSummary } from "../hooks/useRealtimeAgents"

interface AgentsStatsCardsProps {
    summary: AgentsSummary | null
    isLoading: boolean
}

export function AgentsStatsCards({ summary, isLoading }: AgentsStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1" />
                            <div className="h-3 bg-muted animate-pulse rounded w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!summary) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p>No data available</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Agents */}
            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{summary.totalAgents}</div>
                    <p className="text-xs text-muted-foreground mt-1">Admin-created agents</p>
                </CardContent>
            </Card>

            {/* Active Agents */}
            <Card className="border-border/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.activeAgents}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {summary.totalAgents > 0 ? 
                            `${Math.round((summary.activeAgents / summary.totalAgents) * 100)}% success rate` : 
                            'Ready for interviews'
                        }
                    </p>
                </CardContent>
            </Card>

            {/* Failed/Placeholder Agents */}
            <Card className="border-border/50 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {summary.failedAgents + summary.placeholderAgents}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {summary.failedAgents} failed, {summary.placeholderAgents} placeholder
                    </p>
                </CardContent>
            </Card>

            {/* Total Conversations */}
            <Card className="border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Conversations</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalConversations}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {summary.elevenLabsConnected ? 'Live from ElevenLabs' : 'API offline'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}