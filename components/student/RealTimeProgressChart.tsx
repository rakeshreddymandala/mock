import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

export function RealTimeProgressChart() {
    const { results, analytics, isLoading } = useStudentResults()

    if (isLoading || !analytics) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-slate-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-48"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-slate-700 rounded"></div>
                </CardContent>
            </Card>
        )
    }

    // Create progress data from actual completed sessions
    const completedSessions = results.filter(r => r.status === 'completed' && r.score !== undefined)
    const progressData = completedSessions
        .slice(-10) // Last 10 sessions
        .reverse() // Oldest first for chart
        .map((session, index) => ({
            session: index + 1,
            score: session.score || 0,
            date: new Date(session.completedAt || session.startedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            templateName: session.templateName
        }))

    if (progressData.length === 0) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Score Progress</CardTitle>
                    <CardDescription className="text-slate-400">
                        Track your improvement over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-slate-400">Complete some practice sessions to see your progress</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white">Score Progress</CardTitle>
                <CardDescription className="text-slate-400">
                    Your improvement over the last {progressData.length} sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="session"
                            stroke="#9ca3af"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                            formatter={(value: any, name: any) => [
                                `${value}%`,
                                'Score'
                            ]}
                            labelFormatter={(label: any, payload: any) => {
                                if (payload && payload[0]) {
                                    return `Session ${label} - ${payload[0].payload.date}`
                                }
                                return `Session ${label}`
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{
                                fill: '#22c55e',
                                strokeWidth: 2,
                                r: 5,
                                stroke: '#166534'
                            }}
                            activeDot={{
                                r: 7,
                                fill: '#22c55e',
                                stroke: '#166534',
                                strokeWidth: 2
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}