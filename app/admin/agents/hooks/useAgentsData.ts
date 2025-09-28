import { useState, useEffect } from "react"

export interface Agent {
    _id: string
    agentId: string
    templateId: string
    templateTitle: string
    userType: "company" | "student" | "general"
    companyName?: string
    status: "active" | "inactive"
    createdAt: string
}

export interface AgentStats {
    totalAgents: number
    companyAgents: number
    studentAgents: number
    generalAgents: number
}

export function useAgentsData() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [stats, setStats] = useState<AgentStats>({
        totalAgents: 0,
        companyAgents: 0,
        studentAgents: 0,
        generalAgents: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchAgents = async () => {
        try {
            const response = await fetch("/api/admin/agents")
            if (response.ok) {
                const data = await response.json()
                setAgents(data.agents || [])
                setStats(data.stats || {
                    totalAgents: 0,
                    companyAgents: 0,
                    studentAgents: 0,
                    generalAgents: 0
                })
            } else {
                console.error("Failed to fetch agents")
                setError("Failed to fetch agents")
            }
        } catch (error) {
            console.error("Error fetching agents:", error)
            setError("Failed to fetch agents")
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            await fetchAgents()
            setIsLoading(false)
        }
        loadData()

        // Auto-refresh every 30 seconds for real-time data
        const interval = setInterval(fetchAgents, 30000)
        return () => clearInterval(interval)
    }, [])

    return {
        agents,
        stats,
        isLoading,
        error,
        refreshData: fetchAgents
    }
}