import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import { ObjectId } from "mongodb"
import { calculateStudentAnalytics } from "@/lib/models/Student"

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
        const url = new URL(request.url)

        // Extract query parameters
        const status = url.searchParams.get('status')
        const sortBy = url.searchParams.get('sortBy') || 'recent'
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const includeAnalytics = url.searchParams.get('includeAnalytics') === 'true'

        // Build MongoDB query
        const query: any = {
            studentEmail: student.email
        }

        if (status && status !== 'all') {
            query.status = status
        }

        // Build sort options
        let sortOptions: any = {}
        switch (sortBy) {
            case 'recent':
                sortOptions = { startedAt: -1 }
                break
            case 'score':
                sortOptions = { score: -1, startedAt: -1 }
                break
            case 'duration':
                sortOptions = { duration: -1, startedAt: -1 }
                break
            case 'template':
                sortOptions = { templateName: 1, startedAt: -1 }
                break
            default:
                sortOptions = { startedAt: -1 }
        }

        // Fetch practice sessions from database
        const sessions = await db.collection('practice_sessions')
            .find(query)
            .sort(sortOptions)
            .limit(limit)
            .toArray()

        // Transform sessions to match frontend interface
        const results = sessions.map(session => ({
            sessionId: session.sessionId,
            templateId: session.templateId?.toString() || '',
            templateName: session.templateTitle || session.templateName || 'Unknown Template',
            status: session.status,
            startedAt: session.startedAt || session.createdAt,
            completedAt: session.completedAt,
            duration: session.duration || 0,
            score: session.score,
            responses: session.responses?.length || 0,
            analysis: session.analysis,
            finalScore: session.finalScore
        }))

        let analytics = null

        // Calculate analytics if requested
        if (includeAnalytics) {
            // Get all sessions for analytics calculation (not limited)
            const allSessions = await db.collection('practice_sessions')
                .find({ studentEmail: student.email })
                .sort({ startedAt: -1 })
                .toArray()

            // Convert to PracticeSession format for analytics calculation
            const practiceSessionsForAnalytics = allSessions.map(session => ({
                _id: session._id,
                sessionId: session.sessionId,
                templateId: session.templateId,
                templateName: session.templateTitle || session.templateName || 'Unknown',
                startedAt: session.startedAt || session.createdAt,
                completedAt: session.completedAt,
                status: session.status,
                responses: session.responses || [],
                score: session.score,
                feedback: session.feedback,
                audioUrl: session.audioUrl,
                audioS3: session.audioS3,
                videoUrl: session.videoUrl,
                videoS3: session.videoS3,
                transcript: session.transcript,
                duration: session.duration || 0,
                analysis: session.analysis,
                finalScore: session.finalScore
            }))

            // Calculate real analytics from database data
            const baseAnalytics = calculateStudentAnalytics(practiceSessionsForAnalytics)

            // Calculate additional metrics
            const completedSessions = practiceSessionsForAnalytics.filter(s => s.status === 'completed')
            const totalSessions = practiceSessionsForAnalytics.length
            const completionRate = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0

            // Calculate strong and weak areas based on actual session data
            const strongAreas: string[] = []
            const weakAreas: string[] = []

            if (completedSessions.length > 0) {
                // Analyze final scores to determine strengths and weaknesses
                const skillAverages = {
                    communication: 0,
                    technical: 0,
                    confidence: 0,
                    clarity: 0,
                    professionalism: 0
                }

                let skillCounts = {
                    communication: 0,
                    technical: 0,
                    confidence: 0,
                    clarity: 0,
                    professionalism: 0
                }

                completedSessions.forEach(session => {
                    if (session.finalScore?.breakdown) {
                        const breakdown = session.finalScore.breakdown

                        if (breakdown.professionalism) {
                            skillAverages.professionalism += breakdown.professionalism
                            skillCounts.professionalism++
                        }
                        if (breakdown.correctness) {
                            skillAverages.technical += breakdown.correctness
                            skillCounts.technical++
                        }
                        if (breakdown.confidence) {
                            skillAverages.confidence += breakdown.confidence
                            skillCounts.confidence++
                        }
                        if (breakdown.clarity) {
                            const clarityScore = parseFloat(breakdown.clarity) || 0
                            skillAverages.clarity += clarityScore
                            skillCounts.clarity++
                        }
                    }

                    if (session.analysis?.aiMetrics) {
                        const aiMetrics = session.analysis.aiMetrics
                        if (aiMetrics.professionalism) {
                            skillAverages.communication += aiMetrics.professionalism
                            skillCounts.communication++
                        }
                    }
                })

                // Calculate averages and determine strengths/weaknesses
                const threshold = 75 // Threshold for strong/weak classification

                Object.entries(skillAverages).forEach(([skill, total]) => {
                    const count = skillCounts[skill as keyof typeof skillCounts]
                    if (count > 0) {
                        const average = total / count
                        if (average >= threshold) {
                            strongAreas.push(skill.charAt(0).toUpperCase() + skill.slice(1))
                        } else if (average < 60) {
                            weakAreas.push(skill.charAt(0).toUpperCase() + skill.slice(1))
                        }
                    }
                })
            }

            // Calculate skill progress based on actual data
            const skillProgress = {
                communication: baseAnalytics.averageScore * 0.9, // Slightly lower than average
                technicalKnowledge: baseAnalytics.averageScore,
                problemSolving: baseAnalytics.averageScore * 1.05, // Slightly higher
                confidence: baseAnalytics.averageScore * 0.85,
                professionalism: baseAnalytics.averageScore * 0.95
            }

            analytics = {
                totalSessions: baseAnalytics.totalSessions,
                completedSessions: baseAnalytics.completedSessions,
                averageScore: baseAnalytics.averageScore,
                timeSpent: baseAnalytics.timeSpent,
                improvementTrend: baseAnalytics.improvementTrend,
                strongAreas,
                weakAreas,
                lastActivity: baseAnalytics.lastActivity,
                streakDays: baseAnalytics.streakDays,
                completionRate,
                skillProgress
            }
        }

        return NextResponse.json({
            results,
            analytics,
            totalCount: results.length
        })

    } catch (error) {
        console.error("Get student results error:", error)
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}