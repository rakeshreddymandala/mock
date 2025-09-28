import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * Find interview by ID or uniqueLink
 * @param id - Interview ID (ObjectId or uniqueLink)
 * @returns Interview document or null
 */
export async function findInterview(id: string) {
    const db = await getDatabase()
    const interviewsCollection = db.collection("interviews")

    console.log(`🔍 Fetching interview with ID: ${id}`)

    // Try to find interview by uniqueLink first, then by ObjectId
    let interview
    try {
        // First try as uniqueLink (for regular interviews)
        interview = await interviewsCollection.findOne({ uniqueLink: id })
        console.log(`📄 Found by uniqueLink:`, !!interview)

        if (!interview) {
            // Then try as ObjectId
            interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })
            console.log(`📄 Found by ObjectId:`, !!interview)
        }
    } catch (error) {
        console.log(`❌ Error looking up interview: ${error}`)
        // If ObjectId parsing fails, interview will remain null
    }

    return interview
}

/**
 * Update interview by ID or uniqueLink
 * @param id - Interview ID (ObjectId or uniqueLink)
 * @param updateData - Data to update
 * @returns Update result
 */
export async function updateInterview(id: string, updateData: any) {
    const db = await getDatabase()
    const interviewsCollection = db.collection("interviews")

    // Update by uniqueLink first, then by ObjectId if not found
    let result
    try {
        result = await interviewsCollection.updateOne({ uniqueLink: id }, { $set: updateData })
        if (result.matchedCount === 0) {
            // Try updating by ObjectId
            result = await interviewsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
        }
    } catch (error) {
        console.error(`Error updating interview: ${error}`)
        throw new Error("Failed to update interview")
    }

    return result
}

/**
 * Get template by ID
 * @param templateId - Template ObjectId
 * @returns Template document or null
 */
export async function getTemplate(templateId: any) {
    const db = await getDatabase()
    const templatesCollection = db.collection("templates")

    const template = await templatesCollection.findOne({ _id: templateId })
    return template
}

/**
 * Get company name from interview
 * @param interview - Interview document
 * @returns Company name string
 */
export async function getCompanyName(interview: any): Promise<string> {
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    let companyName = "Unknown Company"
    try {
        // Regular company interview
        const company = await usersCollection.findOne({ _id: interview.companyId })
        if (company) {
            companyName = company.companyName || company.firstName || "Company"
            console.log(`🏢 Company found: ${companyName}`)
        }
    } catch (error) {
        console.log(`⚠️ Error fetching company info: ${error}`)
    }

    return companyName
}

/**
 * Update quota for completed interviews
 * @param interview - Interview document
 */
export async function updateQuotaForCompletion(interview: any) {
    const db = await getDatabase()
    const usersCollection = db.collection("users")
    const studentsCollection = db.collection("students")

    const isStudentPractice = interview.isStudentPractice || interview.metadata?.sessionType === 'practice'

    if (isStudentPractice) {
        // For student practice, update student's practiceUsed count
        await studentsCollection.updateOne(
            { _id: interview.companyId }, // companyId is actually studentId for practice sessions
            {
                $inc: {
                    practiceUsed: 1, // Increase used count (quota was already incremented during creation)
                },
            }
        )
        console.log(`📊 Updated student practice completion count`)
    } else {
        // For company interviews, update company's interview quota
        await usersCollection.updateOne(
            { _id: interview.companyId },
            {
                $inc: {
                    interviewQuota: -1, // Reduce the quota by 1
                    interviewsUsed: 1,  // Increase the used count by 1
                },
            }
        )
        console.log(`📊 Updated company interview quota`)
    }
}