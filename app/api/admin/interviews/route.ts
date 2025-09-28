import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
    try {
        const db = await getDatabase()

        // Get detailed interviews with company and template info
        const interviews = await db.collection("interviews").aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "company"
                }
            },
            {
                $lookup: {
                    from: "templates",
                    localField: "templateId",
                    foreignField: "_id",
                    as: "template"
                }
            },
            {
                $project: {
                    candidateName: 1,
                    candidateEmail: 1,
                    status: 1,
                    score: 1,
                    createdAt: 1,
                    startedAt: 1,
                    completedAt: 1,
                    companyName: { $arrayElemAt: ["$company.companyName", 0] },
                    templateName: { $arrayElemAt: ["$template.title", 0] }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 100
            }
        ]).toArray()

        // Calculate stats
        const totalInterviews = await db.collection("interviews").countDocuments()
        const completedInterviews = await db.collection("interviews").countDocuments({ status: "completed" })
        const inProgressInterviews = await db.collection("interviews").countDocuments({ status: "in-progress" })
        const scheduledInterviews = await db.collection("interviews").countDocuments({ status: "pending" })

        // Calculate average score
        const scoresAggregation = await db.collection("interviews").aggregate([
            { $match: { score: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgScore: { $avg: "$score" } } }
        ]).toArray()

        const avgScore = scoresAggregation.length > 0
            ? Math.round(scoresAggregation[0].avgScore * 10) / 10
            : 0

        const stats = {
            totalInterviews,
            completedInterviews,
            inProgressInterviews,
            scheduledInterviews,
            avgScore,
        }

        // Format interviews for frontend
        const formattedInterviews = interviews.map((interview) => ({
            id: interview._id.toString(),
            candidateName: interview.candidateName,
            candidateEmail: interview.candidateEmail,
            companyName: interview.companyName || 'Unknown Company',
            templateName: interview.templateName || 'Unknown Template',
            status: interview.status,
            score: interview.score,
            scheduledDate: interview.createdAt,
            duration: interview.completedAt && interview.startedAt
                ? `${Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / (1000 * 60))} min`
                : '-'
        }))

        return NextResponse.json({
            interviews: formattedInterviews,
            stats
        })
    } catch (error) {
        console.error("Error fetching interviews data:", error)
        return NextResponse.json(
            { error: "Failed to fetch interviews data" },
            { status: 500 }
        )
    }
}