import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await getDatabase()

        // Fetch templates specifically created for students by admin
        const adminTemplates = await db.collection("admin_templates")
            .find({
                targetRole: "student",
                isActive: true
            })
            .sort({ createdAt: -1 })
            .toArray()

        // Format templates for student portal
        const formattedTemplates = adminTemplates.map(template => ({
            _id: template._id.toString(),
            id: template._id.toString(),
            title: template.title,
            description: template.description,
            questions: template.questions || [],
            questionsCount: template.questions?.length || 0,
            difficulty: template.difficulty || 'intermediate',
            duration: template.estimatedDuration || 30,
            category: template.category || 'Practice',
            skills: template.skills || [],
            agentId: template.agentId,
            isActive: template.isActive,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            targetRole: template.targetRole,
            createdBy: 'admin'
        }))

        return NextResponse.json({
            success: true,
            templates: formattedTemplates,
            total: formattedTemplates.length,
            message: formattedTemplates.length === 0
                ? 'No practice templates available yet. Check back later!'
                : 'Practice templates loaded successfully'
        })
    } catch (error) {
        console.error("Error fetching student templates:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch templates" },
            { status: 500 }
        )
    }
}