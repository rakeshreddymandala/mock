import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
    authenticateGeneralUser,
    createErrorResponse,
    createSuccessResponse
} from '@/lib/utils/generalAuth'

// GET - Fetch interview results and analytics for general user
export async function GET(request: NextRequest) {
    try {
        const authUser = await authenticateGeneralUser(request)
        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')
        const skip = (page - 1) * limit

        const db = await getDatabase()

        // Fetch user's completed interview sessions
        const sessions = await db.collection("general_interview_sessions").find({
            userId: authUser.userId,
            status: 'completed'
        })
            .sort({ completedAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray()

        // Fetch all sessions for analytics (not just paginated)
        const allCompletedSessions = await db.collection("general_interview_sessions").find({
            userId: authUser.userId,
            status: 'completed'
        }).toArray()

        // Also get all sessions regardless of status for dashboard
        const allSessions = await db.collection("general_interview_sessions").find({
            userId: authUser.userId
        }).toArray()

        const totalSessions = allCompletedSessions.length

        // Calculate analytics
        const analytics = {
            totalInterviews: allSessions.length,
            completedInterviews: totalSessions,
            averageScore: 0,
            skillsBreakdown: {
                technicalSkills: 0,
                communicationSkills: 0,
                problemSolving: 0,
                culturalFit: 0
            },
            performanceTrend: [] as Array<{ date: Date, score: number, templateTitle: string }>,
            topSkills: [] as Array<{ skill: string, count: number }>,
            improvementAreas: [] as Array<{ area: string, count: number }>
        }

        if (allCompletedSessions.length > 0) {
            // Calculate average scores
            const totalScore = allCompletedSessions.reduce((sum: number, session: any) => sum + (session.finalScore || 0), 0)
            analytics.averageScore = Math.round(totalScore / allCompletedSessions.length)

            // Calculate skills breakdown
            const skillsSum = allCompletedSessions.reduce((sum: any, session: any) => ({
                technicalSkills: sum.technicalSkills + (session.analysis?.technicalSkills || 0),
                communicationSkills: sum.communicationSkills + (session.analysis?.communicationSkills || 0),
                problemSolving: sum.problemSolving + (session.analysis?.problemSolving || 0),
                culturalFit: sum.culturalFit + (session.analysis?.culturalFit || 0)
            }), { technicalSkills: 0, communicationSkills: 0, problemSolving: 0, culturalFit: 0 })

            analytics.skillsBreakdown = {
                technicalSkills: Math.round(skillsSum.technicalSkills / allCompletedSessions.length),
                communicationSkills: Math.round(skillsSum.communicationSkills / allCompletedSessions.length),
                problemSolving: Math.round(skillsSum.problemSolving / allCompletedSessions.length),
                culturalFit: Math.round(skillsSum.culturalFit / allCompletedSessions.length)
            }

            // Performance trend (last 10 sessions)
            analytics.performanceTrend = allCompletedSessions.slice(0, 10).reverse().map((session: any) => ({
                date: session.completedAt,
                score: session.finalScore || 0,
                templateTitle: session.templateTitle
            }))

            // Extract top skills and improvement areas
            const allStrengths = allCompletedSessions.flatMap((session: any) => session.analysis?.strengths || [])
            const allImprovements = allCompletedSessions.flatMap((session: any) => session.analysis?.improvements || [])

            // Count occurrences and get top 5
            const strengthCounts: Record<string, number> = {}
            const improvementCounts: Record<string, number> = {}

            allStrengths.forEach((strength: string) => {
                strengthCounts[strength] = (strengthCounts[strength] || 0) + 1
            })

            allImprovements.forEach((improvement: string) => {
                improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1
            })

            analytics.topSkills = Object.entries(strengthCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([skill, count]) => ({ skill, count: count as number }))

            analytics.improvementAreas = Object.entries(improvementCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([area, count]) => ({ area, count: count as number }))
        }

        // Format sessions for response
        const formattedSessions = allSessions.map((session: any) => ({
            _id: session._id.toString(),
            sessionId: session.sessionId,
            templateTitle: session.templateTitle,
            companyName: session.companyName,
            status: session.status,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            duration: session.duration,
            score: session.finalScore,
            feedback: session.analysis?.feedback || null,
            analysis: session.analysis,
            questionsCount: session.responses?.length || 0
        }))

        return createSuccessResponse({
            sessions: formattedSessions,
            analytics,
            pagination: {
                page,
                limit,
                total: totalSessions,
                pages: Math.ceil(totalSessions / limit)
            }
        })

    } catch (error) {
        console.error('Fetch general results error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}