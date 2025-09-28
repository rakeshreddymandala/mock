import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
    authenticateGeneralUser,
    createErrorResponse,
    createSuccessResponse
} from '@/lib/utils/generalAuth'

// GET - Fetch user's interview sessions
export async function GET(request: NextRequest) {
    try {
        const authUser = await authenticateGeneralUser(request)
        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const db = await getDatabase()

        // Get all interview sessions for this user
        const sessions = await db.collection("general_interview_sessions")
            .find({ generalUserId: authUser.userId })
            .sort({ createdAt: -1 })
            .toArray()

        // Format sessions for response
        const formattedSessions = sessions.map(session => ({
            _id: session._id.toString(),
            sessionId: session.sessionId,
            templateTitle: session.templateTitle,
            companyName: session.companyName,
            status: session.status,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            startedAt: session.startedAt,
            completedAt: session.completedAt,
            score: session.finalScore,
            feedback: session.analysis?.feedback || null,
            duration: session.duration || 0
        }))

        return createSuccessResponse({
            sessions: formattedSessions,
            total: formattedSessions.length
        })

    } catch (error) {
        console.error('Fetch general interview sessions error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}

// PATCH - Update interview session status
export async function PATCH(request: NextRequest) {
    try {
        const authUser = await authenticateGeneralUser(request)
        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const body = await request.json()
        const { sessionId, status } = body

        if (!sessionId) {
            return createErrorResponse('Session ID is required', 400)
        }

        const db = await getDatabase()

        const updateData: any = {
            updatedAt: new Date()
        }

        if (status === 'in-progress') {
            updateData.status = 'in-progress'
            updateData.startedAt = new Date()
        } else if (status) {
            updateData.status = status
        }

        // Update the session
        const result = await db.collection("general_interview_sessions").findOneAndUpdate(
            {
                sessionId: sessionId,
                generalUserId: authUser.userId
            },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            return createErrorResponse('Interview session not found or unauthorized', 404)
        }

        return createSuccessResponse({
            session: result,
            message: 'Interview session updated successfully'
        })

    } catch (error) {
        console.error('Update general interview session error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}