import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await getDatabase()

        // Get total companies (users with role 'company')
        const totalCompanies = await db.collection("users").countDocuments({ role: "company" })

        // Get total interviews
        const totalInterviews = await db.collection("interviews").countDocuments()

        // Get total templates
        const totalTemplates = await db.collection("templates").countDocuments({ isActive: true })

        // Get active users (companies with recent activity - last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const activeUsers = await db.collection("users").countDocuments({
            role: "company",
            updatedAt: { $gte: thirtyDaysAgo }
        })

        // Get completed interviews for completion rate
        const completedInterviews = await db.collection("interviews").countDocuments({ status: "completed" })
        const completionRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0

        // Calculate average interview score
        const scoresAggregation = await db.collection("interviews").aggregate([
            { $match: { score: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgScore: { $avg: "$score" } } }
        ]).toArray()

        const avgInterviewScore = scoresAggregation.length > 0
            ? Math.round(scoresAggregation[0].avgScore * 10) / 10
            : 0

        // Get monthly growth data
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

        const currentMonthCompanies = await db.collection("users").countDocuments({
            role: "company",
            createdAt: { $gte: lastMonth }
        })

        const previousMonthCompanies = await db.collection("users").countDocuments({
            role: "company",
            createdAt: { $gte: twoMonthsAgo, $lt: lastMonth }
        })

        const currentMonthInterviews = await db.collection("interviews").countDocuments({
            createdAt: { $gte: lastMonth }
        })

        const previousMonthInterviews = await db.collection("interviews").countDocuments({
            createdAt: { $gte: twoMonthsAgo, $lt: lastMonth }
        })

        // Calculate growth percentages
        const companiesGrowth = previousMonthCompanies > 0
            ? Math.round(((currentMonthCompanies - previousMonthCompanies) / previousMonthCompanies) * 100)
            : 0

        const interviewsGrowth = previousMonthInterviews > 0
            ? Math.round(((currentMonthInterviews - previousMonthInterviews) / previousMonthInterviews) * 100)
            : 0

        const usersGrowth = Math.round(Math.random() * 20) // Mock growth for active users

        const stats = {
            totalCompanies,
            totalInterviews,
            totalTemplates,
            activeUsers,
            systemUptime: 99.9, // Mock system uptime
            avgInterviewScore,
            completionRate,
            monthlyGrowth: {
                companies: companiesGrowth,
                interviews: interviewsGrowth,
                users: usersGrowth,
            },
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error fetching analytics data:", error)
        return NextResponse.json(
            { error: "Failed to fetch analytics data" },
            { status: 500 }
        )
    }
}