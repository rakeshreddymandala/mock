"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStudentData } from "@/hooks/useStudentData"
import { DashboardHeader } from "@/components/student/DashboardHeader"
import { MetricsCards } from "@/components/student/MetricsCards"
import { QuotaCard } from "@/components/student/QuotaCard"
import { ProgressCharts } from "@/components/student/ProgressCharts"
import { SkillsRadar } from "@/components/student/SkillsRadar"
import { SessionTypeChart } from "@/components/student/SessionTypeChart"
import { WeeklyActivity } from "@/components/student/WeeklyActivity"
import { DashboardRecentResults } from "@/components/student/DashboardRecentResults"
import { DashboardMetricsSummary } from "@/components/student/DashboardMetricsSummary"
import { RealTimeProgressChart } from "@/components/student/RealTimeProgressChart"
import { RealTimeSkillsRadar } from "@/components/student/RealTimeSkillsRadar"
import { RealTimeSessionTypePie } from "@/components/student/RealTimeSessionTypePie"
import { RealTimeWeeklyActivity } from "@/components/student/RealTimeWeeklyActivity"

export default function StudentDashboard() {
    const router = useRouter()
    const { student, analytics, isLoading, error } = useStudentData()

    useEffect(() => {
        if (error === 'unauthorized') {
            router.push('/student/login')
        }
    }, [error, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading your dashboard...</div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Unable to load student data</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <DashboardHeader student={student} />

                {/* Real-time Metrics */}
                <DashboardMetricsSummary />

                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuotaCard student={student} analytics={analytics} />
                </div>

                {/* Charts Row - Real-time Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RealTimeProgressChart />
                    <RealTimeSkillsRadar />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DashboardRecentResults />
                    </div>
                    <div className="space-y-6">
                        <RealTimeSessionTypePie />
                        <RealTimeWeeklyActivity />
                    </div>
                </div>
            </div>
        </div>
    )
}