"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, FileText, BookOpen, UserCheck } from "lucide-react"
import { AdminLayout } from "../components/AdminLayout"
import { useAdminTemplates } from "./hooks/useAdminTemplates"
import { TemplateCard } from "./components/TemplateCard"
import { CreateTemplateDialog } from "./components/CreateTemplateDialog"

export default function AdminTemplatesPage() {
    const { templates, isLoading, createTemplate, deleteTemplate } = useAdminTemplates()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "company": return <Building2 className="w-4 h-4" />
            case "student": return <BookOpen className="w-4 h-4" />
            case "general": return <UserCheck className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "company": return "bg-primary/10 text-primary border-primary/20"
            case "student": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "general": return "bg-green-500/10 text-green-500 border-green-500/20"
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    const handleEdit = async (templateId: string, templateData: any) => {
        console.log("Edit template:", templateId, templateData)
        // TODO: Implement edit functionality
        return { success: true }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Interview Templates</h1>
                        <p className="text-muted-foreground mt-2">
                            Create and manage interview templates for different roles
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template._id}
                            template={template}
                            onEdit={handleEdit}
                            onDelete={deleteTemplate}
                            getRoleIcon={getRoleIcon}
                            getRoleColor={getRoleColor}
                        />
                    ))}
                </div>

                {templates.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No templates yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first interview template to get started
                        </p>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/10"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Template
                        </Button>
                    </div>
                )}

                <CreateTemplateDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSubmit={createTemplate}
                />
            </div>
        </AdminLayout>
    )
}