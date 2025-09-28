"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Trash2, Building2, BookOpen, UserCheck } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { CreateTemplateData } from "../hooks/useAdminTemplates"

interface CreateTemplateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateTemplateData) => Promise<{ success: boolean; error?: string }>
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit }: CreateTemplateDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState<CreateTemplateData>({
        title: "",
        description: "",
        targetRole: "company",
        questions: [""],
        useCustomPrompt: false,
        agentPrompt: ""
    })

    // Generate dynamic prompt preview
    const generatePromptPreview = (data: CreateTemplateData) => {
        if (!data.title && !data.questions[0]) {
            return "Fill in template details to see generated prompt preview..."
        }

        const roleContext = {
            company: "You are conducting a professional interview for a company position",
            student: "You are conducting a friendly interview to assess a student's learning and potential",
            general: "You are conducting a general interview to understand the candidate's background"
        }[data.targetRole] || "You are conducting an interview"

        const questions = data.questions.filter(q => q.trim()).slice(0, 3)
        const questionPreview = questions.length > 0
            ? `\n\nKey areas to explore:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
            : ""

        return `${roleContext}${data.title ? ` for: ${data.title}` : ""}.${data.description ? ` ${data.description}` : ""}\n\nBe professional, engaging, and encourage detailed responses.${questionPreview}${questions.length > 3 ? `\n\n...and ${data.questions.length - 3} more questions` : ""}`
    }

    const handleSubmit = async () => {
        if (!formData.title || formData.questions.some(q => !q.trim())) {
            setError("Please fill in template name and all questions")
            return
        }

        if (formData.useCustomPrompt && !formData.agentPrompt?.trim()) {
            setError("Please provide a custom agent prompt or disable the custom prompt option")
            return
        }

        setIsLoading(true)
        setError("")

        const result = await onSubmit(formData)

        if (result.success) {
            setFormData({
                title: "",
                description: "",
                targetRole: "company",
                questions: [""],
                useCustomPrompt: false,
                agentPrompt: ""
            })
            onOpenChange(false)
        } else {
            setError(result.error || "Failed to create template")
        }

        setIsLoading(false)
    }

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, ""]
        }))
    }

    const updateQuestion = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === index ? value : q)
        }))
    }

    const removeQuestion = (index: number) => {
        if (formData.questions.length > 1) {
            setFormData(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index)
            }))
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setFormData({
                title: "",
                description: "",
                targetRole: "company",
                questions: [""],
                useCustomPrompt: false,
                agentPrompt: ""
            })
            setError("")
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-foreground">Create New Template</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create a new interview template and assign it to a user role
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-name" className="text-foreground font-medium">
                                Template Name *
                            </Label>
                            <Input
                                id="template-name"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Software Engineer Interview"
                                className="bg-input border-border/50 focus:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target-role" className="text-foreground font-medium">
                                Target Role *
                            </Label>
                            <Select
                                value={formData.targetRole}
                                onValueChange={(value: "company" | "student" | "general") =>
                                    setFormData(prev => ({ ...prev, targetRole: value }))
                                }
                            >
                                <SelectTrigger className="bg-input border-border/50 focus:border-primary/50">
                                    <SelectValue placeholder="Select target role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Company
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="student">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            Student
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="general">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4" />
                                            General User
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="template-description" className="text-foreground font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="template-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this interview template..."
                            className="bg-input border-border/50 focus:border-primary/50 min-h-[100px]"
                        />
                    </div>

                    {/* Agent Prompt Section */}
                    <div className="space-y-4 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground font-medium">AI Agent Configuration</Label>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="use-custom-prompt" className="text-sm text-muted-foreground">
                                    Use Custom Prompt
                                </Label>
                                <Switch
                                    id="use-custom-prompt"
                                    checked={formData.useCustomPrompt}
                                    onCheckedChange={(checked) => setFormData(prev => ({
                                        ...prev,
                                        useCustomPrompt: checked
                                    }))}
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
                                <Label htmlFor="agent-prompt" className="text-foreground font-medium">
                                    Custom Agent Prompt *
                                </Label>
                                <Textarea
                                    id="agent-prompt"
                                    value={formData.agentPrompt || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agentPrompt: e.target.value }))}
                                    placeholder="Enter custom instructions for the AI agent conducting this interview..."
                                    className="bg-input border-border/50 focus:border-primary/50 min-h-[150px]"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Define how the AI agent should behave, what tone to use, and any specific instructions for conducting this interview.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground font-medium">Interview Questions *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addQuestion}
                                className="border-primary/50 hover:bg-primary/10"
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
                                            className="bg-input border-border/50 focus:border-primary/50 min-h-[80px]"
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
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        className="border-border/50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.title || formData.questions.some(q => !q.trim())}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? "Creating..." : "Create Template"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}