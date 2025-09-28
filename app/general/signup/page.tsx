'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, CheckCircle } from 'lucide-react'

export default function GeneralSignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        location: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        if (error) setError('')
    }

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            setError('Please fill in all required fields')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return false
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/general/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    location: formData.location
                })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.error || 'Signup failed')
            }
        } catch (error) {
            console.error('Signup error:', error)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = formData.email && formData.password && formData.confirmPassword &&
        formData.firstName && formData.lastName

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Account Created!
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Please check your email to verify your account before signing in.
                        </p>
                        <Button
                            onClick={() => router.push('/general/login')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Join HumaneQ HR as a general user
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-900/20 border border-red-500/50 rounded-md p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-gray-300">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="John"
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-gray-300">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Doe"
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">
                                    Email Address *
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-gray-300">
                                    Phone Number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-gray-300">
                                    Location
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="New York, NY"
                                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">
                                    Password *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a strong password"
                                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-300">
                                    Confirm Password *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!isFormValid || loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 h-11"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="text-center space-y-4">
                            <div className="border-t border-slate-700 pt-4">
                                <p className="text-sm text-gray-400">
                                    Already have an account?{' '}
                                    <Link
                                        href="/general/login"
                                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}