import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await getDatabase()

        // Get total companies
        const totalCompanies = await db.collection("users").countDocuments({ role: "company" })

        // Get total interviews
        const totalInterviews = await db.collection("interviews").countDocuments({})

        // Get active interviews (pending or in-progress)
        const activeInterviews = await db.collection("interviews").countDocuments({
            status: { $in: ["pending", "in-progress"] }
        })

        // Get active agents count (templates with agentId)
        const activeAgents = await db.collection("templates").countDocuments({
            $and: [
                { agentId: { $exists: true } },
                { agentId: { $ne: null } },
                { agentId: { $ne: "" } }
            ]
        })

        const stats = {
            totalCompanies,
            totalInterviews,
            activeInterviews,
            activeAgents,
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Get admin stats error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}