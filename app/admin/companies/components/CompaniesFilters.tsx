import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

export interface CompaniesFiltersState {
    search: string
    status: 'all' | 'active' | 'inactive'
    quotaRange: 'all' | 'low' | 'medium' | 'high'
}

interface CompaniesFiltersProps {
    filters: CompaniesFiltersState
    onFiltersChange: (filters: CompaniesFiltersState) => void
    resultsCount: number
}

export function CompaniesFilters({
    filters,
    onFiltersChange,
    resultsCount
}: CompaniesFiltersProps) {
    const hasActiveFilters = filters.status !== 'all' || filters.quotaRange !== 'all' || filters.search !== ''

    const clearFilters = () => {
        onFiltersChange({
            search: '',
            status: 'all',
            quotaRange: 'all'
        })
    }

    const updateFilter = (key: keyof CompaniesFiltersState, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value
        })
    }

    return (
        <div className="space-y-4">
            {/* Search and Actions Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search companies by name, email, or industry..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                        <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.quotaRange} onValueChange={(value) => updateFilter('quotaRange', value)}>
                        <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                            <SelectValue placeholder="Quota" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Quota</SelectItem>
                            <SelectItem value="low">Low (0-33%)</SelectItem>
                            <SelectItem value="medium">Medium (34-66%)</SelectItem>
                            <SelectItem value="high">High (67%+)</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="px-3 text-muted-foreground hover:text-foreground border-border/50"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Filters and Results */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    {filters.search && (
                        <Badge variant="secondary" className="text-xs">
                            Search: {filters.search}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-2 hover:bg-transparent"
                                onClick={() => updateFilter('search', '')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}

                    {filters.status !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                            Status: {filters.status}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-2 hover:bg-transparent"
                                onClick={() => updateFilter('status', 'all')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}

                    {filters.quotaRange !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                            Quota: {filters.quotaRange}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-2 hover:bg-transparent"
                                onClick={() => updateFilter('quotaRange', 'all')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {resultsCount} companies found
                </div>
            </div>
        </div>
    )
}