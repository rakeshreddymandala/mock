import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, BarChart3 } from "lucide-react"
import type { InterviewsStats } from "../hooks/useInterviewsData"

interface InterviewsStatsCardsProps {
    stats: InterviewsStats
    isLoading: boolean
}

export function InterviewsStatsCards({ stats, isLoading }: InterviewsStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                    <Users className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground">All platform interviews</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{stats.completedInterviews}</div>
                    <p className="text-xs text-muted-foreground">Successfully finished</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                    <Clock className="w-4 h-4 text-accent" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-accent">{stats.inProgressInterviews}</div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 hover:bg-card/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
                    <BarChart3 className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
                    <p className="text-xs text-muted-foreground">Performance metric</p>
                </CardContent>
            </Card>
        </div>
    )
}