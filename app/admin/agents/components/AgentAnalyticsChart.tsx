"use client"

import { useMemo } from "react"
import { 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    LineChart,
    Line,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentAnalytics } from "../hooks/useAgentDetails"

interface AgentAnalyticsChartProps {
    analytics: AgentAnalytics
}

export function AgentAnalyticsChart({ analytics }: AgentAnalyticsChartProps) {
    // Process interview activity data for charts
    const activityData = useMemo(() => {
        return analytics.charts?.interviewsOverTime || []
    }, [analytics.charts])

    // Process score distribution data
    const scoreData = useMemo(() => {
        const distribution = analytics.charts?.scoreDistribution || []
        return distribution.map((item, index) => ({
            ...item,
            fill: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][index] || '#6b7280'
        }))
    }, [analytics.charts])

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.name === 'averageScore' ? entry.value?.toFixed(1) || 'N/A' : entry.value}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0]
            const total = analytics.summary?.totalInterviews || 0
            return (
                <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <p className="font-medium">Score Range: {data.payload.range}</p>
                    <p className="text-sm">Interviews: {data.value}</p>
                    <p className="text-sm">Percentage: {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}%</p>
                </div>
            )
        }
        return null
    }

    if (!analytics) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{analytics.summary?.totalInterviews || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Interviews</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {analytics.summary?.averageScore?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                            {analytics.summary?.completionRate?.toFixed(1) || '0.0'}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">
                            {analytics.summary?.duration?.average ? `${Math.round(analytics.summary.duration.average / 60)}m` : '0m'}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interview Activity Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Activity (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                    dataKey="date" 
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="interviews" 
                                    stroke="hsl(var(--primary))" 
                                    fill="hsl(var(--primary))" 
                                    fillOpacity={0.3}
                                    name="Interviews"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Average Score Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Score Trend (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={activityData.filter(d => d.averageScore !== null)}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                    dataKey="date" 
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    domain={[0, 100]}
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="averageScore" 
                                    stroke="hsl(var(--chart-2))" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                                    name="averageScore"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Score Distribution */}
                {scoreData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Score Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={scoreData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="count"
                                    >
                                        {scoreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={scoreData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                    dataKey="range"
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    className="text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="count" 
                                    name="Interviews"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {scoreData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* No Data State */}
            {(analytics.summary?.totalInterviews || 0) === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                            <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Interview Data Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            This agent hasn't conducted any interviews yet. Analytics will appear here once interviews are completed.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}