"use client"

import { AdminLayout } from "../components/AdminLayout"
import { InterviewsStatsCards } from "./components/InterviewsStatsCards"
import { InterviewsTable } from "./components/InterviewsTable"
import { InterviewsFilters } from "./components/InterviewsFilters"
import { useInterviewsData } from "./hooks/useInterviewsData"
import { useState } from "react"
import { Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils/dateUtils"

export default function AdminInterviews() {
  const { interviews, stats, isLoading } = useInterviewsData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Interview Management</h1>
            <p className="text-muted-foreground text-lg">Monitor all interviews across the platform</p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border/50">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {formatDate(new Date())}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-slide-up">
          <InterviewsStatsCards stats={stats} isLoading={isLoading} />
        </div>

        {/* Filters */}
        <div className="animate-slide-up">
          <InterviewsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {/* Interviews Table */}
        <div className="animate-slide-up">
          <InterviewsTable
            interviews={filteredInterviews}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
