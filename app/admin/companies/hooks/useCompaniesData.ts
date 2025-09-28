import { useState, useEffect } from "react"

export interface Company {
    _id: string
    companyName: string
    email: string
    createdAt: string
    interviewQuota: number
    interviewsUsed: number
    role: string
    name: string
    industry?: string
    employees?: string
    phone?: string
    website?: string
    // Aliases for backward compatibility
    quota: number
    quotaUsed: number
}

export interface CompaniesStats {
    totalCompanies: number
    activeCompanies: number
    quotaUtilization: number
    avgQuotaUsage: number
}

export function useCompaniesData() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [stats, setStats] = useState<CompaniesStats>({
        totalCompanies: 0,
        activeCompanies: 0,
        quotaUtilization: 0,
        avgQuotaUsage: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchCompanies = async () => {
        try {
            const response = await fetch("/api/admin/companies")
            if (response.ok) {
                const data = await response.json()
                const companiesData = data.companies || []

                // Map the data to include aliases for backward compatibility
                const mappedCompanies = companiesData.map((company: any) => ({
                    ...company,
                    quota: company.interviewQuota || 0,
                    quotaUsed: company.interviewsUsed || 0,
                }))

                setCompanies(mappedCompanies)

                // Calculate stats
                const total = mappedCompanies.length
                const active = mappedCompanies.filter((c: Company) => c.quotaUsed < c.quota).length
                const totalQuota = mappedCompanies.reduce((sum: number, c: Company) => sum + (c.quota || 0), 0)
                const totalUsed = mappedCompanies.reduce((sum: number, c: Company) => sum + (c.quotaUsed || 0), 0)
                const utilization = totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0
                const avgUsage = total > 0 ? Math.round(totalUsed / total) : 0

                setStats({
                    totalCompanies: total,
                    activeCompanies: active,
                    quotaUtilization: utilization,
                    avgQuotaUsage: avgUsage,
                })
            } else {
                console.error("Failed to fetch companies")
                setError("Failed to fetch companies")
            }
        } catch (error) {
            console.error("Error fetching companies:", error)
            setError("Failed to fetch companies")
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

    const addCompany = async (companyData: { name: string; email: string; initialQuota: string; industry?: string; employees?: string }) => {
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
            await fetchCompanies()
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
        refreshData: fetchCompanies,
    }
}