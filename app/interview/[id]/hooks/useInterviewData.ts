import { useState, useEffect } from "react"

interface InterviewData {
  interview: {
    candidateName: string
    candidateEmail: string
  }
  template: {
    title: string
    description: string
    questions: Array<{
      id: string
      question: string
      timeLimit: number
    }>
  }
  companyName: string
}

export function useInterviewData(interviewId: string) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log(`🔍 Fetching interview data for ID: ${interviewId}`)

        // Determine if this is a general user session (starts with 'gen_')
        const isGeneralSession = interviewId.startsWith('gen_')

        // Use appropriate endpoint based on session type
        const endpoint = isGeneralSession
          ? `/api/general/interviews/${interviewId}`
          : `/api/interviews/${interviewId}`

        // Add authorization header for general sessions
        const headers: HeadersInit = {}
        if (isGeneralSession) {
          const token = localStorage.getItem('general-auth-token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }

        const response = await fetch(endpoint, { headers })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Interview data fetched successfully for: ${data.interview?.candidateName}`)
          setInterviewData(data)
          setLoading(false)
        } else {
          const errorData = await response.json()
          console.error(`❌ Failed to fetch interview data: ${response.status}`, errorData)
          setError(errorData.error || "Failed to fetch interview data")
          setLoading(false)
        }
      } catch (err) {
        console.error(`❌ Network error fetching interview data:`, err)
        setError("Network error. Please try again.")
        setLoading(false)
      }
    }

    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  const updateInterviewStatus = async (status: string) => {
    try {
      console.log(`🔄 Updating interview status to: ${status}`)

      // Determine if this is a general user session
      const isGeneralSession = interviewId.startsWith('gen_')

      // Use appropriate endpoint based on session type
      const endpoint = isGeneralSession
        ? `/api/general/interviews/${interviewId}`
        : `/api/interviews/${interviewId}`

      // Add authorization header for general sessions
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (isGeneralSession) {
        const token = localStorage.getItem('general-auth-token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        console.log(`✅ Interview status updated successfully to: ${status}`)
      } else {
        const errorData = await response.json()
        console.error(`❌ Failed to update interview status:`, errorData)
      }
    } catch (error) {
      console.error("❌ Error updating interview status:", error)
    }
  }

  return {
    interviewData,
    loading,
    error,
    updateInterviewStatus
  }
}