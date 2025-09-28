import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import type { Interview } from "../hooks/useInterviewsData"
import { formatDate } from "@/lib/utils/dateUtils"

interface InterviewsTableProps {
    interviews: Interview[]
    isLoading: boolean
}

export function InterviewsTable({ interviews, isLoading }: InterviewsTableProps) {
    const getStatusBadge = (status: Interview["status"]) => {
        switch (status) {
            case "completed":
                return (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Completed
                    </Badge>
                )
            case "in-progress":
                return (
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        In Progress
                    </Badge>
                )
            case "pending":
                return <Badge variant="outline">Pending</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 bg-card/50">
            <CardHeader>
                <CardTitle className="text-xl gradient-text">All Interviews ({interviews.length})</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Complete list of interviews across all companies, schools, and users
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interviews.map((interview) => (
                            <TableRow key={interview.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{interview.candidateName}</div>
                                        <div className="text-sm text-muted-foreground">{interview.candidateEmail}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{interview.companyName}</TableCell>
                                <TableCell className="text-muted-foreground">{interview.templateName}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(interview.scheduledDate)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{interview.duration}</TableCell>
                                <TableCell>{getStatusBadge(interview.status)}</TableCell>
                                <TableCell>
                                    {interview.score ? (
                                        <span className="font-medium text-foreground">{interview.score}/100</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}