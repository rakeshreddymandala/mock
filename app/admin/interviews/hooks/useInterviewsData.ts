import { useState, useEffect } from "react"

export interface Interview {
    id: string
    candidateName: string
    candidateEmail: string
    companyName: string
    templateName: string
    status: "completed" | "in-progress" | "pending"
    scheduledDate: Date
    duration: string
    score?: number
}

export interface InterviewsStats {
    totalInterviews: number
    completedInterviews: number
    inProgressInterviews: number
    scheduledInterviews: number
    avgScore: number
}

export function useInterviewsData() {
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [stats, setStats] = useState<InterviewsStats>({
        totalInterviews: 0,
        completedInterviews: 0,
        inProgressInterviews: 0,
        scheduledInterviews: 0,
        avgScore: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchInterviewsData = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/interviews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch interviews data')
            }

            const data = await response.json()

            // Convert string dates to Date objects and map status
            const formattedInterviews = data.interviews.map((interview: any) => ({
                ...interview,
                scheduledDate: new Date(interview.scheduledDate),
                status: interview.status === 'in-progress' ? 'in-progress' :
                    interview.status === 'pending' ? 'pending' : 'completed'
            }))

            setInterviews(formattedInterviews)
            setStats(data.stats)
        } catch (error) {
            console.error('Error fetching interviews data:', error)
            // Keep current data on error
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInterviewsData()

        // Set up real-time updates every 30 seconds
        const interval = setInterval(fetchInterviewsData, 30000)

        return () => clearInterval(interval)
    }, [])

    return { interviews, stats, isLoading, refetch: fetchInterviewsData }
}