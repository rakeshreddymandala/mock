import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface InterviewsFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
}

export function InterviewsFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
}: InterviewsFiltersProps) {
    return (
        <div className="flex items-center space-x-4 bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search interviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50"
                />
            </div>
            <Button variant="outline" className="border-border/50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
            </Button>
        </div>
    )
}