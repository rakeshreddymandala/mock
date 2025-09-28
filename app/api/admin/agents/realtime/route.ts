import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

// GET - Fetch real-time agent data from admin templates
export async function GET() {
    try {
        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        // Get all admin templates with their agent IDs
        const templates = await templatesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        if (templates.length === 0) {
            return NextResponse.json({
                agents: [],
                summary: {
                    totalAgents: 0,
                    activeAgents: 0,
                    failedAgents: 0,
                    placeholderAgents: 0
                }
            })
        }

        // Initialize ElevenLabs client for real-time data
        let elevenlabs = null
        let elevenLabsAvailable = false
        
        try {
            if (process.env.XI_API_KEY) {
                elevenlabs = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY })
                elevenLabsAvailable = true
            }
        } catch (error) {
            console.warn("ElevenLabs client initialization failed:", error instanceof Error ? error.message : String(error))
        }

        // Fetch live agent data from ElevenLabs
        let liveAgents: any[] = []
        if (elevenLabsAvailable && elevenlabs) {
            try {
                // Use the correct API method for listing agents
                const agentsResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
                    headers: {
                        'xi-api-key': process.env.XI_API_KEY || '',
                        'Content-Type': 'application/json'
                    }
                })
                
                if (agentsResponse.ok) {
                    const data = await agentsResponse.json()
                    liveAgents = data.agents || []
                    console.log(`Fetched ${liveAgents.length} live agents from ElevenLabs`)
                } else {
                    console.warn("ElevenLabs API responded with:", agentsResponse.status)
                }
            } catch (error) {
                console.warn("Failed to fetch live agents:", error instanceof Error ? error.message : String(error))
                elevenLabsAvailable = false
            }
        }

        // Process and enrich agent data
        const enrichedAgents = templates.map(template => {
            const agentId = template.agentId
            const isRealAgent = agentId && !agentId.startsWith('agent_') || 
                              (agentId?.startsWith('agent_') && agentId.length > 20)
            const isFailed = agentId?.includes('_failed')
            const isPlaceholder = agentId?.startsWith('agent_') && agentId.length < 20 && !isFailed

            // Find corresponding live agent data
            let liveAgentData = null
            if (isRealAgent && elevenLabsAvailable) {
                liveAgentData = liveAgents.find((agent: any) => agent.agent_id === agentId)
            }

            return {
                // Template data
                templateId: template._id,
                templateTitle: template.title,
                templateDescription: template.description,
                targetRole: template.targetRole,
                questionsCount: template.questions?.length || 0,
                createdAt: template.createdAt,
                usageCount: template.usageCount || 0,
                
                // Agent data
                agentId: agentId,
                agentStatus: template.agentCreationStatus || (isFailed ? 'failed' : isRealAgent ? 'success' : 'placeholder'),
                agentCreationError: template.agentCreationError || null,
                
                // Live ElevenLabs data (if available)
                liveData: liveAgentData ? {
                    name: liveAgentData.name,
                    status: 'active', // Assume active if returned by API
                    conversationsCount: liveAgentData.conversation_count || 0,
                    lastUsed: liveAgentData.last_used || null,
                    model: liveAgentData.model || 'unknown',
                    language: liveAgentData.language || 'en',
                    createdAt: liveAgentData.created_at || null
                } : null,
                
                // Classification
                classification: {
                    isRealAgent,
                    isFailed,
                    isPlaceholder,
                    isActive: isRealAgent && liveAgentData !== null,
                    hasLiveData: liveAgentData !== null
                }
            }
        })

        // Generate summary statistics
        const summary = {
            totalAgents: enrichedAgents.length,
            activeAgents: enrichedAgents.filter(a => a.classification.isActive).length,
            realAgents: enrichedAgents.filter(a => a.classification.isRealAgent).length,
            failedAgents: enrichedAgents.filter(a => a.classification.isFailed).length,
            placeholderAgents: enrichedAgents.filter(a => a.classification.isPlaceholder).length,
            totalConversations: enrichedAgents.reduce((sum, a) => 
                sum + (a.liveData?.conversationsCount || 0), 0),
            elevenLabsConnected: elevenLabsAvailable,
            lastUpdated: new Date().toISOString()
        }

        console.log("Real-time agent data summary:", summary)

        return NextResponse.json({
            agents: enrichedAgents,
            summary
        })

    } catch (error) {
        console.error("Real-time agents API error:", error)
        return NextResponse.json({ 
            error: "Failed to fetch real-time agent data",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}