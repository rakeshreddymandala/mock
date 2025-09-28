import { NextRequest } from 'next/server'
import { createSuccessResponse } from '@/lib/utils/generalAuth'

export async function POST(request: NextRequest) {
    try {
        // Create response
        const response = createSuccessResponse({
            message: 'Logged out successfully'
        })

        // Clear cookie
        const headers = new Headers(response.headers)
        headers.set('Set-Cookie', 'general-auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')

        return new Response(response.body, {
            status: response.status,
            headers
        })

    } catch (error) {
        console.error('Logout error:', error)
        return createSuccessResponse({
            message: 'Logged out successfully'
        })
    }
}