import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function SystemHealthTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health Metrics</CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Server Uptime</span>
            <span className="font-semibold text-green-600">99.9%</span>
          </div>
          <Progress value={99.9} />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">API Response Time</span>
            <span className="font-semibold">245ms</span>
          </div>
          <Progress value={85} />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database Performance</span>
            <span className="font-semibold text-green-600">Optimal</span>
          </div>
          <Progress value={92} />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="font-semibold">67%</span>
          </div>
          <Progress value={67} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Monitoring</CardTitle>
          <CardDescription>System errors and resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">API Rate Limit Exceeded</div>
                <div className="text-sm text-gray-600">Last occurred: 2 hours ago</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Resolved
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Database Connection Timeout</div>
                <div className="text-sm text-gray-600">Last occurred: 1 day ago</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Resolved
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">File Upload Failed</div>
                <div className="text-sm text-gray-600">Last occurred: 3 days ago</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Resolved
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
