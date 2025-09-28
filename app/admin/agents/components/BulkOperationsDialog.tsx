"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { 
    Play, 
    Pause, 
    Trash2, 
    UserCheck, 
    RefreshCw, 
    AlertTriangle,
    CheckCircle,
    XCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BulkOperationsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedAgents: string[]
    onBulkOperation: (operation: string, params?: any) => Promise<{ 
        success: boolean
        results?: { successCount: number; failureCount: number; errors?: string[] }
        error?: string 
    }>
    isLoading: boolean
}

export function BulkOperationsDialog({ 
    open, 
    onOpenChange, 
    selectedAgents, 
    onBulkOperation, 
    isLoading 
}: BulkOperationsDialogProps) {
    const [operation, setOperation] = useState<string>("")
    const [newRole, setNewRole] = useState<string>("")
    const [confirmationText, setConfirmationText] = useState("")
    const [results, setResults] = useState<{
        successCount: number
        failureCount: number
        errors?: string[]
    } | null>(null)
    const [error, setError] = useState("")

    const operations = [
        { 
            value: "activate", 
            label: "Activate Agents", 
            icon: Play, 
            description: "Enable selected agents for interviews",
            variant: "default" as const,
            requiresConfirmation: false
        },
        { 
            value: "deactivate", 
            label: "Deactivate Agents", 
            icon: Pause, 
            description: "Disable selected agents from conducting interviews",
            variant: "secondary" as const,
            requiresConfirmation: false
        },
        { 
            value: "update_role", 
            label: "Update Target Role", 
            icon: UserCheck, 
            description: "Change the target role for selected agents",
            variant: "default" as const,
            requiresConfirmation: false,
            requiresRole: true
        },
        { 
            value: "regenerate_failed", 
            label: "Regenerate Failed Agents", 
            icon: RefreshCw, 
            description: "Recreate agents that failed during creation",
            variant: "secondary" as const,
            requiresConfirmation: false
        },
        { 
            value: "delete", 
            label: "Delete Agents", 
            icon: Trash2, 
            description: "Permanently delete selected agents and all associated data",
            variant: "destructive" as const,
            requiresConfirmation: true,
            confirmationText: "DELETE AGENTS"
        }
    ]

    const selectedOperation = operations.find(op => op.value === operation)

    const handleExecute = async () => {
        if (!operation) {
            setError("Please select an operation")
            return
        }

        if (selectedOperation?.requiresRole && !newRole) {
            setError("Please select a target role")
            return
        }

        if (selectedOperation?.requiresConfirmation) {
            const expectedText = selectedOperation.confirmationText || ""
            if (confirmationText !== expectedText) {
                setError(`Please type "${expectedText}" to confirm`)
                return
            }
        }

        setError("")
        setResults(null)

        const params = selectedOperation?.requiresRole ? { role: newRole } : undefined
        const result = await onBulkOperation(operation, params)
        
        if (result.success && result.results) {
            setResults(result.results)
            if (result.results.successCount === selectedAgents.length) {
                // All successful, close dialog after showing brief success
                setTimeout(() => {
                    handleClose()
                }, 2000)
            }
        } else {
            setError(result.error || `Failed to ${selectedOperation?.label.toLowerCase()}`)
        }
    }

    const handleClose = () => {
        setOperation("")
        setNewRole("")
        setConfirmationText("")
        setResults(null)
        setError("")
        onOpenChange(false)
    }

    if (selectedAgents.length === 0) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Operations</DialogTitle>
                    <DialogDescription>
                        Perform operations on {selectedAgents.length} selected agent{selectedAgents.length !== 1 ? 's' : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Operation Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="operation">Select Operation</Label>
                        <Select value={operation} onValueChange={setOperation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an operation..." />
                            </SelectTrigger>
                            <SelectContent>
                                {operations.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                        <div className="flex items-center space-x-2">
                                            <op.icon className="w-4 h-4" />
                                            <span>{op.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {selectedOperation && (
                            <p className="text-sm text-muted-foreground">
                                {selectedOperation.description}
                            </p>
                        )}
                    </div>

                    {/* Role Selection */}
                    {selectedOperation?.requiresRole && (
                        <div className="space-y-2">
                            <Label htmlFor="role">Target Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Confirmation Input */}
                    {selectedOperation?.requiresConfirmation && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmation">
                                Type <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                    {selectedOperation.confirmationText}
                                </code> to confirm
                            </Label>
                            <Input
                                id="confirmation"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder={selectedOperation.confirmationText}
                                className={confirmationText && confirmationText !== selectedOperation.confirmationText 
                                    ? "border-destructive" : ""
                                }
                            />
                        </div>
                    )}

                    {/* Warning for destructive operations */}
                    {selectedOperation?.variant === "destructive" && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-destructive mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-medium">Warning</span>
                            </div>
                            <p className="text-sm text-destructive">
                                This action cannot be undone. Selected agents and all associated data will be permanently deleted.
                            </p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Results Display */}
                    {results && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                {results.failureCount === 0 ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className="font-medium">Operation Results</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                                    <div className="text-sm text-muted-foreground">Successful</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{results.failureCount}</div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                </div>
                            </div>

                            {results.errors && results.errors.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Errors:</Label>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {results.errors.map((error, index) => (
                                            <div key={index} className="text-sm text-destructive bg-destructive/5 p-2 rounded">
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {results ? 'Close' : 'Cancel'}
                    </Button>
                    
                    {!results && (
                        <Button
                            variant={selectedOperation?.variant || "default"}
                            onClick={handleExecute}
                            disabled={
                                isLoading || 
                                !operation || 
                                (selectedOperation?.requiresRole && !newRole) ||
                                (selectedOperation?.requiresConfirmation && 
                                 confirmationText !== selectedOperation.confirmationText)
                            }
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {selectedOperation?.icon && (
                                        <selectedOperation.icon className="w-4 h-4 mr-2" />
                                    )}
                                    Execute
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}