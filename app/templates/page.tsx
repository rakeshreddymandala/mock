'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Clock,
    Play,
    Star,
    Users,
    Brain,
    ArrowLeft,
    Search,
    Filter,
    ChevronDown,
    Building2,
    BookOpen,
    Target,
    Trophy,
    Zap,
    CheckCircle
} from 'lucide-react'

interface Template {
    id: string
    title: string
    description: string
    companyName: string
    duration: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    skills: string[]
    category: string
    questionsCount: number
    isPublic: boolean
    createdAt: string
}

interface GeneralUser {
    id: string
    email: string
    firstName: string
    lastName: string
    subscriptionTier: 'free' | 'premium'
    interviewQuota: number
    interviewsUsed: number
}

export default function TemplatesPage() {
    const router = useRouter()
    const [user, setUser] = useState<GeneralUser | null>(null)
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
    const [startingInterview, setStartingInterview] = useState<string | null>(null)

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('general-user')
        if (userData) {
            setUser(JSON.parse(userData))
            fetchTemplates()
        } else {
            router.push('/general/login')
        }
    }, [router])

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/general/templates', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('general-auth-token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setTemplates(data.data.templates)
                }
            }
        } catch (error) {
            console.error('Error fetching templates:', error)
        } finally {
            setLoading(false)
        }
    }

    const startInterview = async (templateId: string) => {
        if (!user) return

        // Check quota for free users
        if (user.subscriptionTier !== 'premium' && user.interviewsUsed >= user.interviewQuota) {
            alert(`You've reached your interview quota (${user.interviewsUsed}/${user.interviewQuota}). Please upgrade to premium for unlimited interviews.`)
            return
        }

        setStartingInterview(templateId)

        try {
            const response = await fetch('/api/general/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('general-auth-token')}`
                },
                body: JSON.stringify({ templateId })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    // Navigate to interview
                    router.push(`/interview/${data.data.sessionId}`)
                } else {
                    alert(data.error || 'Failed to start interview')
                }
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to start interview')
            }
        } catch (error) {
            console.error('Error starting interview:', error)
            alert('Failed to start interview. Please try again.')
        } finally {
            setStartingInterview(null)
        }
    }

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
        const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty

        return matchesSearch && matchesCategory && matchesDifficulty
    })

    const categories = Array.from(new Set(templates.map(t => t.category)))
    const difficulties = ['beginner', 'intermediate', 'advanced']

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-400/30'
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-400/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Development': return <Brain className="w-4 h-4" />
            case 'Data Science': return <Target className="w-4 h-4" />
            case 'Product Management': return <Users className="w-4 h-4" />
            default: return <BookOpen className="w-4 h-4" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading interview templates...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

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
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/general/dashboard')}
                            className="hover:bg-card/50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text-enterprise">Interview Templates</h1>
                                <p className="text-xs text-muted-foreground">Practice & improve your skills</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="glass-enterprise px-4 py-3 rounded-xl border border-blue-500/20">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Quota Remaining</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {user.subscriptionTier === 'premium'
                                            ? '∞'
                                            : `${user.interviewQuota - user.interviewsUsed}/${user.interviewQuota}`
                                        }
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                        {user.subscriptionTier !== 'premium' && (
                            <Button
                                onClick={() => router.push('/general/upgrade')}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Upgrade to Premium
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-8 py-8 max-w-7xl">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search templates, skills, or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 glass-enterprise rounded-xl border border-border/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 glass-enterprise rounded-xl border border-border/50 focus:border-blue-500/50 focus:outline-none"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-3 glass-enterprise rounded-xl border border-border/50 focus:border-blue-500/50 focus:outline-none"
                        >
                            <option value="all">All Levels</option>
                            {difficulties.map(difficulty => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="glass-enterprise border-border/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                            {getCategoryIcon(template.category)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                                                {template.title}
                                            </CardTitle>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{template.companyName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={getDifficultyColor(template.difficulty)}>
                                        {template.difficulty}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CardDescription className="text-muted-foreground leading-relaxed">
                                    {template.description}
                                </CardDescription>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{template.duration} mins</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{template.questionsCount} questions</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {template.skills.slice(0, 3).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs border-border/50">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {template.skills.length > 3 && (
                                        <Badge variant="outline" className="text-xs border-border/50">
                                            +{template.skills.length - 3} more
                                        </Badge>
                                    )}
                                </div>

                                <Button
                                    onClick={() => startInterview(template.id)}
                                    disabled={startingInterview === template.id}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                >
                                    {startingInterview === template.id ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Starting Interview...
                                        </div>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start Interview
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">No Templates Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Try adjusting your search terms or filters to find more interview templates.
                        </p>
                        <Button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedCategory('all')
                                setSelectedDifficulty('all')
                            }}
                            variant="outline"
                            className="border-border/50 hover:border-blue-500/50"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}