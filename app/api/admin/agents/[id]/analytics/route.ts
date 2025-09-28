import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Get agent performance analytics
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, all
        
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")
        const interviewsCollection = db.collection("interviews")

        // Check if agent exists
        const template = await templatesCollection.findOne({ _id: new ObjectId(id) })
        if (!template) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Calculate date filter based on timeframe
        let dateFilter: any = {}
        const now = new Date()
        
        switch (timeframe) {
            case '7d':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                break
            case '30d':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
                break
            case '90d':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
                break
            case 'all':
            default:
                // No date filter for 'all'
                break
        }

        // Get interview statistics
        const interviewStats = await interviewsCollection.aggregate([
            { 
                $match: { 
                    templateId: new ObjectId(id),
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalInterviews: { $sum: 1 },
                    completedInterviews: { 
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    inProgressInterviews: { 
                        $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] }
                    },
                    pendingInterviews: { 
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    averageScore: { 
                        $avg: { $cond: [{ $ne: ["$score", null] }, "$score", null] }
                    },
                    minScore: { $min: "$score" },
                    maxScore: { $max: "$score" },
                    totalDuration: { $sum: "$totalDuration" },
                    averageDuration: { $avg: "$totalDuration" }
                }
            }
        ]).toArray()

        const stats = interviewStats[0] || {
            totalInterviews: 0,
            completedInterviews: 0,
            inProgressInterviews: 0,
            pendingInterviews: 0,
            averageScore: null,
            minScore: null,
            maxScore: null,
            totalDuration: 0,
            averageDuration: 0
        }

        // Get interviews over time (for charts)
        const interviewsOverTime = await interviewsCollection.aggregate([
            { 
                $match: { 
                    templateId: new ObjectId(id),
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    completed: { 
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    averageScore: { 
                        $avg: { $cond: [{ $ne: ["$score", null] }, "$score", null] }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]).toArray()

        // Get score distribution
        const scoreDistribution = await interviewsCollection.aggregate([
            { 
                $match: { 
                    templateId: new ObjectId(id),
                    score: { $ne: null },
                    ...dateFilter
                }
            },
            {
                $bucket: {
                    groupBy: "$score",
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: "other",
                    output: {
                        count: { $sum: 1 },
                        averageScore: { $avg: "$score" }
                    }
                }
            }
        ]).toArray()

        // Get recent interviews for activity feed
        const recentInterviews = await interviewsCollection
            .find({ 
                templateId: new ObjectId(id),
                ...dateFilter
            })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray()

        // Calculate performance metrics
        const completionRate = stats.totalInterviews > 0 
            ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100)
            : 0

        const performanceGrade = stats.averageScore 
            ? stats.averageScore >= 80 ? 'A' 
            : stats.averageScore >= 70 ? 'B'
            : stats.averageScore >= 60 ? 'C'
            : stats.averageScore >= 50 ? 'D' : 'F'
            : 'N/A'

        const analytics = {
            timeframe,
            agentInfo: {
                templateId: template._id,
                templateTitle: template.title,
                targetRole: template.targetRole,
                questionsCount: template.questions?.length || 0,
                createdAt: template.createdAt
            },
            summary: {
                totalInterviews: stats.totalInterviews,
                completedInterviews: stats.completedInterviews,
                inProgressInterviews: stats.inProgressInterviews,
                pendingInterviews: stats.pendingInterviews,
                completionRate,
                averageScore: stats.averageScore ? Math.round(stats.averageScore * 100) / 100 : null,
                performanceGrade,
                scoreRange: {
                    min: stats.minScore,
                    max: stats.maxScore
                },
                duration: {
                    total: stats.totalDuration || 0,
                    average: stats.averageDuration ? Math.round(stats.averageDuration / 60) : 0 // Convert to minutes
                }
            },
            charts: {
                interviewsOverTime: interviewsOverTime.map(item => ({
                    date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
                    interviews: item.count,
                    completed: item.completed,
                    averageScore: item.averageScore ? Math.round(item.averageScore * 100) / 100 : null
                })),
                scoreDistribution: scoreDistribution.map(bucket => ({
                    range: bucket._id === "other" ? "Other" : `${bucket._id}-${bucket._id + 19}`,
                    count: bucket.count,
                    averageScore: bucket.averageScore ? Math.round(bucket.averageScore * 100) / 100 : null
                }))
            },
            recentActivity: recentInterviews.map(interview => ({
                candidateName: interview.candidateName,
                candidateEmail: interview.candidateEmail,
                status: interview.status,
                score: interview.score,
                createdAt: interview.createdAt,
                completedAt: interview.completedAt,
                duration: interview.totalDuration
            }))
        }

        return NextResponse.json({ analytics })

    } catch (error) {
        console.error("Get agent analytics error:", error)
        return NextResponse.json({ 
            error: "Failed to fetch agent analytics",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}