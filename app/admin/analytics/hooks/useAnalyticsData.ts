"use client"

import { useState, useEffect } from 'react'

interface AnalyticsStats {
  totalCompanies: number
  totalInterviews: number
  totalTemplates: number
  activeUsers: number
  systemUptime: number
  avgInterviewScore: number
  completionRate: number
  monthlyGrowth: {
    companies: number
    interviews: number
    users: number
  }
}

export const useAnalyticsData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStats>({
    totalCompanies: 0,
    totalInterviews: 0,
    totalTemplates: 0,
    activeUsers: 0,
    systemUptime: 99.9,
    avgInterviewScore: 0,
    completionRate: 0,
    monthlyGrowth: {
      companies: 0,
      interviews: 0,
      users: 0,
    },
  })

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setStats({
        totalCompanies: data.totalCompanies,
        totalInterviews: data.totalInterviews,
        totalTemplates: data.totalTemplates,
        activeUsers: data.activeUsers,
        systemUptime: data.systemUptime,
        avgInterviewScore: data.avgInterviewScore,
        completionRate: data.completionRate,
        monthlyGrowth: {
          companies: data.monthlyGrowth.companies,
          interviews: data.monthlyGrowth.interviews,
          users: data.monthlyGrowth.users,
        },
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Keep current stats on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000)

    return () => clearInterval(interval)
  }, [])

  return { stats, isLoading, refetch: fetchAnalyticsData }
}
