import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

interface AgentData {
    _id: string
    agentId: string
    templateId: string
    templateTitle: string
    userType: "company" | "student" | "general"
    companyName?: string
    status: "active" | "inactive"
    createdAt: Date
}

export async function GET(request: NextRequest) {
    try {
        await client.connect()
        const db = client.db("humaneq-hr")

        // Aggregate agents data from templates
        const agentsData = await db.collection("templates").aggregate([
            // Only include templates that have agentId
            {
                $match: {
                    $and: [
                        { agentId: { $exists: true } },
                        { agentId: { $ne: null } },
                        { agentId: { $ne: "" } }
                    ]
                }
            },

            // Lookup company data if companyId exists
            {
                $lookup: {
                    from: "users",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "company"
                }
            },

            // Project the fields we need
            {
                $project: {
                    agentId: 1,
                    templateTitle: "$title",
                    templateId: "$_id",
                    userType: {
                        $cond: {
                            if: { $ifNull: ["$companyId", false] },
                            then: "company",
                            else: "general"
                        }
                    },
                    companyName: {
                        $cond: {
                            if: { $gt: [{ $size: "$company" }, 0] },
                            then: { $arrayElemAt: ["$company.companyName", 0] },
                            else: null
                        }
                    },
                    status: "active",
                    createdAt: 1
                }
            },

            // Sort by creation date
            { $sort: { createdAt: -1 } }
        ]).toArray()

        // Count agents by type
        const stats = {
            totalAgents: agentsData.length,
            companyAgents: agentsData.filter(agent => agent.userType === "company").length,
            studentAgents: agentsData.filter(agent => agent.userType === "student").length,
            generalAgents: agentsData.filter(agent => agent.userType === "general").length
        }

        return NextResponse.json({
            success: true,
            agents: agentsData,
            stats
        })

    } catch (error) {
        console.error("Error fetching agents:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch agents" },
            { status: 500 }
        )
    } finally {
        await client.close()
    }
}