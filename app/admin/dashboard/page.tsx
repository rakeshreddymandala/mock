"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Building2, Server, Database, Zap, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "../components/AdminLayout"
import { useDashboardData } from "./hooks/useDashboardData"
import { StatsCards } from "./components/StatsCards"
import { CompanyManagement } from "./components/CompanyManagement"
import { formatDate } from "@/lib/utils/dateUtils"

export default function AdminDashboard() {
  const { companies, stats, isLoading, updateCompanyQuota, addCompany } = useDashboardData()

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground text-lg">Monitor platform usage and manage company accounts</p>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border/50">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {formatDate(new Date())}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-slide-up">
          <StatsCards stats={stats} isLoading={isLoading} />
        </div>

        {/* Company Management */}
        <div className="animate-fade-in">
          <CompanyManagement
            companies={companies}
            isLoading={isLoading}
            onUpdateQuota={updateCompanyQuota}
            onAddCompany={addCompany}
          />
        </div>

        {/* Additional Sections */}
        <div className="grid lg:grid-cols-2 gap-6 animate-slide-up">
          <Card className="border-border/50 hover:border-accent/20 transition-all duration-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
              <CardTitle className="text-xl text-foreground flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-accent" />
                Recent Company Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companies.slice(0, 3).map((company) => (
                <div
                  key={company._id}
                  className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{company.companyName}</p>
                    <p className="text-sm text-muted-foreground">{company.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(new Date(company.createdAt))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-chart-3/20 transition-all duration-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
              <CardTitle className="text-xl text-foreground flex items-center">
                <Server className="w-5 h-5 mr-2 text-chart-3" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-chart-3" />
                  <span className="text-sm text-muted-foreground">Server Status</span>
                </div>
                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                  <div className="w-2 h-2 bg-chart-3 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Database</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">API Response Time</span>
                </div>
                <span className="text-sm font-medium text-accent">127ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Uptime</span>
                </div>
                <span className="text-sm font-medium text-secondary">99.9%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}