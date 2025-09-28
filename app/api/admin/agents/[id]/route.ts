import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

// GET - Get individual agent details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        // Get template with agent
        const template = await templatesCollection.findOne({ _id: new ObjectId(id) })
        
        if (!template) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Get live agent data from ElevenLabs
        let liveAgentData = null
        let elevenLabsError = null

        try {
            if (process.env.XI_API_KEY && template.agentId && !template.agentId.includes('_failed')) {
                const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${template.agentId}`, {
                    headers: {
                        'xi-api-key': process.env.XI_API_KEY,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    liveAgentData = await response.json()
                } else {
                    elevenLabsError = `ElevenLabs API responded with ${response.status}`
                }
            }
        } catch (error) {
            elevenLabsError = error instanceof Error ? error.message : "Failed to fetch live data"
        }

        // Get usage statistics from interviews collection
        const interviewsCollection = db.collection("interviews")
        const usageStats = await interviewsCollection.aggregate([
            { 
                $match: { 
                    templateId: new ObjectId(id),
                    status: { $in: ["completed", "in-progress"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInterviews: { $sum: 1 },
                    completedInterviews: { 
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    avgScore: { 
                        $avg: { $cond: [{ $ne: ["$score", null] }, "$score", null] }
                    },
                    lastUsed: { $max: "$createdAt" }
                }
            }
        ]).toArray()

        const stats = usageStats[0] || {
            totalInterviews: 0,
            completedInterviews: 0,
            avgScore: null,
            lastUsed: null
        }

        const agentDetails = {
            // Template data
            templateId: template._id,
            templateTitle: template.title,
            templateDescription: template.description,
            targetRole: template.targetRole,
            questions: template.questions,
            questionsCount: template.questions?.length || 0,
            agentPrompt: template.agentPrompt,
            useCustomPrompt: template.useCustomPrompt,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            isActive: template.isActive,
            
            // Agent data
            agentId: template.agentId,
            agentStatus: template.agentCreationStatus || 'unknown',
            agentCreationError: template.agentCreationError,
            
            // Live ElevenLabs data
            liveData: liveAgentData,
            elevenLabsError,
            
            // Usage statistics
            statistics: {
                totalInterviews: stats.totalInterviews,
                completedInterviews: stats.completedInterviews,
                inProgressInterviews: stats.totalInterviews - stats.completedInterviews,
                averageScore: stats.avgScore ? Math.round(stats.avgScore * 100) / 100 : null,
                lastUsed: stats.lastUsed,
                successRate: stats.totalInterviews > 0 
                    ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100) 
                    : 0
            },
            
            // Classification
            classification: {
                isRealAgent: template.agentId && !template.agentId.startsWith('agent_') || 
                           (template.agentId?.startsWith('agent_') && template.agentId.length > 20),
                isFailed: template.agentId?.includes('_failed'),
                isPlaceholder: template.agentId?.startsWith('agent_') && template.agentId.length < 20,
                isActive: template.isActive && liveAgentData !== null,
                hasLiveData: liveAgentData !== null
            }
        }

        return NextResponse.json({ agent: agentDetails })

    } catch (error) {
        console.error("Get agent details error:", error)
        return NextResponse.json({ 
            error: "Failed to fetch agent details",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

// PUT - Update agent configuration
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const { title, description, questions, agentPrompt, useCustomPrompt, isActive } = await request.json()
        
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        // Check if template exists
        const existingTemplate = await templatesCollection.findOne({ _id: new ObjectId(id) })
        if (!existingTemplate) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Prepare update data
        const updateData: any = {
            updatedAt: new Date()
        }

        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (questions !== undefined) updateData.questions = questions
        if (agentPrompt !== undefined) updateData.agentPrompt = agentPrompt
        if (useCustomPrompt !== undefined) updateData.useCustomPrompt = useCustomPrompt
        if (isActive !== undefined) updateData.isActive = isActive

        // If questions count changed, update questions count
        if (questions) {
            updateData.questionsCount = questions.length
        }

        // Update ElevenLabs agent if prompt changed and agent exists
        let agentUpdateError = null
        if (agentPrompt && existingTemplate.agentId && !existingTemplate.agentId.includes('_failed')) {
            try {
                const elevenlabs = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY })
                
                // Note: ElevenLabs API might not support agent updates
                // This is a placeholder for when the API supports it
                console.log(`Would update ElevenLabs agent ${existingTemplate.agentId} with new prompt`)
                
            } catch (error) {
                console.warn("Failed to update ElevenLabs agent:", error)
                agentUpdateError = error instanceof Error ? error.message : "Failed to update agent"
            }
        }

        // Update template in database
        const result = await templatesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Get updated template
        const updatedTemplate = await templatesCollection.findOne({ _id: new ObjectId(id) })

        return NextResponse.json({
            message: "Agent updated successfully",
            agent: updatedTemplate,
            ...(agentUpdateError && { agentUpdateWarning: agentUpdateError })
        })

    } catch (error) {
        console.error("Update agent error:", error)
        return NextResponse.json({ 
            error: "Failed to update agent",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

// DELETE - Delete agent and template
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        // Get template before deletion
        const template = await templatesCollection.findOne({ _id: new ObjectId(id) })
        
        if (!template) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Check if agent has been used in interviews
        const interviewsCollection = db.collection("interviews")
        const interviewCount = await interviewsCollection.countDocuments({ 
            templateId: new ObjectId(id)
        })

        if (interviewCount > 0) {
            return NextResponse.json({ 
                error: "Cannot delete agent",
                message: `This agent has been used in ${interviewCount} interviews. Delete those first or deactivate the agent instead.`
            }, { status: 409 })
        }

        // Try to delete ElevenLabs agent
        let elevenLabsDeleted = false
        let elevenLabsError = null

        if (template.agentId && !template.agentId.includes('_failed') && process.env.XI_API_KEY) {
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${template.agentId}`, {
                    method: 'DELETE',
                    headers: {
                        'xi-api-key': process.env.XI_API_KEY,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    elevenLabsDeleted = true
                    console.log(`Deleted ElevenLabs agent: ${template.agentId}`)
                } else {
                    elevenLabsError = `Failed to delete ElevenLabs agent: ${response.status}`
                }
            } catch (error) {
                elevenLabsError = error instanceof Error ? error.message : "Failed to delete ElevenLabs agent"
                console.warn("ElevenLabs agent deletion failed:", error)
            }
        }

        // Delete template from database
        const result = await templatesCollection.deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
        }

        return NextResponse.json({
            message: "Agent deleted successfully",
            templateDeleted: true,
            elevenLabsDeleted,
            ...(elevenLabsError && { elevenLabsError })
        })

    } catch (error) {
        console.error("Delete agent error:", error)
        return NextResponse.json({ 
            error: "Failed to delete agent",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}