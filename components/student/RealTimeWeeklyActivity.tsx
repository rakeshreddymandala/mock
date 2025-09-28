import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

export function RealTimeWeeklyActivity() {
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

    // Calculate real weekly activity from session start dates
    const weeklyData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
        day,
        sessions: 0,
        dayIndex: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
    }))

    // Count sessions by day of week
    results.forEach(session => {
        const dayOfWeek = new Date(session.startedAt).getDay()
        weeklyData[dayOfWeek].sessions++
    })

    const maxSessions = Math.max(...weeklyData.map(d => d.sessions))

    if (results.length === 0) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Weekly Activity</CardTitle>
                    <CardDescription className="text-slate-400">
                        Your practice patterns by day
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No activity data yet</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white">Weekly Activity</CardTitle>
                <CardDescription className="text-slate-400">
                    Your practice patterns from {results.length} sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="day"
                            stroke="#9ca3af"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            domain={[0, Math.max(maxSessions + 1, 3)]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                            }}
                            formatter={(value: any) => [value, 'Sessions']}
                            labelFormatter={(label: any) => `${label}day`}
                        />
                        <Bar
                            dataKey="sessions"
                            fill="#6366f1"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Summary stats */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Most active day:</span>
                        <span className="text-white">
                            {weeklyData.reduce((max, day) => day.sessions > max.sessions ? day : max).day}
                            ({Math.max(...weeklyData.map(d => d.sessions))} sessions)
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}