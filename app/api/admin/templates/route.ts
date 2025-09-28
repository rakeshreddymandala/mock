import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

// GET - Fetch all admin templates
export async function GET() {
    try {
        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        const templates = await templatesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json({ templates })
    } catch (error) {
        console.error("Get admin templates error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Create new admin template
export async function POST(request: NextRequest) {
    try {
        const { title, description, targetRole, questions, useCustomPrompt, agentPrompt } = await request.json()

        if (!title || !targetRole || !questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Validate custom prompt if enabled
        if (useCustomPrompt && !agentPrompt?.trim()) {
            return NextResponse.json({ error: "Custom prompt is required when custom prompt option is enabled" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        // Generate dynamic prompt if not using custom
        const finalAgentPrompt = useCustomPrompt ? agentPrompt : generateDynamicPrompt({
            title,
            description,
            targetRole,
            questions
        })

        // Create real ElevenLabs agent
        let agentId = null
        let agentCreationError = null

        try {
            console.log("Creating ElevenLabs agent for template:", title)
            const elevenlabs = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY })
            
            // Create agent with role-specific configuration
            const agent = await elevenlabs.conversationalAi.agents.create({
                name: `${title} - ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Interview Agent`,
                conversationConfig: {
                    agent: {
                        prompt: {
                            prompt: finalAgentPrompt,
                        },
                    },
                },
            })

            agentId = agent.agentId
            console.log("ElevenLabs agent created successfully:", { agentId, title })
        } catch (error) {
            console.error("Failed to create ElevenLabs agent:", error)
            agentCreationError = error instanceof Error ? error.message : "Unknown error"
            // Use fallback placeholder if agent creation fails
            agentId = `agent_${Date.now()}_failed`
        }

        const newTemplate = {
            title,
            description: description || "",
            targetRole,
            questions,
            agentPrompt: finalAgentPrompt,
            useCustomPrompt: useCustomPrompt || false,
            agentId,
            agentCreationStatus: agentCreationError ? "failed" : "success",
            agentCreationError: agentCreationError || null,
            isActive: true,
            createdBy: "admin", // TODO: Get from auth
            createdByType: "admin",
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await templatesCollection.insertOne(newTemplate)

        const response = {
            message: agentCreationError 
                ? "Template created successfully but ElevenLabs agent creation failed" 
                : "Template and ElevenLabs agent created successfully",
            template: { ...newTemplate, _id: result.insertedId },
            agentCreated: !agentCreationError,
            ...(agentCreationError && { agentError: agentCreationError })
        }

        return NextResponse.json(response, { 
            status: agentCreationError ? 201 : 200 
        })
    } catch (error) {
        console.error("Error creating admin template:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// Dynamic prompt generator function
function generateDynamicPrompt(template: {
    title: string
    description?: string
    targetRole: string
    questions: string[]
}) {
    const roleContext = {
        company: "You are Sarah, a professional, warm, and empathetic AI interviewer conducting a company interview",
        student: "You are Sarah, a friendly and encouraging AI interviewer assessing a student's potential and learning journey",
        general: "You are Sarah, a professional AI interviewer conducting a comprehensive general assessment"
    }[template.targetRole] || "You are Sarah, a professional AI interviewer"

    const questionsText = template.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n')

    return `${roleContext} for: ${template.title}

${template.description ? `Interview Purpose: ${template.description}\n` : ''}

🎯 INTERVIEW FLOW (FOLLOW EXACTLY IN ORDER):

PHASE 1: INTRODUCTION & WARM-UP (3-4 minutes)
Start with a proper introduction and build rapport:

1. INTRODUCTION: "Hello! I'm Sarah, your AI interviewer, and I'm genuinely excited to meet you today. Thank you for taking the time to speak with me. I want this to feel like a natural, relaxed conversation where you can really showcase your amazing qualities. How are you feeling today?"

2. PERSONAL INTRODUCTION: "Wonderful! Let's start with getting to know you better. Could you please introduce yourself and tell me what initially sparked your interest in this opportunity?"

3. TRANSITION: "Thank you for that great introduction! Now I'd love to dive deeper into your experience and explore some specific areas."

PHASE 2: STRUCTURED INTERVIEW QUESTIONS
Proceed with these specific questions in order:
${questionsText}

🎨 CONVERSATION STYLE:
- Be genuinely warm, professional, and conversational
- Use the candidate's name once you learn it
- Show authentic interest with phrases like "That's fascinating!" or "I can see why that would be meaningful"
- Create smooth, natural transitions between questions
- Give brief acknowledgments (1-2 sentences) that show you're listening

⏰ TIMING PROTOCOL:
- Your responses: 10-15 seconds maximum
- Allow natural pauses - don't rush
- Main questions: 2-3 minutes each for candidate response
- If candidate seems nervous: "Take your time! There's no rush at all."

🚫 IMPORTANT BOUNDARIES:
- Do NOT skip the introduction phase
- Do NOT provide interview advice during the process  
- Do NOT discuss company details beyond the questions
- Do NOT give performance feedback during the interview

Remember: Create a memorable, positive interview experience that makes candidates feel valued while gathering essential information.`
}