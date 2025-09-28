import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Get all templates with real-time data
export async function GET() {
    try {
        const db = await getDatabase()

        // Get both admin_templates and regular templates
        const [adminTemplates, companyTemplates] = await Promise.all([
            db.collection("admin_templates").find({}).sort({ createdAt: -1 }).toArray(),
            db.collection("templates").aggregate([
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
                        from: "interviews",
                        localField: "_id",
                        foreignField: "templateId",
                        as: "interviews"
                    }
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        isActive: 1,
                        agentId: 1,
                        difficulty: 1,
                        category: 1,
                        estimatedDuration: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        companyName: { $arrayElemAt: ["$company.companyName", 0] },
                        usageCount: { $size: "$interviews" }
                    }
                },
                { $sort: { createdAt: -1 } }
            ]).toArray()
        ])

        // Combine and format templates
        const allTemplates = [
            ...adminTemplates.map(template => ({
                id: template._id.toString(),
                title: template.title,
                description: template.description || '',
                companyName: 'Admin Template',
                type: 'admin' as const,
                isActive: template.isActive,
                hasAgent: !!template.agentId,
                agentId: template.agentId,
                difficulty: template.difficulty || 'intermediate',
                category: template.targetRole || 'General',
                estimatedDuration: 45,
                usageCount: template.usageCount || 0,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            })),
            ...companyTemplates.map(template => ({
                id: template._id.toString(),
                title: template.title,
                description: template.description || '',
                companyName: template.companyName || 'Unknown Company',
                type: 'company' as const,
                isActive: template.isActive,
                hasAgent: !!template.agentId,
                agentId: template.agentId,
                difficulty: template.difficulty || 'intermediate',
                category: template.category || 'General',
                estimatedDuration: template.estimatedDuration || 45,
                usageCount: template.usageCount || 0,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            }))
        ]

        // Calculate stats
        const totalTemplates = allTemplates.length
        const activeTemplates = allTemplates.filter(t => t.isActive).length
        const templatesWithAgents = allTemplates.filter(t => t.hasAgent).length

        const stats = {
            totalTemplates,
            activeTemplates,
            templatesWithAgents,
            templatesWithoutAgents: totalTemplates - templatesWithAgents,
        }

        return NextResponse.json({
            templates: allTemplates,
            stats
        })
    } catch (error) {
        console.error("Error fetching templates data:", error)
        return NextResponse.json(
            { error: "Failed to fetch templates data" },
            { status: 500 }
        )
    }
}

// PATCH - Attach agent to template
export async function PATCH(request: NextRequest) {
    try {
        const { templateId, agentId, templateType } = await request.json()

        if (!templateId || !agentId || !templateType) {
            return NextResponse.json(
                { error: "Missing required fields: templateId, agentId, templateType" },
                { status: 400 }
            )
        }

        const db = await getDatabase()
        const collectionName = templateType === 'admin' ? 'admin_templates' : 'templates'

        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(templateId) },
            {
                $set: {
                    agentId,
                    updatedAt: new Date()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Template not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Agent attached successfully"
        })
    } catch (error) {
        console.error("Error attaching agent to template:", error)
        return NextResponse.json(
            { error: "Failed to attach agent" },
            { status: 500 }
        )
    }
}