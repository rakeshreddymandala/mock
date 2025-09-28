import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// POST - Perform bulk operations on agents
export async function POST(request: NextRequest) {
    try {
        const { operation, agentIds, data } = await request.json()

        if (!operation || !Array.isArray(agentIds) || agentIds.length === 0) {
            return NextResponse.json({ 
                error: "Missing required fields",
                details: "operation and agentIds array are required"
            }, { status: 400 })
        }

        // Validate agent IDs
        const validAgentIds = agentIds.filter(id => ObjectId.isValid(id))
        if (validAgentIds.length !== agentIds.length) {
            return NextResponse.json({ 
                error: "Invalid agent IDs found",
                details: "All agent IDs must be valid ObjectIds"
            }, { status: 400 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection("admin_templates")

        let result: any = { 
            operation,
            requestedCount: agentIds.length,
            processedCount: 0,
            successCount: 0,
            failedCount: 0,
            results: []
        }

        switch (operation) {
            case 'activate':
                const activateResult = await templatesCollection.updateMany(
                    { _id: { $in: validAgentIds.map(id => new ObjectId(id)) } },
                    { 
                        $set: { 
                            isActive: true, 
                            updatedAt: new Date() 
                        } 
                    }
                )
                
                result.processedCount = activateResult.matchedCount
                result.successCount = activateResult.modifiedCount
                result.message = `Activated ${result.successCount} agents`
                break

            case 'deactivate':
                const deactivateResult = await templatesCollection.updateMany(
                    { _id: { $in: validAgentIds.map(id => new ObjectId(id)) } },
                    { 
                        $set: { 
                            isActive: false, 
                            updatedAt: new Date() 
                        } 
                    }
                )
                
                result.processedCount = deactivateResult.matchedCount
                result.successCount = deactivateResult.modifiedCount
                result.message = `Deactivated ${result.successCount} agents`
                break

            case 'delete':
                // Check if any agents have been used in interviews
                const interviewsCollection = db.collection("interviews")
                const agentsWithInterviews = await interviewsCollection.aggregate([
                    {
                        $match: {
                            templateId: { $in: validAgentIds.map(id => new ObjectId(id)) }
                        }
                    },
                    {
                        $group: {
                            _id: "$templateId",
                            interviewCount: { $sum: 1 }
                        }
                    }
                ]).toArray()

                const usedAgentIds = agentsWithInterviews.map(item => item._id.toString())
                const safeToDeleteIds = validAgentIds.filter(id => !usedAgentIds.includes(id))

                if (safeToDeleteIds.length === 0) {
                    return NextResponse.json({
                        error: "Cannot delete agents",
                        message: "All selected agents have been used in interviews",
                        agentsWithInterviews: agentsWithInterviews.map(item => ({
                            agentId: item._id,
                            interviewCount: item.interviewCount
                        }))
                    }, { status: 409 })
                }

                // Delete agents that haven't been used
                const deleteResult = await templatesCollection.deleteMany(
                    { _id: { $in: safeToDeleteIds.map(id => new ObjectId(id)) } }
                )

                result.processedCount = safeToDeleteIds.length
                result.successCount = deleteResult.deletedCount
                result.failedCount = validAgentIds.length - safeToDeleteIds.length
                result.message = `Deleted ${result.successCount} agents. ${result.failedCount} agents skipped (have interviews)`
                
                if (result.failedCount > 0) {
                    result.warnings = agentsWithInterviews.map(item => ({
                        agentId: item._id,
                        reason: `Cannot delete - has ${item.interviewCount} interviews`
                    }))
                }
                break

            case 'update_role':
                if (!data?.targetRole) {
                    return NextResponse.json({ 
                        error: "Missing target role for update operation" 
                    }, { status: 400 })
                }

                const updateRoleResult = await templatesCollection.updateMany(
                    { _id: { $in: validAgentIds.map(id => new ObjectId(id)) } },
                    { 
                        $set: { 
                            targetRole: data.targetRole, 
                            updatedAt: new Date() 
                        } 
                    }
                )
                
                result.processedCount = updateRoleResult.matchedCount
                result.successCount = updateRoleResult.modifiedCount
                result.message = `Updated role to ${data.targetRole} for ${result.successCount} agents`
                break

            case 'regenerate_failed':
                // Find failed agents
                const failedAgents = await templatesCollection.find({
                    _id: { $in: validAgentIds.map(id => new ObjectId(id)) },
                    $or: [
                        { agentId: { $regex: /_failed$/ } },
                        { agentCreationStatus: "failed" }
                    ]
                }).toArray()

                result.processedCount = failedAgents.length
                result.results = []

                // TODO: Implement agent regeneration logic here
                // This would involve calling ElevenLabs API to create new agents
                result.message = `Found ${failedAgents.length} failed agents. Regeneration feature coming soon.`
                result.successCount = 0
                result.failedCount = failedAgents.length
                break

            default:
                return NextResponse.json({ 
                    error: "Invalid operation",
                    allowedOperations: ["activate", "deactivate", "delete", "update_role", "regenerate_failed"]
                }, { status: 400 })
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error("Bulk operations error:", error)
        return NextResponse.json({ 
            error: "Failed to perform bulk operation",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}