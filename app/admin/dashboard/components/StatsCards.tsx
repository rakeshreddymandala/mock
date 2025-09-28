import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, BarChart3, Bot } from "lucide-react"
import type { DashboardStats } from "../hooks/useDashboardData"
import { useRouter } from "next/navigation"

interface StatsCardsProps {
    stats: DashboardStats
    isLoading: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    const router = useRouter()

    const handleAgentsClick = () => {
        router.push('/admin/agents')
    }

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.totalCompanies}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-600">+{stats.monthlyGrowth?.companies || 0}</span> this month
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-chart-3/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-5 h-5 text-accent" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-600">+{stats.monthlyGrowth?.interviews || 0}%</span> this month
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-chart-3/30 transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/10 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Interviews</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-chart-3/20 to-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-5 h-5 text-chart-3" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-chart-3">{stats.activeInterviews}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 group cursor-pointer" onClick={handleAgentsClick}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Bot className="w-5 h-5 text-secondary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-secondary">{stats.activeAgents}</div>
                    <p className="text-xs text-muted-foreground mt-1">ElevenLabs AI agents</p>
                </CardContent>
            </Card>
        </div>
    )
}