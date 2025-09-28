'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Settings,
    Building2,
    ExternalLink,
    Mail,
    Users,
    BarChart3,
    Phone,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Company } from "../hooks/useCompaniesData"
import { UpdateQuotaDialog } from './UpdateQuotaDialog'
import { DeleteCompanyDialog } from './DeleteCompanyDialog'

interface CompaniesTableProps {
    companies: Company[]
    isLoading: boolean
    onViewDetails: (company: Company) => void
    onEditCompany: (company: Company) => void
    onDeleteCompany: (companyId: string) => void
    onUpdateQuota: (companyId: string, newQuota: number) => void
}

export function CompaniesTable({
    companies,
    isLoading,
    onViewDetails,
    onEditCompany,
    onDeleteCompany,
    onUpdateQuota
}: CompaniesTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null)
    const [companyToUpdateQuota, setCompanyToUpdateQuota] = useState<Company | null>(null)
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)

    const getQuotaStatus = (used: number, total: number) => {
        if (total === 0) return { status: 'low', label: 'Good', color: 'default' };
        const percentage = (used / total) * 100
        if (percentage >= 90) return { status: 'danger', label: 'Critical', color: 'destructive' }
        if (percentage >= 70) return { status: 'warning', label: 'High', color: 'secondary' }
        if (percentage >= 50) return { status: 'medium', label: 'Medium', color: 'default' }
        return { status: 'low', label: 'Good', color: 'default' }
    }

    const getStatusBadge = (company: Company) => {
        const isActive = company.interviewsUsed < company.interviewQuota
        return isActive ? (
            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                Inactive
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Companies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border rounded-lg border-border/50">
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted animate-pulse rounded w-48" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-32" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 bg-muted animate-pulse rounded w-16" />
                                    <div className="h-6 bg-muted animate-pulse rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (companies.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Companies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
                        <p className="text-muted-foreground mb-4">
                            No companies match your current filter criteria.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Companies ({companies.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50">
                                    <TableHead>Company</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Quota Usage</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((company) => {
                                    const quotaInfo = getQuotaStatus(company.quotaUsed, company.quota)
                                    const isExpanded = expandedRow === company._id

                                    return (
                                        <>
                                            <TableRow
                                                key={company._id}
                                                className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => setExpandedRow(isExpanded ? null : company._id)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{company.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {company._id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-foreground">{company.email}</span>
                                                        </div>
                                                        {company.phone && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-muted-foreground">{company.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-background/50 border-border/50">
                                                        {company.industry || 'Not specified'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(company)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                {company.quotaUsed} / {company.quota}
                                                            </span>
                                                            <Badge variant={quotaInfo.color as any} className="text-xs">
                                                                {quotaInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-300 ${quotaInfo.status === 'danger'
                                                                    ? 'bg-red-500'
                                                                    : quotaInfo.status === 'warning'
                                                                        ? 'bg-yellow-500'
                                                                        : quotaInfo.status === 'medium'
                                                                            ? 'bg-blue-500'
                                                                            : 'bg-green-500'
                                                                    }`}
                                                                style={{
                                                                    width: `${company.quota === 0 ? 0 : Math.min((company.quotaUsed / company.quota) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 hover:bg-muted/50"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-background border-border/50">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation()
                                                                    onViewDetails(company)
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation()
                                                                    onEditCompany(company)
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Company
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation();
                                                                    setCompanyToUpdateQuota(company);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                Update Quota
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation();
                                                                    setCompanyToDelete(company);
                                                                }}
                                                                className="cursor-pointer text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Company
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Row */}
                                            {isExpanded && (
                                                <TableRow className="border-border/50 bg-muted/20">
                                                    <TableCell colSpan={6} className="p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4" />
                                                                    Company Details
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{company.name}</span></div>
                                                                    <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{company.email}</span></div>
                                                                    {company.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{company.phone}</span></div>}
                                                                    {company.website && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-muted-foreground">Website:</span>
                                                                            <a
                                                                                href={company.website}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-primary hover:underline flex items-center gap-1"
                                                                            >
                                                                                {company.website}
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                                    <Users className="h-4 w-4" />
                                                                    Usage Statistics
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div><span className="text-muted-foreground">Quota Used:</span> <span className="text-foreground">{company.quotaUsed}</span></div>
                                                                    <div><span className="text-muted-foreground">Total Quota:</span> <span className="text-foreground">{company.quota}</span></div>
                                                                    <div>
                                                                        <span className="text-muted-foreground">Usage Rate:</span>
                                                                        <span className={`font-medium ${quotaInfo.status === 'danger' ? 'text-red-600' :
                                                                            quotaInfo.status === 'warning' ? 'text-yellow-600' :
                                                                                quotaInfo.status === 'medium' ? 'text-blue-600' :
                                                                                    'text-green-600'
                                                                            }`}>
                                                                            {company.quota === 0 ? 0 : Math.round((company.quotaUsed / company.quota) * 100)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                                    <BarChart3 className="h-4 w-4" />
                                                                    Quick Actions
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => onViewDetails(company)}
                                                                    >
                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                        View Details
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => onEditCompany(company)}
                                                                    >
                                                                        <Edit className="h-3 w-3 mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setCompanyToUpdateQuota(company)}
                                                                    >
                                                                        <Settings className="h-3 w-3 mr-1" />
                                                                        Update Quota
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <UpdateQuotaDialog
                isOpen={!!companyToUpdateQuota}
                onClose={() => setCompanyToUpdateQuota(null)}
                company={companyToUpdateQuota}
                onUpdateQuota={onUpdateQuota}
            />
            <DeleteCompanyDialog
                isOpen={!!companyToDelete}
                onClose={() => setCompanyToDelete(null)}
                company={companyToDelete}
                onDeleteCompany={onDeleteCompany}
            />
        </>
    )
}