import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { AdminTemplate } from "../hooks/useAdminTemplates"
import { ReactElement, useState } from "react"
import { formatDate } from "@/lib/utils/dateUtils"

interface TemplateCardProps {
    template: AdminTemplate
    onEdit: (templateId: string, templateData: any) => Promise<{ success: boolean; error?: string }>
    onDelete: (templateId: string) => Promise<{ success: boolean; error?: string }>
    getRoleIcon: (role: string) => ReactElement
    getRoleColor: (role: string) => string
}

export function TemplateCard({ template, onEdit, onDelete, getRoleIcon, getRoleColor }: TemplateCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = async () => {
        const result = await onDelete(template._id)
        if (result.success) {
            setShowDeleteConfirm(false)
        } else {
            console.error("Failed to delete template:", result.error)
        }
    }

    return (
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg text-foreground mb-2">{template.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {template.description || "No description provided"}
                        </CardDescription>
                    </div>
                    <Badge className={getRoleColor(template.targetRole)} variant="outline">
                        <div className="flex items-center gap-1">
                            {getRoleIcon(template.targetRole)}
                            {template.targetRole}
                        </div>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{template.questions.length} questions</span>
                        <span>Usage: {template.usageCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Created: {formatDate(new Date(template.createdAt))}</span>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>

                    <div className="flex space-x-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // This would open edit dialog in parent component
                                console.log("Edit template:", template._id)
                            }}
                            className="flex-1 border-primary/50 hover:bg-primary/10"
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Button>

                        {!showDeleteConfirm ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        ) : (
                            <div className="flex space-x-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-xs px-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}