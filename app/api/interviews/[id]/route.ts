import { type NextRequest, NextResponse } from "next/server"
import {
  findInterview,
  updateInterview,
  getTemplate,
  getCompanyName,
  updateQuotaForCompletion
} from "@/lib/utils/interviewDb"
import {
  fetchAndSaveAudio,
  fetchTranscript,
  deleteConversation
} from "@/lib/utils/elevenlabs"
import { processTranscriptAnalysis } from "@/lib/utils/interviewAnalysis"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const interview = await findInterview(id)
    if (!interview) {
      console.log(`❌ Interview not found with ID: ${id}`)
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    console.log(`✅ Interview found:`, {
      id: interview._id,
      candidateName: interview.candidateName,
      templateId: interview.templateId,
      status: interview.status,
      sessionType: interview.metadata?.sessionType
    })

    // Check if the interview is already completed
    if (interview.status === "completed") {
      return NextResponse.json({ error: "This interview has already been completed." }, { status: 400 })
    }

    // Get template
    const template = await getTemplate(interview.templateId)
    if (!template) {
      console.log(`❌ Template not found with ID: ${interview.templateId}`)
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    console.log(`✅ Template found: ${template.title}`)

    // Get company name
    const companyName = await getCompanyName(interview)

    // Include analysis and finalScore in the response
    const response = {
      interview,
      template,
      companyName,
      analysis: interview.analysis,
      finalScore: interview.finalScore
    }

    console.log(`✅ Sending interview data for: ${interview.candidateName}`)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Get interview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, responses, score, conversationId } = await request.json()

    console.log(`🔄 Updating interview with ID: ${id}, status: ${status}`)

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (responses) updateData.responses = responses
    if (score !== undefined) updateData.score = score

    if (conversationId) {
      updateData.conversationId = conversationId

      // Fetch and save audio file
      console.log(`Fetching audio for conversation ID: ${conversationId}`)
      const audioResult = await fetchAndSaveAudio(conversationId)
      if (audioResult.localPath) {
        console.log(`Audio file saved locally at: ${audioResult.localPath}`)
        updateData.audio = audioResult.localPath

        if (audioResult.s3Url) {
          console.log(`Audio file saved to S3 at: ${audioResult.s3Url}`)
          updateData.audioS3 = audioResult.s3Url
        }
      } else {
        console.error(`Failed to fetch audio for conversation ID: ${conversationId}`)
      }

      // Fetch transcript with retries
      const transcript = await fetchTranscript(conversationId)
      if (transcript) {
        updateData.transcript = transcript

        try {
          // Process transcript and generate analysis
          const analysisResult = await processTranscriptAnalysis(transcript)
          updateData.analysis = analysisResult.analysis
          updateData.finalScore = analysisResult.finalScore
        } catch (error) {
          console.error("Error processing transcript analysis:", error)
          throw new Error("Invalid transcript format or analysis failed")
        }
      }

      // Delete the conversation from ElevenLabs
      console.log(`Deleting conversation ID: ${conversationId}`)
      const isDeleted = await deleteConversation(conversationId)
      if (isDeleted) {
        console.log(`Conversation ${conversationId} successfully deleted from ElevenLabs.`)
      } else {
        console.error(`Failed to delete conversation ${conversationId} from ElevenLabs.`)
      }
    }

    // Find the interview first to check if it's a student practice session
    const interview = await findInterview(id)

    if (status === "completed") {
      updateData.completedAt = new Date()

      if (interview) {
        await updateQuotaForCompletion(interview)
      }
    }

    if (status === "in-progress" && !updateData.startedAt) {
      updateData.startedAt = new Date()
    }

    // Update the interview
    const result = await updateInterview(id, updateData)

    // If nothing was matched, return 404
    if (result.matchedCount === 0) {
      console.error(`No interview found to update for ID: ${id}`)
      return NextResponse.json({ error: "Interview not found for update" }, { status: 404 })
    }

    // Fetch the updated interview document
    const updatedInterview = await findInterview(id)

    console.log(`✅ Interview updated successfully: ${id}`)
    return NextResponse.json(
      {
        success: true,
        message: "Interview updated successfully",
        updatedInterview,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Patch interview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
