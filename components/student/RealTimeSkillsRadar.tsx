import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStudentResults } from "@/hooks/useStudentResults"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer
} from "recharts"

export function RealTimeSkillsRadar() {
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

    // Calculate real skill averages from completed sessions with analysis data
    const completedSessions = results.filter(r =>
        r.status === 'completed' &&
        (r.analysis || r.finalScore)
    )

    if (completedSessions.length === 0) {
        return (
            <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Skills Performance</CardTitle>
                    <CardDescription className="text-slate-400">
                        Performance across different skill areas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-slate-400">Complete sessions with analysis to see skills breakdown</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate average scores for each skill from real data
    const skillAverages = {
        communication: { total: 0, count: 0 },
        technical: { total: 0, count: 0 },
        confidence: { total: 0, count: 0 },
        clarity: { total: 0, count: 0 },
        professionalism: { total: 0, count: 0 }
    }

    completedSessions.forEach(session => {
        // From AI metrics
        if (session.analysis?.aiMetrics) {
            const ai = session.analysis.aiMetrics
            if (ai.professionalism) {
                skillAverages.communication.total += ai.professionalism
                skillAverages.communication.count++
            }
            if (ai.correctness) {
                skillAverages.technical.total += ai.correctness
                skillAverages.technical.count++
            }
            if (ai.confidence) {
                skillAverages.confidence.total += ai.confidence
                skillAverages.confidence.count++
            }
        }

        // From final score breakdown
        if (session.finalScore?.breakdown) {
            const breakdown = session.finalScore.breakdown
            if (breakdown.professionalism) {
                skillAverages.professionalism.total += breakdown.professionalism
                skillAverages.professionalism.count++
            }
            if (breakdown.clarity) {
                const clarityScore = parseFloat(breakdown.clarity) || 0
                skillAverages.clarity.total += clarityScore
                skillAverages.clarity.count++
            }
        }
    })

    // Calculate final averages
    const radarData = [
        {
            skill: "Communication",
            score: skillAverages.communication.count > 0
                ? Math.round(skillAverages.communication.total / skillAverages.communication.count)
                : analytics.skillProgress.communication,
            fullMark: 100
        },
        {
            skill: "Technical",
            score: skillAverages.technical.count > 0
                ? Math.round(skillAverages.technical.total / skillAverages.technical.count)
                : analytics.skillProgress.technicalKnowledge,
            fullMark: 100
        },
        {
            skill: "Confidence",
            score: skillAverages.confidence.count > 0
                ? Math.round(skillAverages.confidence.total / skillAverages.confidence.count)
                : analytics.skillProgress.confidence,
            fullMark: 100
        },
        {
            skill: "Clarity",
            score: skillAverages.clarity.count > 0
                ? Math.round(skillAverages.clarity.total / skillAverages.clarity.count)
                : analytics.averageScore * 0.9,
            fullMark: 100
        },
        {
            skill: "Professional",
            score: skillAverages.professionalism.count > 0
                ? Math.round(skillAverages.professionalism.total / skillAverages.professionalism.count)
                : analytics.skillProgress.professionalism,
            fullMark: 100
        }
    ]

    return (
        <Card className="border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-white">Skills Performance</CardTitle>
                <CardDescription className="text-slate-400">
                    Real performance data from {completedSessions.length} completed sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="skill"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Skills summary */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {radarData.map((skill) => (
                        <div key={skill.skill} className="flex justify-between">
                            <span className="text-slate-400">{skill.skill}:</span>
                            <span className="text-white font-medium">{skill.score}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}