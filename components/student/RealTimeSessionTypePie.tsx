import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts"

export function RealTimeSessionTypePie() {
    const { results, isLoading } = useStudentResults()

    if (isLoading) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-slate-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-48"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-48 bg-slate-700 rounded"></div>
                </CardContent>
            </Card>
        )
    }

    if (results.length === 0) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Session Status</CardTitle>
                    <CardDescription className="text-slate-400">
                        Distribution of session outcomes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No sessions yet</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate real session distribution
    const statusCounts = results.reduce((acc, session) => {
        const status = session.status
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status === 'completed' ? 'Completed' :
            status === 'in-progress' ? 'In Progress' : 'Abandoned',
        value: count,
        percentage: Math.round((count / results.length) * 100)
    }))

    const COLORS = {
        'Completed': '#22c55e',
        'In Progress': '#f59e0b',
        'Abandoned': '#ef4444'
    }

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null // Don't show label if less than 5%

        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white">Session Status</CardTitle>
                <CardDescription className="text-slate-400">
                    Distribution from {results.length} total sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name as keyof typeof COLORS]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                            formatter={(value: any) => [value, 'Sessions']}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                    {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                                ></div>
                                <span className="text-slate-300">{entry.name}</span>
                            </div>
                            <span className="text-white font-medium">
                                {entry.value} ({entry.percentage}%)
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}