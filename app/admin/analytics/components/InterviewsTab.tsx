import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function InterviewsTab({ templateStats, recentInterviewActivity }: { templateStats: any[], recentInterviewActivity: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Interview Template Analytics</CardTitle>
          <CardDescription>Performance metrics by template type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templateStats.map((template, index) => (
              <div key={template.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{template.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{template.usage} uses</div>
                  <div className="text-sm text-gray-600">{template.avgScore}% avg score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Interview Activity</CardTitle>
          <CardDescription>Latest completed interviews across all companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInterviewActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{activity.candidate}</div>
                  <div className="text-sm text-gray-600">{activity.company}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{activity.score}%</div>
                  <div className="text-sm text-gray-600">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
