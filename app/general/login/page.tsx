'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Brain, Shield, Sparkles, Users } from 'lucide-react'

export default function GeneralLoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        if (error) setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/general/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('general-user', JSON.stringify(data.data.user))

                // Redirect to dashboard
                router.push('/general/dashboard')
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background cursor-reactive-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
            <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl hero-float" />
            <div
                className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl hero-float"
                style={{ animationDelay: "2s" }}
            />

            <div className="relative flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-all duration-300 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>

                    <Card className="glass-enterprise border-enterprise shadow-2xl animate-fade-in">
                        <CardHeader className="text-center pb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold gradient-text-enterprise">HumaneQ HR</span>
                            </div>
                            <CardTitle className="text-3xl font-bold text-foreground mb-2">General User Portal</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground">
                                Access your personal interview dashboard and practice sessions with AI-powered insights.
                            </CardDescription>
                            <div className="flex justify-center space-x-2 mt-4">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Secure
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI-Enhanced
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 px-8 pb-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 animate-shake">
                                        <p className="text-destructive text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email address"
                                            className="h-12 text-base bg-card/50 border-border/50 focus:border-primary transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            className="h-12 text-base bg-card/50 border-border/50 focus:border-primary transition-all duration-300"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !formData.email || !formData.password}
                                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Access Dashboard'
                                    )}
                                </Button>
                            </form>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-base text-muted-foreground">New to HumaneQ HR?</p>
                                    <Link href="/general/signup">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 text-base border-blue-500/50 hover:bg-blue-500/5 hover:border-blue-400/70 transition-all duration-300 bg-transparent text-blue-400 hover:text-blue-300"
                                        >
                                            Create Account
                                        </Button>
                                    </Link>
                                </div>

                                <div className="text-center pt-4">
                                    <div className="glass-enterprise rounded-xl p-4 border border-blue-500/20">
                                        <p className="text-sm text-muted-foreground mb-2">Demo Credentials</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-mono text-blue-400">alex.thompson@example.com / TestPass123!</p>
                                            <p className="text-sm font-mono text-purple-400">sarah.mitchell@example.com / TestPass123!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                        <p className="text-sm text-muted-foreground mb-4">Other Login Options</p>
                        <div className="flex justify-center space-x-4">
                            <Link href="/student/login">
                                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                                    Student Portal
                                </Button>
                            </Link>
                            <Link href="/company/login">
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                    Company Portal
                                </Button>
                            </Link>
                            <Link href="/admin/login">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Admin Portal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}