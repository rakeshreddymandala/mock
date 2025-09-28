"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { DetailedAgent } from "../hooks/useAgentDetails"

interface AgentEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agent: DetailedAgent
    onSave: (updateData: any) => Promise<{ success: boolean; error?: string }>
    isLoading: boolean
}

export function AgentEditDialog({ 
    open, 
    onOpenChange, 
    agent, 
    onSave, 
    isLoading 
}: AgentEditDialogProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        questions: [''],
        agentPrompt: '',
        useCustomPrompt: false,
        isActive: true,
    })
    const [error, setError] = useState('')
    const [hasChanges, setHasChanges] = useState(false)

    // Initialize form data when agent changes or dialog opens
    useEffect(() => {
        if (agent && open) {
            // Convert questions to strings if they are objects
            const questionStrings = agent.questions.length > 0 
                ? agent.questions.map(q => typeof q === 'string' ? q : q.question || '')
                : ['']
                
            setFormData({
                title: agent.templateTitle,
                description: agent.templateDescription || '',
                questions: questionStrings,
                agentPrompt: agent.agentPrompt || '',
                useCustomPrompt: agent.useCustomPrompt || false,
                isActive: agent.isActive,
            })
            setHasChanges(false)
            setError('')
        }
    }, [agent, open])

    // Generate dynamic prompt preview
    const generatePromptPreview = (data: typeof formData) => {
        if (!data.title && !data.questions[0]) {
            return "Fill in template details to see generated prompt preview..."
        }

        const roleContext = {
            company: "You are Sarah, a professional, warm, and empathetic AI interviewer conducting a company interview",
            student: "You are Sarah, a friendly and encouraging AI interviewer assessing a student's potential and learning journey",
            general: "You are Sarah, a professional AI interviewer conducting a comprehensive general assessment"
        }[agent.targetRole] || "You are Sarah, a professional AI interviewer"

        const questions = data.questions.filter(q => typeof q === 'string' && q.trim()).slice(0, 3)
        const questionPreview = questions.length > 0
            ? `\n\nKey questions to cover:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
            : ""

        return `${roleContext} for: ${data.title}.${data.description ? ` ${data.description}` : ""}\n\nBe professional, engaging, and encouraging. Create a positive interview experience.${questionPreview}${questions.length > 3 ? `\n\n...and ${data.questions.length - 3} more questions` : ""}`
    }

    const handleSave = async () => {
        if (!formData.title.trim() || formData.questions.some(q => typeof q === 'string' && !q.trim())) {
            setError("Please fill in template title and all questions")
            return
        }

        if (formData.useCustomPrompt && !formData.agentPrompt?.trim()) {
            setError("Please provide a custom agent prompt or disable the custom prompt option")
            return
        }

        setError('')

        // Only send changed fields
        const updateData: any = {}
        if (formData.title !== agent.templateTitle) updateData.title = formData.title
        if (formData.description !== (agent.templateDescription || '')) updateData.description = formData.description
        if (JSON.stringify(formData.questions) !== JSON.stringify(agent.questions)) updateData.questions = formData.questions
        if (formData.useCustomPrompt !== agent.useCustomPrompt) updateData.useCustomPrompt = formData.useCustomPrompt
        if (formData.agentPrompt !== agent.agentPrompt) updateData.agentPrompt = formData.agentPrompt
        if (formData.isActive !== agent.isActive) updateData.isActive = formData.isActive

        // If switching to custom prompt or updating custom prompt
        if (formData.useCustomPrompt) {
            updateData.agentPrompt = formData.agentPrompt
        } else {
            // Generate new dynamic prompt if questions or title changed
            if (updateData.title || updateData.questions || updateData.description) {
                updateData.agentPrompt = generatePromptPreview(formData)
            }
        }

        const result = await onSave(updateData)
        
        if (result.success) {
            setHasChanges(false)
        } else {
            setError(result.error || 'Failed to update agent')
        }
    }

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, ""]
        }))
        setHasChanges(true)
    }

    const updateQuestion = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === index ? value : q)
        }))
        setHasChanges(true)
    }

    const removeQuestion = (index: number) => {
        if (formData.questions.length > 1) {
            setFormData(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index)
            }))
            setHasChanges(true)
        }
    }

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && hasChanges) {
            const shouldDiscard = confirm("You have unsaved changes. Are you sure you want to discard them?")
            if (!shouldDiscard) return
        }
        
        if (!newOpen) {
            setFormData({
                title: '',
                description: '',
                questions: [''],
                agentPrompt: '',
                useCustomPrompt: false,
                isActive: true,
            })
            setError('')
            setHasChanges(false)
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Agent</DialogTitle>
                    <DialogDescription>
                        Update the interview template and agent configuration
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Template Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                                placeholder="e.g., Software Engineer Interview"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="isActive">Status</Label>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                                />
                                <Label htmlFor="isActive">
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            placeholder="Brief description of this interview template..."
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Interview Questions *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addQuestion}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Question
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.questions.map((question, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-2">
                                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <Textarea
                                            value={question}
                                            onChange={(e) => updateQuestion(index, e.target.value)}
                                            placeholder={`Enter question ${index + 1}...`}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                    {formData.questions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeQuestion(index)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Prompt Configuration */}
                    <div className="space-y-4 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                            <Label>AI Agent Configuration</Label>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="use-custom-prompt" className="text-sm">
                                    Use Custom Prompt
                                </Label>
                                <Switch
                                    id="use-custom-prompt"
                                    checked={formData.useCustomPrompt}
                                    onCheckedChange={(checked) => handleFieldChange('useCustomPrompt', checked)}
                                />
                            </div>
                        </div>

                        {!formData.useCustomPrompt && (
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Generated Prompt Preview</Label>
                                <div className="bg-muted/20 border border-border/30 rounded-lg p-3 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                    {generatePromptPreview(formData)}
                                </div>
                            </div>
                        )}

                        {formData.useCustomPrompt && (
                            <div className="space-y-2">
                                <Label htmlFor="agent-prompt">Custom Agent Prompt *</Label>
                                <Textarea
                                    id="agent-prompt"
                                    value={formData.agentPrompt}
                                    onChange={(e) => handleFieldChange('agentPrompt', e.target.value)}
                                    placeholder="Enter custom instructions for the AI agent conducting this interview..."
                                    className="min-h-[150px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Define how the AI agent should behave, what tone to use, and any specific instructions for conducting this interview.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !hasChanges || !formData.title || formData.questions.some(q => typeof q === 'string' && !q.trim())}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}