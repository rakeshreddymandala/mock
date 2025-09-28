"use client"

import { useState, useEffect } from "react"

export interface AdminTemplate {
    _id: string
    title: string
    description: string
    questions: Array<{
        id: string
        question: string
        timeLimit?: number
        required: boolean
    }>
    targetRole: "company" | "student" | "general"
    isActive: boolean
    agentId?: string
    agentPrompt?: string
    useCustomPrompt?: boolean
    createdAt: string
    updatedAt: string
    usageCount?: number
}

export interface CreateTemplateData {
    title: string
    description: string
    targetRole: "company" | "student" | "general"
    questions: string[]
    useCustomPrompt?: boolean
    agentPrompt?: string
}

export function useAdminTemplates() {
    const [templates, setTemplates] = useState<AdminTemplate[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchTemplates = async () => {
        try {
            const response = await fetch("/api/admin/templates")
            if (response.ok) {
                const data = await response.json()
                setTemplates(data.templates || [])
            } else {
                console.error("Failed to fetch templates")
            }
        } catch (error) {
            console.error("Error fetching templates:", error)
        }
    }

    const createTemplate = async (templateData: CreateTemplateData) => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: templateData.title,
                    description: templateData.description,
                    targetRole: templateData.targetRole,
                    questions: templateData.questions.map((q, index) => ({
                        id: `q${index + 1}`,
                        question: q,
                        timeLimit: 300,
                        required: true
                    }))
                })
            })

            if (response.ok) {
                await fetchTemplates()
                return { success: true }
            } else {
                const data = await response.json()
                return { success: false, error: data.error || "Failed to create template" }
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." }
        } finally {
            setIsLoading(false)
        }
    }

    const updateTemplate = async (templateId: string, templateData: CreateTemplateData) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/templates/${templateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: templateData.title,
                    description: templateData.description,
                    targetRole: templateData.targetRole,
                    questions: templateData.questions.map((q, index) => ({
                        id: `q${index + 1}`,
                        question: q,
                        timeLimit: 300,
                        required: true
                    }))
                })
            })

            if (response.ok) {
                await fetchTemplates()
                return { success: true }
            } else {
                const data = await response.json()
                return { success: false, error: data.error || "Failed to update template" }
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." }
        } finally {
            setIsLoading(false)
        }
    }

    const deleteTemplate = async (templateId: string) => {
        try {
            const response = await fetch(`/api/admin/templates/${templateId}`, {
                method: "DELETE"
            })

            if (response.ok) {
                await fetchTemplates()
                return { success: true }
            } else {
                return { success: false, error: "Failed to delete template" }
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." }
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    return {
        templates,
        isLoading,
        fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
    }
}