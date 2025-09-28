"use client"

import { AdminLayout } from "../components/AdminLayout"
import { useCompaniesData } from "./hooks/useCompaniesData"
import { CompaniesStatsCards } from "./components/CompaniesStatsCards"
import { CompaniesFilters, type CompaniesFiltersState } from "./components/CompaniesFilters"
import { CompaniesTable } from "./components/CompaniesTable"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import type { Company } from "./hooks/useCompaniesData"

export default function AdminCompaniesPage() {
  const { companies, stats, isLoading, error, updateCompanyQuota, addCompany } = useCompaniesData()
  const [filters, setFilters] = useState<CompaniesFiltersState>({
    search: '',
    status: 'all',
    quotaRange: 'all'
  })

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          company.companyName.toLowerCase().includes(searchLower) ||
          company.email.toLowerCase().includes(searchLower) ||
          (company.industry && company.industry.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = company.interviewsUsed < company.interviewQuota
        if (filters.status === 'active' && !isActive) return false
        if (filters.status === 'inactive' && isActive) return false
      }

      // Quota range filter
      if (filters.quotaRange !== 'all') {
        const percentage = company.interviewQuota > 0 ? (company.interviewsUsed / company.interviewQuota) * 100 : 0
        if (filters.quotaRange === 'low' && percentage > 33) return false
        if (filters.quotaRange === 'medium' && (percentage <= 33 || percentage > 66)) return false
        if (filters.quotaRange === 'high' && percentage <= 66) return false
      }

      return true
    })
  }, [companies, filters])

  const handleViewDetails = (company: Company) => {
    console.log("View details for:", company.companyName)
    // TODO: Implement view details functionality
  }

  const handleEditCompany = (company: Company) => {
    console.log("Edit company:", company.companyName)
    // TODO: Implement edit company functionality
  }

  const handleDeleteCompany = async (companyId: string) => {
    console.log("Delete company:", companyId)
    // TODO: Implement delete company functionality
  }

  const handleUpdateQuota = async (companyId: string, newQuota: number) => {
    const result = await updateCompanyQuota(companyId, newQuota)
    if (result.success) {
      console.log("Quota updated successfully")
    } else {
      console.error("Failed to update quota:", result.error)
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Companies</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Company Management</h1>
            <p className="text-muted-foreground">
              Manage all registered companies and their interview quotas
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Stats Cards */}
        <CompaniesStatsCards stats={stats} isLoading={isLoading} />

        {/* Filters */}
        <CompaniesFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultsCount={filteredCompanies.length}
        />

        {/* Companies Table */}
        <CompaniesTable
          companies={filteredCompanies}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEditCompany={handleEditCompany}
          onDeleteCompany={handleDeleteCompany}
          onUpdateQuota={handleUpdateQuota}
        />
      </div>
    </AdminLayout>
  )
}
