import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    console.log("Login attempt:", { email, role, passwordLength: password?.length })

    if (!email || !password || !role) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    console.log("Searching for user:", { email, role })

    // Find user
    const user = await usersCollection.findOne({ email, role })
    console.log("User found:", user ? { id: user._id, email: user.email, role: user.role } : "No user found")

    if (!user) {
      console.log("User not found with email and role:", { email, role })
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    console.log("Verifying password for user:", user.email)
    const isValidPassword = await verifyPassword(password, user.password)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("Password verification failed for user:", user.email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Login successful for user:", user.email)

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
      ...(user.role === "company" && { companyName: user.companyName }),
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(user.role === "company" && {
          companyName: user.companyName,
          interviewQuota: user.interviewQuota,
          interviewsUsed: user.interviewsUsed,
        }),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
