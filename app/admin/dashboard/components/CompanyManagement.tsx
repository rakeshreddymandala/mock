import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Plus, Edit } from "lucide-react"
import { formatDate } from "@/lib/utils/dateUtils"

interface Company {
    _id: string
    companyName: string
    email: string
    createdAt: string
    interviewQuota: number
    interviewsUsed: number
}

interface CompanyManagementProps {
    companies: Company[]
    isLoading: boolean
    onUpdateQuota: (companyId: string, newQuota: number, addToExisting: boolean) => Promise<{ success: boolean; error?: string }>
    onAddCompany: (companyData: { name: string; email: string; initialQuota: string }) => Promise<{ success: boolean; error?: string }>
}

export function CompanyManagement({ companies, isLoading, onUpdateQuota, onAddCompany }: CompanyManagementProps) {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [newQuota, setNewQuota] = useState("")
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [newCompanyData, setNewCompanyData] = useState({
        name: "",
        email: "",
        initialQuota: "50",
    })
    const [actionType, setActionType] = useState<"update" | "add">("update")

    const handleUpdateQuota = async () => {
        if (!selectedCompany || !newQuota.trim()) return

        try {
            const result = await onUpdateQuota(selectedCompany._id, Number.parseInt(newQuota), actionType === "add")
            if (result.success) {
                setSelectedCompany(null)
                setNewQuota("")
                setActionType("update")
                // You could add a success toast notification here
                alert(actionType === "add" ? "Interviews added successfully!" : "Quota updated successfully!")
            } else {
                alert(result.error || "Failed to update quota")
            }
        } catch (error) {
            console.error("Error updating quota:", error)
            alert("Network error. Please try again.")
        }
    }

    const handleAddCompany = async () => {
        try {
            const result = await onAddCompany(newCompanyData)
            if (result.success) {
                setShowAddCompany(false)
                setNewCompanyData({ name: "", email: "", initialQuota: "50" })
                alert("Company added successfully!")
            } else {
                alert(result.error || "Failed to add company")
            }
        } catch (error) {
            console.error("Error adding company:", error)
            alert("Network error. Please try again.")
        }
    }

    const handleAddInterviews = (company: Company) => {
        setSelectedCompany(company)
        setNewQuota("")
        setActionType("add")
    }

    if (isLoading) {
        return (
            <Card className="border-border/50 hover:border-primary/20 transition-all duration-300 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mb-2" />
                            <div className="h-4 w-96 bg-muted/30 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-32 bg-muted/50 rounded animate-pulse" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50">
                                    <TableHead className="text-muted-foreground font-semibold">Company Name</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Registered</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Quota Usage</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                                    <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, index) => (
                                    <TableRow key={index} className="border-border/30">
                                        <TableCell><div className="h-4 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-48 bg-muted/30 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted/30 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted/30 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 w-16 bg-muted/50 rounded animate-pulse" />
                                                <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 hover:border-primary/20 transition-all duration-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl text-foreground">Company Management</CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">
                            Manage registered companies and their interview quotas
                        </CardDescription>
                    </div>
                    <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Company
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-foreground">Add New Company</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Register a new company and set their initial interview quota
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company-name" className="text-foreground">
                                        Company Name
                                    </Label>
                                    <Input
                                        id="company-name"
                                        value={newCompanyData.name}
                                        onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                                        placeholder="Enter company name"
                                        className="bg-input border-border/50 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company-email" className="text-foreground">
                                        Company Email
                                    </Label>
                                    <Input
                                        id="company-email"
                                        type="email"
                                        value={newCompanyData.email}
                                        onChange={(e) => setNewCompanyData({ ...newCompanyData, email: e.target.value })}
                                        placeholder="hr@company.com"
                                        className="bg-input border-border/50 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initial-quota" className="text-foreground">
                                        Initial Interview Quota
                                    </Label>
                                    <Input
                                        id="initial-quota"
                                        type="number"
                                        value={newCompanyData.initialQuota}
                                        onChange={(e) => setNewCompanyData({ ...newCompanyData, initialQuota: e.target.value })}
                                        className="bg-input border-border/50 focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddCompany(false)} className="border-border/50">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddCompany} className="bg-primary hover:bg-primary/90">
                                    Add Company
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50">
                                <TableHead className="text-muted-foreground font-semibold">Company Name</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Registered</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Quota Usage</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow
                                    key={company._id}
                                    className="border-border/30 hover:bg-card/50 transition-colors duration-200"
                                >
                                    <TableCell className="font-medium text-foreground">{company.companyName}</TableCell>
                                    <TableCell className="text-muted-foreground">{company.email}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(new Date(company.createdAt))}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-sm font-medium text-foreground">
                                                {company.interviewsUsed}/{company.interviewQuota || 0}
                                            </div>
                                            <div className="w-24 bg-muted/50 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${company.interviewsUsed >= (company.interviewQuota || 0)
                                                        ? "bg-destructive"
                                                        : company.interviewsUsed / (company.interviewQuota || 1) > 0.8
                                                            ? "bg-chart-3"
                                                            : "bg-primary"
                                                        }`}
                                                    style={{
                                                        width: `${Math.min((company.interviewsUsed / (company.interviewQuota || 1)) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={company.interviewsUsed >= (company.interviewQuota || 0) ? "destructive" : "secondary"}
                                            className={
                                                company.interviewsUsed >= (company.interviewQuota || 0)
                                                    ? "bg-destructive/10 text-destructive border-destructive/20"
                                                    : "bg-primary/10 text-primary border-primary/20"
                                            }
                                        >
                                            {company.interviewsUsed >= (company.interviewQuota || 0) ? "Quota Reached" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddInterviews(company)}
                                                className="border-border/50 hover:border-primary/50 hover:bg-primary/10"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCompany(company)
                                                            setNewQuota((company.interviewQuota || 0).toString())
                                                            setActionType("update")
                                                        }}
                                                        className="hover:bg-accent/10 hover:text-accent"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-card border-border/50">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl text-foreground">
                                                            {actionType === "add" ? "Add Interview Allocation" : "Update Interview Quota"}
                                                        </DialogTitle>
                                                        <DialogDescription className="text-muted-foreground">
                                                            {actionType === "add"
                                                                ? `Add more interviews to ${selectedCompany?.companyName}'s existing quota`
                                                                : `Modify the total interview quota for ${selectedCompany?.companyName}`}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="quota" className="text-foreground">
                                                                {actionType === "add" ? "Additional Interviews" : "New Total Quota"}
                                                            </Label>
                                                            <Input
                                                                id="quota"
                                                                type="number"
                                                                value={newQuota}
                                                                onChange={(e) => setNewQuota(e.target.value)}
                                                                className="bg-input border-border/50 focus:border-primary/50"
                                                            />
                                                        </div>
                                                        <div className="text-sm text-muted-foreground space-y-1 bg-card/30 p-3 rounded-lg">
                                                            <div>Current quota: {selectedCompany?.interviewQuota || 0} interviews</div>
                                                            <div>Current usage: {selectedCompany?.interviewsUsed || 0} interviews</div>
                                                            {actionType === "add" && (
                                                                <div className="font-medium text-primary">
                                                                    New total:{" "}
                                                                    {(selectedCompany?.interviewQuota || 0) + Number.parseInt(newQuota || "0")}{" "}
                                                                    interviews
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setSelectedCompany(null)}
                                                            className="border-border/50"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleUpdateQuota} className="bg-primary hover:bg-primary/90">
                                                            {actionType === "add" ? "Add Interviews" : "Update Quota"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}