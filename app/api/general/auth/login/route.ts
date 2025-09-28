import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import {
    comparePassword,
    generateToken,
    isValidEmail,
    createErrorResponse,
    createSuccessResponse,
    formatUserForClient,
    checkAndResetQuota,
    getNextQuotaResetDate
} from '@/lib/utils/generalAuth'

export async function POST(request: NextRequest) {
    try {
        const db = await getDatabase()

        const body = await request.json()
        const { email, password } = body

        // Validation
        if (!email || !password) {
            return createErrorResponse('Email and password are required', 400)
        }

        if (!isValidEmail(email)) {
            return createErrorResponse('Invalid email format', 400)
        }

        // Find user directly from MongoDB collection
        const user = await db.collection("generalusers").findOne({
            email: email.toLowerCase()
        })

        if (!user) {
            return createErrorResponse('Invalid credentials', 401)
        }

        // Check account status
        if (user.accountStatus === 'suspended') {
            return createErrorResponse('Account is suspended', 403)
        }

        if (!user.isEmailVerified) {
            return createErrorResponse('Please verify your email first', 403)
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.passwordHash)
        if (!isValidPassword) {
            return createErrorResponse('Invalid credentials', 401)
        }

        // Check and reset quota if needed
        if (checkAndResetQuota(user)) {
            await db.collection("generalusers").updateOne(
                { _id: user._id },
                {
                    $set: {
                        interviewsUsed: 0,
                        quotaResetDate: getNextQuotaResetDate(),
                        updatedAt: new Date()
                    }
                }
            )
            user.interviewsUsed = 0
            user.quotaResetDate = getNextQuotaResetDate()
        }

        // Update last login
        await db.collection("generalusers").updateOne(
            { _id: user._id },
            {
                $set: {
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                }
            }
        )

        // Generate token
        const token = generateToken(user._id.toString(), user.email)

        // Format user data
        const userData = formatUserForClient(user)

        // Set cookie
        const response = createSuccessResponse({
            user: userData,
            token,
            message: 'Login successful'
        })

        // Add cookie header
        const headers = new Headers(response.headers)
        headers.set('Set-Cookie', `general-auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`)

        return new Response(response.body, {
            status: response.status,
            headers
        })

    } catch (error) {
        console.error('Login error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}