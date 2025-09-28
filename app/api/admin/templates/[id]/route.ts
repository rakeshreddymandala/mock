import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch single admin template
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        const template = await templatesCollection.findOne({
            _id: new ObjectId(params.id)
        })

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }

        return NextResponse.json({ template })
    } catch (error) {
        console.error("Get admin template error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH - Update admin template
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { title, description, targetRole, questions } = await request.json()

        if (!title || !targetRole || !questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        const updateData = {
            title,
            description: description || "",
            targetRole,
            questions,
            updatedAt: new Date(),
        }

        const result = await templatesCollection.updateOne(
            { _id: new ObjectId(params.id) },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Template updated successfully" })
    } catch (error) {
        console.error("Error updating admin template:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - Delete admin template
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        const result = await templatesCollection.deleteOne({
            _id: new ObjectId(params.id)
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Template deleted successfully" })
    } catch (error) {
        console.error("Error deleting admin template:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}