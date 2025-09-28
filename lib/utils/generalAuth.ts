import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-general-user-jwt-secret'
const JWT_EXPIRES_IN = '7d'

// Hash password
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId: string, email: string): string {
    return jwt.sign(
        {
            userId,
            email,
            userType: 'general'
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    )
}

// Verify JWT token
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Also check cookies
    const token = request.cookies.get('general-auth-token')?.value
    return token || null
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
}

// Generate verification token
export function generateVerificationToken(): string {
    return Math.random().toString(36).substr(2, 9)
}

// Generate session ID
export function generateSessionId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Format user data for client
export function formatUserForClient(user: any) {
    return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        subscriptionTier: user.subscriptionTier,
        interviewQuota: user.interviewQuota,
        interviewsUsed: user.interviewsUsed,
        quotaResetDate: user.quotaResetDate,
        preferences: user.preferences,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
    }
}

// Check if quota reset is needed
export function checkAndResetQuota(user: any): boolean {
    const now = new Date()
    if (now >= user.quotaResetDate) {
        return true
    }
    return false
}

// Calculate next quota reset date
export function getNextQuotaResetDate(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

// Validate user permissions
export function canAccessInterview(user: any): boolean {
    if (user.subscriptionTier === 'premium') {
        return true
    }

    // Check if quota reset is needed
    if (checkAndResetQuota(user)) {
        return true // Will be reset in the API call
    }

    return user.interviewsUsed < user.interviewQuota
}

// Format error response
export function createErrorResponse(message: string, statusCode: number = 400) {
    return new Response(
        JSON.stringify({
            success: false,
            error: message
        }),
        {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}

// Format success response
export function createSuccessResponse(data: any, message?: string) {
    return new Response(
        JSON.stringify({
            success: true,
            data,
            message
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}

// Middleware to authenticate general user
export async function authenticateGeneralUser(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request)

        if (!token) {
            return null
        }

        const decoded = verifyToken(token)

        if (!decoded || decoded.userType !== 'general') {
            return null
        }

        return {
            userId: decoded.userId,
            email: decoded.email,
            userType: decoded.userType
        }
    } catch (error) {
        console.error('Authentication error:', error)
        return null
    }
}