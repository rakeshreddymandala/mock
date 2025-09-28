import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, TrendingUp, Activity, BarChart3, PieChart } from "lucide-react"

export function OverviewTab({ systemMetrics, templateStats }: { systemMetrics: any, templateStats: any[] }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{systemMetrics.monthlyGrowth.companies}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalInterviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{systemMetrics.monthlyGrowth.interviews}%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{systemMetrics.monthlyGrowth.users}%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Excellent</span> performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Volume Trends</CardTitle>
            <CardDescription>Daily interview completions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Interview volume chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Distribution</CardTitle>
            <CardDescription>Companies by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Company distribution chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Interview Score</span>
              <span className="font-semibold">{systemMetrics.averageScore}%</span>
            </div>
            <Progress value={systemMetrics.averageScore} />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="font-semibold">{systemMetrics.completionRate}%</span>
            </div>
            <Progress value={systemMetrics.completionRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Interview Templates</CardTitle>
            <CardDescription>Most popular templates by usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templateStats.slice(0, 3).map((template, index) => (
                <div key={template.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{template.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{template.usage}</div>
                    <div className="text-xs text-gray-500">{template.avgScore}% avg</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
