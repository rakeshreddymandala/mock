"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { AlertTriangle, Trash2 } from "lucide-react"
import { DetailedAgent } from "../hooks/useAgentDetails"

interface AgentDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agent: DetailedAgent | null
    onConfirm: () => Promise<{ success: boolean; error?: string }>
    isLoading: boolean
}

export function AgentDeleteDialog({ 
    open, 
    onOpenChange, 
    agent, 
    onConfirm, 
    isLoading 
}: AgentDeleteDialogProps) {
    const [confirmationText, setConfirmationText] = useState("")
    const [error, setError] = useState("")

    if (!agent) return null

    const expectedText = `DELETE ${agent.templateTitle}`
    const isConfirmed = confirmationText === expectedText

    const handleConfirm = async () => {
        if (!isConfirmed) {
            setError("Please type the confirmation text exactly as shown")
            return
        }

        setError("")
        const result = await onConfirm()
        
        if (!result.success) {
            setError(result.error || "Failed to delete agent")
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setConfirmationText("")
            setError("")
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        <DialogTitle>Delete Agent</DialogTitle>
                    </div>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the agent and all associated data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Agent Information */}
                    <div className="bg-muted/20 border border-border/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{agent.templateTitle}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                agent.isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Role: {agent.targetRole} • Created: {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                        {agent.statistics.totalInterviews > 0 && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                ⚠️ This agent has {agent.statistics.totalInterviews} interview{agent.statistics.totalInterviews !== 1 ? 's' : ''} associated with it
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmation">
                            To confirm deletion, type: 
                            <code className="mx-2 px-2 py-1 bg-muted rounded text-sm font-mono">
                                {expectedText}
                            </code>
                        </Label>
                        <Input
                            id="confirmation"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type the confirmation text..."
                            className={confirmationText && !isConfirmed ? "border-destructive" : ""}
                        />
                        {confirmationText && !isConfirmed && (
                            <p className="text-sm text-destructive">
                                Text doesn't match. Please type exactly: {expectedText}
                            </p>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                        <h4 className="font-medium text-destructive mb-2">This will permanently:</h4>
                        <ul className="text-sm text-destructive space-y-1">
                            <li>• Delete the interview template</li>
                            <li>• Remove the ElevenLabs agent</li>
                            <li>• Delete all associated interview recordings</li>
                            <li>• Remove all interview results and analytics</li>
                        </ul>
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
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isConfirmed || isLoading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Agent
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}