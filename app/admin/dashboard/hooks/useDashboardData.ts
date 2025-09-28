import { useState, useEffect } from "react"

export interface DashboardStats {
    totalCompanies: number
    totalInterviews: number
    activeInterviews: number
    activeAgents: number
    monthlyGrowth?: {
        companies: number
        interviews: number
        users: number
    }
}

export interface Company {
    _id: string
    companyName: string
    email: string
    createdAt: string
    interviewQuota: number
    interviewsUsed: number
}

export function useDashboardData() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalCompanies: 0,
        totalInterviews: 0,
        activeInterviews: 0,
        activeAgents: 0,
        monthlyGrowth: {
            companies: 0,
            interviews: 0,
            users: 0,
        },
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchCompanies = async () => {
        try {
            const response = await fetch("/api/admin/companies")
            if (response.ok) {
                const data = await response.json()
                setCompanies(data.companies || [])
            } else {
                console.error("Failed to fetch companies")
            }
        } catch (error) {
            console.error("Error fetching companies:", error)
            setError("Failed to fetch companies")
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/admin/stats")
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                console.error("Failed to fetch stats")
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
            setError("Failed to fetch stats")
        }
    }

    const updateCompanyQuota = async (companyId: string, newQuota: number, addToExisting: boolean = false) => {
        try {
            const response = await fetch("/api/admin/companies", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId,
                    interviewQuota: newQuota,
                    addToExisting,
                }),
            })

            if (response.ok) {
                await fetchCompanies()
                return { success: true }
            } else {
                const data = await response.json()
                return { success: false, error: data.error || "Failed to update quota" }
            }
        } catch (error) {
            console.error("Error updating quota:", error)
            return { success: false, error: "Network error. Please try again." }
        }
    }

    const addCompany = async (companyData: { name: string; email: string; initialQuota: string }) => {
        try {
            const response = await fetch("/api/admin/companies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(companyData),
            })

            if (response.ok) {
                await fetchCompanies()
                return { success: true }
            } else {
                const data = await response.json()
                return { success: false, error: data.error || "Failed to add company" }
            }
        } catch (error) {
            console.error("Error adding company:", error)
            return { success: false, error: "Network error. Please try again." }
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            await Promise.all([fetchCompanies(), fetchStats()])
            setIsLoading(false)
        }
        loadData()
    }, [])

    return {
        companies,
        stats,
        isLoading,
        error,
        updateCompanyQuota,
        addCompany,
        refreshData: () => {
            fetchCompanies()
            fetchStats()
        },
    }
}