import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { GeneralUser } from '@/lib/models/GeneralUser'
import {
    hashPassword,
    isValidEmail,
    isValidPassword,
    generateVerificationToken,
    createErrorResponse,
    createSuccessResponse
} from '@/lib/utils/generalAuth'

export async function POST(request: NextRequest) {
    try {
        await getDatabase()

        const body = await request.json()
        const { email, password, firstName, lastName, phoneNumber, location } = body

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return createErrorResponse('Missing required fields', 400)
        }

        if (!isValidEmail(email)) {
            return createErrorResponse('Invalid email format', 400)
        }

        if (!isValidPassword(password)) {
            return createErrorResponse(
                'Password must be at least 8 characters with uppercase, lowercase, and number',
                400
            )
        }

        // Check if user already exists
        const existingUser = await GeneralUser.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return createErrorResponse('User already exists with this email', 409)
        }

        // Hash password
        const passwordHash = await hashPassword(password)

        // Generate verification token
        const emailVerificationToken = generateVerificationToken()

        // Create user
        const newUser = new GeneralUser({
            email: email.toLowerCase(),
            passwordHash,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber?.trim() || null,
            location: location?.trim() || null,
            emailVerificationToken,
            preferences: {
                emailNotifications: true,
                interviewReminders: true,
                preferredDifficulty: 'intermediate',
                focusAreas: [],
                preferredLanguage: 'english'
            }
        })

        await newUser.save()

        // TODO: Send verification email
        console.log(`Verification token for ${email}: ${emailVerificationToken}`)

        return createSuccessResponse({
            message: 'Account created successfully',
            userId: newUser._id.toString(),
            email: newUser.email,
            needsVerification: true
        })

    } catch (error) {
        console.error('Signup error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')
        const email = searchParams.get('email')

        if (!token || !email) {
            return createErrorResponse('Missing verification token or email', 400)
        }

        await getDatabase()

        // Find user with verification token
        const user = await GeneralUser.findOne({
            email: email.toLowerCase(),
            emailVerificationToken: token,
            accountStatus: 'pending'
        })

        if (!user) {
            return createErrorResponse('Invalid verification token', 400)
        }

        // Update user status
        user.isEmailVerified = true
        user.accountStatus = 'active'
        user.emailVerificationToken = null
        await user.save()

        return createSuccessResponse({
            message: 'Email verified successfully',
            verified: true
        })

    } catch (error) {
        console.error('Email verification error:', error)
        return createErrorResponse('Internal server error', 500)
    }
}