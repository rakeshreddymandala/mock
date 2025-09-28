import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import {
    authenticateGeneralUser,
    createErrorResponse,
    createSuccessResponse
} from "@/lib/utils/generalAuth"
import {
    fetchAndSaveAudio,
    fetchTranscript,
    deleteConversation
} from "@/lib/utils/elevenlabs"
import { processTranscriptAnalysis } from "@/lib/utils/interviewAnalysis"

// GET - Fetch interview data for general users
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const authUser = await authenticateGeneralUser(request)

        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const db = await getDatabase()

        // Find interview session by session ID for general users
        const interviewSession = await db.collection("general_interview_sessions").findOne({
            sessionId: id,
            generalUserId: authUser.userId
        })

        if (!interviewSession) {
            console.log(`❌ General interview session not found with ID: ${id}`)
            return createErrorResponse("Interview session not found", 404)
        }

        console.log(`✅ General interview session found:`, {
            sessionId: interviewSession.sessionId,
            userId: interviewSession.generalUserId,
            templateId: interviewSession.templateId,
            status: interviewSession.status
        })

        // Check if the interview is already completed
        if (interviewSession.status === "completed") {
            return createErrorResponse("This interview has already been completed.", 400)
        }

        // Get template - for general users, we'll look in public templates or general templates
        const template = await db.collection("general_templates").findOne({
            _id: new ObjectId(interviewSession.templateId)
        })

        if (!template) {
            console.log(`❌ General template not found with ID: ${interviewSession.templateId}`)
            return createErrorResponse("Interview template not found", 404)
        }

        console.log(`✅ General template found: ${template.title}`)

        // For general users, company name comes from template metadata
        const companyName = template.companyName || "HumaneQ Practice"

        // Get full user data for name info
        const userData = await db.collection("general_users").findOne({
            _id: new ObjectId(authUser.userId)
        })

        const candidateName = interviewSession.candidateName ||
            (userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : 'General User')

        const response = {
            interview: {
                _id: interviewSession._id,
                candidateName,
                candidateEmail: authUser.email,
                uniqueLink: interviewSession.sessionId,
                status: interviewSession.status,
                responses: interviewSession.responses || [],
                createdAt: interviewSession.createdAt,
                updatedAt: interviewSession.updatedAt,
                analysis: interviewSession.analysis,
                finalScore: interviewSession.finalScore,
                metadata: {
                    sessionType: 'general',
                    userType: 'general',
                    userId: authUser.userId
                }
            },
            template,
            companyName,
            analysis: interviewSession.analysis,
            finalScore: interviewSession.finalScore
        }

        console.log(`✅ Sending general interview data for user: ${authUser.userId}`)
        return NextResponse.json(response)
    } catch (error) {
        console.error("Get general interview error:", error)
        return createErrorResponse("Internal server error", 500)
    }
}

// PATCH - Update interview status and data for general users
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const authUser = await authenticateGeneralUser(request)

        if (!authUser) {
            return createErrorResponse('Unauthorized', 401)
        }

        const { status, responses, score, conversationId } = await request.json()

        console.log(`🔄 Updating general interview with session ID: ${id}, status: ${status}`)

        const db = await getDatabase()
        const updateData: any = {
            updatedAt: new Date(),
        }

        if (status) updateData.status = status
        if (responses) updateData.responses = responses
        if (score !== undefined) updateData.finalScore = score

        if (conversationId) {
            updateData.conversationId = conversationId

            // Fetch and save audio file for general users
            console.log(`Fetching audio for general interview conversation ID: ${conversationId}`)
            const audioResult = await fetchAndSaveAudio(conversationId)

            if (audioResult.localPath) {
                console.log(`General interview audio file saved locally at: ${audioResult.localPath}`)
                updateData.audio = audioResult.localPath

                if (audioResult.s3Url) {
                    console.log(`General interview audio file saved to S3 at: ${audioResult.s3Url}`)
                    updateData.audioS3 = audioResult.s3Url
                }
            } else {
                console.error(`Failed to fetch audio for general interview conversation ID: ${conversationId}`)
            }

            // Fetch transcript with retries for general users
            let transcript = null
            let retryCount = 0
            const maxRetries = 30
            const retryDelay = 2000

            console.log(`📝 Attempting to fetch transcript for general interview...`)
            while (!transcript && retryCount < maxRetries) {
                try {
                    const transcriptResult = await fetchTranscript(conversationId)
                    if (transcriptResult && transcriptResult.length > 0) {
                        transcript = transcriptResult
                        console.log(`✅ General interview transcript fetched successfully after ${retryCount + 1} attempts`)
                        break
                    }
                } catch (transcriptError) {
                    console.log(`⏳ General interview transcript not ready, attempt ${retryCount + 1}/${maxRetries}`)
                }

                retryCount++
                if (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay))
                }
            }

            if (transcript) {
                updateData.transcript = transcript
                console.log(`📝 General interview transcript saved with ${transcript.length} segments`)

                // Process analysis for general users
                try {
                    const analysisResult = await processTranscriptAnalysis(transcript)
                    if (analysisResult) {
                        updateData.analysis = analysisResult.analysis
                        updateData.finalScore = analysisResult.finalScore
                        console.log(`🎯 General interview analysis completed with score: ${analysisResult.finalScore}`)
                    }
                } catch (analysisError) {
                    console.error("General interview analysis error:", analysisError)
                }
            } else {
                console.error(`❌ Failed to fetch general interview transcript after ${maxRetries} attempts`)
            }

            // Clean up ElevenLabs conversation for general users
            try {
                await deleteConversation(conversationId)
                console.log(`🗑️ General interview conversation ${conversationId} deleted from ElevenLabs`)
            } catch (deleteError) {
                console.error(`❌ Failed to delete general interview conversation ${conversationId}:`, deleteError)
            }
        }

        // Update the interview session in general collection
        const result = await db.collection("general_interview_sessions").findOneAndUpdate(
            {
                sessionId: id,
                generalUserId: authUser.userId
            },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        if (!result) {
            console.log(`❌ General interview session not found or unauthorized: ${id}`)
            return createErrorResponse("Interview session not found or unauthorized", 404)
        }

        // Update general user quota if interview is completed
        if (status === 'completed') {
            await db.collection("general_users").updateOne(
                { _id: new ObjectId(authUser.userId) },
                {
                    $inc: { interviewsUsed: 1 },
                    $set: { lastInterviewAt: new Date() }
                }
            )
            console.log(`📊 Updated general user interview quota`)
        }

        console.log(`✅ General interview session updated successfully: ${id}`)
        return NextResponse.json({
            success: true,
            interview: result,
            message: "Interview updated successfully"
        })

    } catch (error) {
        console.error("❌ Update general interview error:", error)
        return createErrorResponse("Internal server error", 500)
    }
}