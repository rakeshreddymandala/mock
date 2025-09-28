"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Building2,
    Users,
    BarChart3,
    Settings,
    Shield,
    TrendingUp,
    LogOut,
    Activity,
    FileText,
    Bot,
} from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()

    // Auto-detect current page from pathname
    const getCurrentPage = () => {
        if (pathname.includes('/dashboard')) return 'dashboard'
        if (pathname.includes('/companies')) return 'companies'
        if (pathname.includes('/agents')) return 'agents'
        if (pathname.includes('/templates')) return 'templates'
        if (pathname.includes('/interviews')) return 'interviews'
        if (pathname.includes('/analytics')) return 'analytics'
        return 'dashboard'
    }

    const currentPage = getCurrentPage()

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/admin/dashboard" },
        { id: "companies", label: "Companies", icon: Building2, href: "/admin/companies" },
        { id: "agents", label: "Agents", icon: Bot, href: "/admin/agents" },
        { id: "templates", label: "Templates", icon: FileText, href: "/admin/templates" },
        { id: "interviews", label: "Interviews", icon: Users, href: "/admin/interviews" },
        { id: "analytics", label: "Analytics", icon: TrendingUp, href: "/admin/analytics" },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Standardized Header */}
            <header className="glass-effect sticky top-0 z-50 border-b border-border/30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                                <Shield className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <span className="text-xl font-bold gradient-text">Admin Panel</span>
                                <p className="text-xs text-muted-foreground">HumaneQ HR Platform</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            <Activity className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/50 bg-transparent">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Standardized Sidebar */}
                <aside className="w-64 bg-card/50 border-r border-border/50 min-h-[calc(100vh-73px)]">
                    <nav className="p-4 space-y-2">
                        <div className="px-3 py-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</h3>
                        </div>
                        {navItems.map((item) => (
                            <Link key={item.id} href={item.href}>
                                <Button
                                    variant={currentPage === item.id ? "secondary" : "ghost"}
                                    className={`w-full justify-start h-12 text-base transition-all duration-200 ${currentPage === item.id
                                        ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-3 shrink-0" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}

                        <div className="px-3 py-2 pt-6">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</h3>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-12 text-base text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
                        >
                            <Settings className="w-4 h-4 mr-3 shrink-0" />
                            Settings
                        </Button>
                    </nav>
                </aside>

                {/* Main Content with Consistent Styling */}
                <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-card/20">
                    {children}
                </main>
            </div>
        </div>
    )
}