'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    User,
    Trophy,
    Calendar,
    Target,
    LogOut,
    Settings,
    Play,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    Users,
    Brain,
    Shield,
    Sparkles,
    FileText,
    Building2,
    Link2,
    ArrowRight
} from 'lucide-react'

interface GeneralUser {
    id: string
    email: string
    firstName: string
    lastName: string
    subscriptionTier: 'free' | 'premium'
    interviewQuota: number
    interviewsUsed: number
    quotaResetDate: string
    accountStatus: string
    isEmailVerified: boolean
    createdAt: string
}

interface DashboardStats {
    totalInterviews: number
    completedInterviews: number
    averageScore: number
    upcomingInterviews: number
}

interface InterviewSession {
    _id: string
    sessionId: string
    templateTitle: string
    companyName: string
    status: 'pending' | 'in-progress' | 'completed'
    startedAt?: string
    completedAt?: string
    score?: number
    feedback?: string
}

export default function GeneralDashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<GeneralUser | null>(null)
    const [stats, setStats] = useState<DashboardStats>({
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        upcomingInterviews: 0
    })
    const [recentInterviews, setRecentInterviews] = useState<InterviewSession[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('general-user')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            fetchDashboardData(parsedUser.id)
        } else {
            router.push('/general/login')
        }
    }, [router])

    const fetchDashboardData = async (userId: string) => {
        try {
            // Fetch interview sessions and results
            const resultsResponse = await fetch('/api/general/results', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('general-auth-token')}`
                }
            })
            if (resultsResponse.ok) {
                const resultsData = await resultsResponse.json()

                if (resultsData.success) {
                    const sessions = resultsData.data.sessions
                    setRecentInterviews(sessions.slice(0, 5)) // Latest 5 sessions

                    // Calculate stats
                    const completed = sessions.filter((s: InterviewSession) => s.status === 'completed')
                    const totalScore = completed.reduce((sum: number, s: InterviewSession) => sum + (s.score || 0), 0)

                    setStats({
                        totalInterviews: sessions.length,
                        completedInterviews: completed.length,
                        averageScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
                        upcomingInterviews: sessions.filter((s: InterviewSession) => s.status === 'pending').length
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/general/auth/logout', {
                method: 'POST'
            })

            localStorage.removeItem('general-user')
            router.push('/general/login')
        } catch (error) {
            console.error('Logout error:', error)
            // Force logout even on error
            localStorage.removeItem('general-user')
            router.push('/general/login')
        }
    }

    const startInterview = async (sessionId: string) => {
        try {
            // Update session status to in-progress using the general interviews API
            const response = await fetch('/api/general/interviews', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('general-auth-token')}`
                },
                body: JSON.stringify({ sessionId, status: 'in-progress' })
            })

            if (response.ok) {
                // Navigate to interview page
                router.push(`/interview/${sessionId}`)
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to start interview')
            }
        } catch (error) {
            console.error('Error starting interview:', error)
            alert('Failed to start interview. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const quotaPercentage = (user.interviewsUsed / user.interviewQuota) * 100

    return (
        <div className="min-h-screen bg-background cursor-reactive-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3" />
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl hero-float" />
            <div
                className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl hero-float"
                style={{ animationDelay: "2s" }}
            />

            {/* Header */}
            <header className="glass-enterprise sticky top-0 z-50 border-b border-border/50 shadow-lg">
                <div className="flex items-center justify-between px-8 py-5">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xl font-bold gradient-text-enterprise">HumaneQ HR</span>
                                </div>
                                <p className="text-xs text-muted-foreground">General User Portal</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                Welcome back, {user.firstName}!
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {user.subscriptionTier === 'premium' ? 'Premium' : 'Free'}
                                </Badge>
                                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {user.accountStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="glass-enterprise px-4 py-3 rounded-xl border border-blue-500/20">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Interview Quota</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {user.interviewsUsed}/{user.interviewQuota}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/general/profile')}
                            className="hover:bg-card/50 hover:text-foreground transition-all duration-300"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex relative">
                {/* Sidebar */}
                <aside className="w-72 glass-enterprise border-r border-border/50 min-h-[calc(100vh-89px)] backdrop-blur-xl">
                    <nav className="p-6 space-y-3">
                        <div className="px-4 py-3 mb-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Navigation</h3>
                        </div>
                        <Button
                            variant={activeTab === "overview" ? "secondary" : "ghost"}
                            className={`w-full justify-start h-12 text-base transition-all duration-300 ${activeTab === "overview"
                                ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500/20 border border-blue-400/30 shadow-lg"
                                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                                }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            <BarChart3 className="w-5 h-5 mr-4" />
                            Dashboard Overview
                        </Button>
                        <Button
                            variant={activeTab === "interviews" ? "secondary" : "ghost"}
                            className={`w-full justify-start h-12 text-base transition-all duration-300 ${activeTab === "interviews"
                                ? "bg-purple-500/15 text-purple-400 hover:bg-purple-500/20 border border-purple-400/30 shadow-lg"
                                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                                }`}
                            onClick={() => setActiveTab("interviews")}
                        >
                            <Play className="w-5 h-5 mr-4" />
                            My Interviews
                        </Button>
                        <Button
                            variant={activeTab === "results" ? "secondary" : "ghost"}
                            className={`w-full justify-start h-12 text-base transition-all duration-300 ${activeTab === "results"
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-400/30 shadow-lg"
                                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                                }`}
                            onClick={() => setActiveTab("results")}
                        >
                            <Trophy className="w-5 h-5 mr-4" />
                            Results & Analytics
                        </Button>

                        <div className="px-4 py-3 mt-8 mb-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                        </div>
                        <div className="glass-enterprise rounded-xl p-4 border border-blue-500/20">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">AI-Powered Interviews</p>
                                    <p className="text-xs text-muted-foreground">Get personalized feedback</p>
                                </div>
                                <Button
                                    onClick={() => router.push('/templates')}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Browse Templates
                                </Button>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 space-y-8">
                    {/* Alert for email verification */}
                    {!user.isEmailVerified && (
                        <Card className="border-amber-500/20 bg-amber-500/5 animate-fade-in">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-amber-300 font-medium">
                                            Email Verification Required
                                        </p>
                                        <p className="text-amber-400 text-sm">
                                            Please check your email and verify your account to access all features.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="glass-enterprise border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{stats.totalInterviews}</div>
                                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-enterprise border-border/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{stats.completedInterviews}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-enterprise border-border/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 group">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Trophy className="w-5 h-5 text-yellow-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{stats.averageScore}%</div>
                                        <p className="text-xs text-muted-foreground mt-1">Performance rating</p>
                                    </CardContent>
                                </Card>

                                <Card className="glass-enterprise border-border/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Clock className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{stats.upcomingInterviews}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Pending interviews</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Interviews */}
                            <Card className="glass-enterprise border-border/50 shadow-xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                                <Play className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl text-foreground">Recent Interviews</CardTitle>
                                                <CardDescription>Your latest interview sessions</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('interviews')}
                                            className="border-border/50 hover:border-blue-500/50"
                                        >
                                            View All
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentInterviews.length > 0 ? (
                                        recentInterviews.map((interview) => (
                                            <div
                                                key={interview._id}
                                                className="flex items-center justify-between p-4 glass-enterprise rounded-xl border border-border/10 hover:border-blue-500/20 transition-all duration-300"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground text-base">{interview.templateTitle}</p>
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center">
                                                                <Building2 className="w-3 h-3 mr-1" />
                                                                {interview.companyName}
                                                            </span>
                                                            {interview.completedAt && (
                                                                <span>
                                                                    Completed: {new Date(interview.completedAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Badge
                                                        className={`px-3 py-1 ${interview.status === 'completed'
                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                                                            : interview.status === 'in-progress'
                                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                                                                : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                                                            }`}
                                                    >
                                                        {interview.status.replace('-', ' ')}
                                                    </Badge>
                                                    {interview.status === 'pending' && (
                                                        <Button
                                                            onClick={() => startInterview(interview.sessionId)}
                                                            size="sm"
                                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                        >
                                                            Start Interview
                                                        </Button>
                                                    )}
                                                    {interview.score && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-foreground">{interview.score}%</p>
                                                            <p className="text-xs text-muted-foreground">Score</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">No Interviews Yet</h3>
                                            <p className="text-muted-foreground mb-6">Start your first interview to see results here</p>
                                            <Button
                                                onClick={() => router.push('/templates')}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                Browse Templates
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Interviews Tab */}
                    {activeTab === 'interviews' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-foreground">My Interviews</h2>
                                <Button
                                    onClick={() => router.push('/templates')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start New Interview
                                </Button>
                            </div>

                            <Card className="glass-enterprise border-border/50 shadow-xl">
                                <CardContent className="p-6">
                                    {recentInterviews.length > 0 ? (
                                        <div className="grid gap-4">
                                            {recentInterviews.map((interview) => (
                                                <div
                                                    key={interview._id}
                                                    className="flex items-center justify-between p-6 glass-enterprise rounded-xl border border-border/10 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                                            <FileText className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground text-lg">{interview.templateTitle}</p>
                                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                                                <span className="flex items-center">
                                                                    <Building2 className="w-4 h-4 mr-1" />
                                                                    {interview.companyName}
                                                                </span>
                                                                <span>Session ID: {interview.sessionId}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <Badge
                                                            className={`px-3 py-1 ${interview.status === 'completed'
                                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                                                                : interview.status === 'in-progress'
                                                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                                                                    : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                                                                }`}
                                                        >
                                                            {interview.status.replace('-', ' ')}
                                                        </Badge>
                                                        {interview.status === 'pending' && (
                                                            <Button
                                                                onClick={() => startInterview(interview.sessionId)}
                                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                            >
                                                                <Play className="w-4 h-4 mr-2" />
                                                                Start Interview
                                                            </Button>
                                                        )}
                                                        {interview.status === 'completed' && interview.score && (
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-foreground">{interview.score}%</p>
                                                                <p className="text-xs text-muted-foreground">Final Score</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <FileText className="w-10 h-10 text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground mb-3">No Interviews Available</h3>
                                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                                Companies haven't assigned any interviews to you yet. Browse available templates to practice or wait for invitations.
                                            </p>
                                            <Button
                                                onClick={() => router.push('/templates')}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                Browse Practice Templates
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-foreground">Results & Analytics</h2>
                                <Button
                                    onClick={() => router.push('/general/results')}
                                    variant="outline"
                                    className="border-border/50 hover:border-emerald-500/50"
                                >
                                    Detailed Analytics
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <Card className="glass-enterprise border-border/50 shadow-xl">
                                <CardContent className="p-6">
                                    {stats.completedInterviews > 0 ? (
                                        <div className="grid gap-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="text-center p-6 glass-enterprise rounded-xl border border-emerald-500/20">
                                                    <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                                    <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                                                    <p className="text-sm text-muted-foreground">Average Performance</p>
                                                </div>
                                                <div className="text-center p-6 glass-enterprise rounded-xl border border-blue-500/20">
                                                    <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                                    <p className="text-2xl font-bold text-foreground">{stats.completedInterviews}</p>
                                                    <p className="text-sm text-muted-foreground">Completed Interviews</p>
                                                </div>
                                                <div className="text-center p-6 glass-enterprise rounded-xl border border-purple-500/20">
                                                    <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {user.interviewsUsed}/{user.interviewQuota}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Quota Usage</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-4">Performance Breakdown</h3>
                                                <div className="space-y-3">
                                                    {recentInterviews.filter(i => i.status === 'completed' && i.score).map((interview) => (
                                                        <div key={interview._id} className="flex items-center justify-between p-4 glass-enterprise rounded-xl border border-border/10">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg flex items-center justify-center">
                                                                    <FileText className="w-5 h-5 text-emerald-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{interview.templateTitle}</p>
                                                                    <p className="text-sm text-muted-foreground">{interview.companyName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="text-right">
                                                                    <p className="text-lg font-bold text-emerald-400">{interview.score}%</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {new Date(interview.completedAt!).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <Trophy className="w-10 h-10 text-emerald-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground mb-3">No Results Yet</h3>
                                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                                Complete your first interview to see detailed performance analytics and AI-powered feedback.
                                            </p>
                                            <Button
                                                onClick={() => router.push('/templates')}
                                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                            >
                                                Take First Interview
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}