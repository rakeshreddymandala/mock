import { type NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import {
    authenticateGeneralUser,
    createErrorResponse,
    createSuccessResponse,
    generateSessionId
} from "@/lib/utils/generalAuth"

// GET - Fetch public interview templates for general users (from company templates)
export async function GET(request: NextRequest) {
    try {
        const authUser = await authenticateGeneralUser(request)
        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const db = await getDatabase()

        // Get ONLY admin-created templates for general users - NO OTHER TEMPLATES
        const adminTemplates = await db.collection("admin_templates").find({
            targetRole: "general",
            isActive: true
        }).toArray()

        // Format admin templates - ONLY general role templates
        const formattedTemplates = adminTemplates.map(template => ({
            id: template._id.toString(),
            title: template.title,
            description: template.description,
            companyName: 'HumaneQ HR System',
            duration: template.estimatedDuration || 30,
            difficulty: template.difficulty || 'intermediate',
            skills: template.skills || [],
            category: template.category || 'General Practice',
            questionsCount: template.questions ? template.questions.length : 0,
            isPublic: true,
            createdAt: template.createdAt,
            agentId: template.agentId,
            source: 'admin'
        }))

        return createSuccessResponse({
            templates: formattedTemplates,
            total: formattedTemplates.length,
            message: formattedTemplates.length === 0 ? 'No public templates available yet' : 'Templates loaded successfully'
        })

    } catch (error) {
        console.error('Fetch general templates error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}

// POST - Start a new interview session with a template
export async function POST(request: NextRequest) {
    try {
        const authUser = await authenticateGeneralUser(request)
        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const body = await request.json()
        const { templateId, scheduledAt } = body

        if (!templateId) {
            return createErrorResponse('Template ID is required', 400)
        }

        const db = await getDatabase()

        // Get user data for quota checking
        const userData = await db.collection("generalusers").findOne({
            _id: new ObjectId(authUser.userId)
        })

        if (!userData) {
            return createErrorResponse('User data not found', 404)
        }

        // Check quota limits for non-premium users
        if (userData.subscriptionTier !== 'premium') {
            const quotaUsed = userData.interviewsUsed || 0
            const quotaLimit = userData.interviewQuota || 20

            if (quotaUsed >= quotaLimit) {
                return createErrorResponse(`Interview quota exceeded (${quotaUsed}/${quotaLimit}). Please upgrade to premium for unlimited interviews.`, 400)
            }
        }

        // Verify template exists and is public
        const template = await db.collection("templates").findOne({
            _id: new ObjectId(templateId),
            isActive: true,
            allowPublicAccess: true
        })

        if (!template) {
            return createErrorResponse('Interview template not found or not accessible', 404)
        }

        // Generate unique session ID for general users
        const sessionId = generateSessionId()

        // Create interview session
        const newSession = {
            userId: authUser.userId,
            templateId: templateId,
            sessionId: sessionId,
            templateTitle: template.title,
            companyName: template.companyName || 'Anonymous Company',
            candidateName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'General User',
            candidateEmail: authUser.email,
            status: scheduledAt ? 'scheduled' : 'pending',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            duration: 0,
            responses: [],
            analysis: null,
            finalScore: null,
            metadata: {
                sessionType: 'general',
                userType: 'general',
                userId: authUser.userId,
                templateCategory: template.category
            }
        }

        await db.collection("general_interview_sessions").insertOne(newSession)

        // Update user's interview quota usage
        await db.collection("generalusers").updateOne(
            { _id: new ObjectId(authUser.userId) },
            {
                $inc: { interviewsUsed: 1 },
                $set: { updatedAt: new Date() }
            }
        )

        console.log(`✅ General interview session created: ${sessionId} for user: ${authUser.userId}`)

        return createSuccessResponse({
            sessionId: sessionId,
            templateTitle: template.title,
            companyName: template.companyName || 'Anonymous Company',
            status: newSession.status,
            interviewUrl: `/interview/${sessionId}`,
            message: scheduledAt ? 'Interview scheduled successfully' : 'Interview session created successfully'
        })

    } catch (error) {
        console.error('Create general interview session error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}