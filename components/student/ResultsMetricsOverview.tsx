import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Target,
    Play,
    Clock,
    Award,
    TrendingUp,
    TrendingDown,
    Calendar,
    BarChart3
} from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts"
import type { ResultsAnalytics } from "@/hooks/useStudentResults"

interface ResultsMetricsOverviewProps {
    analytics: ResultsAnalytics
    isLoading: boolean
}

export function ResultsMetricsOverview({ analytics, isLoading }: ResultsMetricsOverviewProps) {
    const getScoreTrend = () => {
        if (analytics.improvementTrend.length < 2) return null
        const recent = analytics.improvementTrend.slice(-2)
        const trend = recent[1] - recent[0]
        return trend > 0 ? "up" : trend < 0 ? "down" : "stable"
    }

    const scoreTrend = getScoreTrend()

    // Prepare chart data
    const improvementData = analytics.improvementTrend.map((score, index) => ({
        session: index + 1,
        score
    }))

    const skillsRadarData = [
        {
            skill: "Communication",
            score: analytics.skillProgress.communication,
            fullMark: 100
        },
        {
            skill: "Technical",
            score: analytics.skillProgress.technicalKnowledge,
            fullMark: 100
        },
        {
            skill: "Problem Solving",
            score: analytics.skillProgress.problemSolving,
            fullMark: 100
        },
        {
            skill: "Confidence",
            score: analytics.skillProgress.confidence,
            fullMark: 100
        },
        {
            skill: "Professional",
            score: analytics.skillProgress.professionalism,
            fullMark: 100
        }
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-8 bg-slate-700 rounded w-12 mb-2"></div>
                            <div className="h-6 bg-slate-700 rounded w-16"></div>
                            <div className="h-4 bg-slate-700 rounded w-20"></div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Target className="w-8 h-8 text-emerald-500" />
                            {scoreTrend && (
                                <div className={`flex items-center gap-1 ${scoreTrend === 'up' ? 'text-green-400' :
                                        scoreTrend === 'down' ? 'text-red-400' : 'text-slate-400'
                                    }`}>
                                    {scoreTrend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                        scoreTrend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {analytics.averageScore.toFixed(1)}%
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Average Score
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Play className="w-8 h-8 text-blue-500" />
                            <span className="text-xs text-slate-400">{analytics.completionRate}% completion</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {analytics.completedSessions}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Sessions Completed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Progress value={analytics.completionRate} className="h-2" />
                    </CardContent>
                </Card>

                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Clock className="w-8 h-8 text-purple-500" />
                            <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {Math.round(analytics.timeSpent / 3600)}h
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Total Practice Time
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Award className="w-8 h-8 text-yellow-500" />
                            <span className="text-xs text-slate-400">day streak</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            {analytics.streakDays}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Current Streak
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                {improvementData.length > 0 && (
                    <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">Score Progress</CardTitle>
                            <CardDescription className="text-slate-400">
                                Your performance improvement over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={improvementData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="session" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #475569',
                                            borderRadius: '8px',
                                            color: '#f1f5f9'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Skills Radar Chart */}
                <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Skills Performance</CardTitle>
                        <CardDescription className="text-slate-400">
                            Performance across different skill areas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={skillsRadarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#22c55e"
                                    fill="#22c55e"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Strong & Weak Areas */}
                <Card className="lg:col-span-2 border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Performance Analysis</CardTitle>
                        <CardDescription className="text-slate-400">
                            Areas where you excel and areas for improvement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Strong Areas
                                </h4>
                                <div className="space-y-2">
                                    {analytics.strongAreas.length > 0 ? (
                                        analytics.strongAreas.map((area, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                <span className="text-slate-300">{area}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500">Complete more sessions to see insights</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Areas for Improvement
                                </h4>
                                <div className="space-y-2">
                                    {analytics.weakAreas.length > 0 ? (
                                        analytics.weakAreas.map((area, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                                <span className="text-slate-300">{area}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500">Complete more sessions to see insights</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}