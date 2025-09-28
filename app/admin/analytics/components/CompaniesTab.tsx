import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function CompaniesTab({ companyStats }: { companyStats: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Performance Overview</CardTitle>
        <CardDescription>Detailed metrics for all registered companies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyStats.map((company) => (
            <div key={company.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <Badge variant={company.status === "active" ? "default" : "secondary"}>
                    {company.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{company.avgScore}%</div>
                  <div className="text-sm text-gray-600">avg score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Interview Usage</div>
                  <div className="flex items-center gap-2">
                    <Progress value={(company.interviews / company.quota) * 100} className="flex-1" />
                    <span className="text-sm font-medium">
                      {company.interviews}/{company.quota}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                  <div className="flex items-center gap-2">
                    <Progress value={company.completionRate} className="flex-1" />
                    <span className="text-sm font-medium">{company.completionRate}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">Manage Quota</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
