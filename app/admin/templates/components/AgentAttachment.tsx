'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Link } from "lucide-react"
import { useState } from "react"

interface AgentAttachmentProps {
    templateId: string
    templateType: 'admin' | 'company'
    hasAgent: boolean
    agentId?: string
    onAgentAttached: () => void
}

export const AgentAttachment = ({
    templateId,
    templateType,
    hasAgent,
    agentId,
    onAgentAttached
}: AgentAttachmentProps) => {
    const [isAttaching, setIsAttaching] = useState(false)

    const attachAgent = async () => {
        setIsAttaching(true)
        try {
            // Generate a mock agent ID for now
            const mockAgentId = `agent_${Date.now()}`

            const response = await fetch('/api/admin/templates-real', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId,
                    agentId: mockAgentId,
                    templateType
                })
            })

            if (response.ok) {
                onAgentAttached()
            } else {
                console.error('Failed to attach agent')
            }
        } catch (error) {
            console.error('Error attaching agent:', error)
        } finally {
            setIsAttaching(false)
        }
    }

    if (hasAgent) {
        return (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Bot className="w-3 h-3 mr-1" />
                Agent: {agentId?.slice(-8) || 'Attached'}
            </Badge>
        )
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={attachAgent}
            disabled={isAttaching}
            className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
        >
            <Link className="w-3 h-3 mr-1" />
            {isAttaching ? 'Attaching...' : 'Attach Agent'}
        </Button>
    )
}