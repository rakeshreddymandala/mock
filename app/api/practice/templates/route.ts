import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"

// GET - Retrieve available practice templates
export async function GET(request: NextRequest) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const db = await getDatabase()

        // Get query parameters
        const url = new URL(request.url)
        const difficulty = url.searchParams.get('difficulty')
        const category = url.searchParams.get('category')
        const duration = url.searchParams.get('duration')
        const search = url.searchParams.get('search')
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')

        // Get ONLY admin-created templates for students - NO COMPANY TEMPLATES
        const adminTemplatesCollection = db.collection("admin_templates")
        const adminTemplates = await adminTemplatesCollection
            .find({
                targetRole: "student",
                isActive: true
            })
            .toArray()

        // Apply search filter to admin templates if needed
        const filteredAdminTemplates = search
            ? adminTemplates.filter(template =>
                template.title.toLowerCase().includes(search.toLowerCase()) ||
                (template.description && template.description.toLowerCase().includes(search.toLowerCase())) ||
                (template.questions && template.questions.some((q: any) =>
                    q.question.toLowerCase().includes(search.toLowerCase())
                ))
            )
            : adminTemplates

        // Apply other filters to admin templates
        const processedAdminTemplates = filteredAdminTemplates.filter(template => {
            if (difficulty && template.difficulty !== difficulty) return false
            if (category && template.category !== category) return false
            if (duration && template.estimatedDuration > parseInt(duration)) return false
            return true
        })

        // Format ONLY student role templates for practice
        const allTemplates = processedAdminTemplates.map(template => ({
            _id: template._id,
            title: template.title,
            description: template.description,
            estimatedDuration: template.estimatedDuration || 30,
            difficulty: template.difficulty || 'intermediate',
            category: template.category || 'Student Practice',
            questions: template.questions || [],
            questionCount: template.questions?.length || 0,
            createdAt: template.createdAt,
            companyName: 'HumaneQ HR System',
            isPublic: true,
            practiceAllowed: true,
            agentId: template.agentId,
            source: 'admin'
        }))

        // Sort templates by creation date
        allTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Apply pagination to results
        const skip = (page - 1) * limit
        const paginatedTemplates = allTemplates.slice(skip, skip + limit)
        const totalCount = allTemplates.length

        // Get student quota information
        const studentsCollection = db.collection("students")
        const studentDoc = await studentsCollection.findOne({
            email: student.email
        })

        const practiceStats = studentDoc ? {
            practiceUsed: studentDoc.practiceUsed || 0,
            practiceQuota: studentDoc.practiceQuota || 10,
            remainingSessions: (studentDoc.practiceQuota || 10) - (studentDoc.practiceUsed || 0)
        } : {
            practiceUsed: 0,
            practiceQuota: 10,
            remainingSessions: 10
        }

        return NextResponse.json({
            templates: paginatedTemplates,
            practiceStats,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        })

    } catch (error) {
        console.error("Get practice templates error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// GET specific template details for practice
export async function POST(request: NextRequest) {
    try {
        // Authenticate student
        const student = await getCurrentStudent()
        if (!student) {
            return NextResponse.json({
                error: "Authentication required"
            }, { status: 401 })
        }

        const { templateId } = await request.json()

        if (!templateId) {
            return NextResponse.json({
                error: "Template ID is required"
            }, { status: 400 })
        }

        // Validate ObjectId
        if (!ObjectId.isValid(templateId)) {
            return NextResponse.json({
                error: "Invalid template ID"
            }, { status: 400 })
        }

        const db = await getDatabase()

        // Try to find ONLY in admin templates for students - NO COMPANY TEMPLATES
        const template = await db.collection("admin_templates").findOne({
            _id: new ObjectId(templateId),
            targetRole: "student",
            isActive: true
        })

        if (!template) {
            return NextResponse.json({
                error: "Template not found or not available for practice"
            }, { status: 404 })
        }

        // Return full template details for practice session
        return NextResponse.json({
            template: {
                id: template._id,
                title: template.title,
                description: template.description,
                questions: template.questions,
                estimatedDuration: template.estimatedDuration,
                difficulty: template.difficulty || 'intermediate',
                category: template.category || 'general',
                agentId: template.agentId,
                createdAt: template.createdAt
            }
        })

    } catch (error) {
        console.error("Get template details error:", error)
        return NextResponse.json({
            error: "An unexpected error occurred"
        }, { status: 500 })
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}