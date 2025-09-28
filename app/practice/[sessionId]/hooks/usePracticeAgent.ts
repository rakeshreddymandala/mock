import { useState, useRef, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";

export function usePracticeAgent(audioAnalysis?: { setupAudioAnalysis: (audio: HTMLAudioElement) => AnalyserNode | null, startAnalysis: () => void, stopAnalysis: () => void }) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState<string | null>(null);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

    const agentAudioRef = useRef<HTMLAudioElement | null>(null);

    // Start agent session for practice
    const startAgentSession = useCallback(async (sessionId: string) => {
        try {
            console.log("🚀 Starting ElevenLabs agent session for practice...");

            const response = await fetch(`/api/practice/${sessionId}/signed-url`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Failed to fetch signed URL:", errorText);
                throw new Error(`Failed to fetch signed URL: ${response.status} - ${errorText}`);
            }

            const { signedUrl } = await response.json();
            console.log("✅ Signed URL received:", signedUrl?.substring(0, 50) + "...");

            // Start a new conversation session using ElevenLabs SDK
            const newConversation = await Conversation.startSession({ signedUrl });
            setConversation(newConversation);
            console.log("✅ Practice agent session started successfully");
        } catch (error) {
            console.error("❌ Error starting practice agent session:", error);
        }
    }, []);

    // Send audio to agent
    const sendAudioToAgent = useCallback(async (audioBlob: Blob) => {
        if (!conversation) {
            console.error("❌ Conversation not started");
            return;
        }

        try {
            console.log("📤 Sending audio to practice agent...");
            // Note: sendAudio method may need SDK update or different approach
            // const response = await conversation.sendAudio(audioBlob);
            // console.log("📥 Practice agent response:", response);

            // if (response.audioUrl) {
            //     handleAgentResponse(response.audioUrl);
            // }

            // For now, log that audio would be sent
            console.log("🎤 Audio would be sent to practice agent (SDK integration pending)");
        } catch (error) {
            console.error("❌ Error communicating with practice agent:", error);
        }
    }, [conversation]);

    const handleAgentResponse = useCallback(async (responseAudioUrl: string) => {
        try {
            console.log("🔊 Received practice agent response audio:", responseAudioUrl.substring(0, 50) + "...");

            // Set the audio URL for VoiceReactiveVisual component (it will handle playback and animation)
            setElevenLabsAudioUrl(responseAudioUrl);
            setIsAgentSpeaking(true);

            console.log("✅ Practice agent audio URL set for VoiceReactiveVisual");
        } catch (error) {
            console.error("Error handling practice agent response:", error);
            setIsAgentSpeaking(false);
        }
    }, []);

    const endAgentSession = useCallback(async (sessionId: string) => {
        if (conversation) {
            try {
                console.log("Ending practice agent session...");

                // End the conversation session
                await conversation.endSession();
                console.log("✅ Practice agent session ended", conversation);

                // Optionally save the conversation ID (SDK access might be limited)
                // const conversationId = conversation.connection.conversationId;
                // if (conversationId) {
                //     const response = await fetch(`/api/practice/sessions/${sessionId}`, {
                //         method: "PATCH",
                //         headers: { "Content-Type": "application/json" },
                //         body: JSON.stringify({ conversationId }),
                //     });
                //     console.log("Practice conversation ID saved response:", response.status);
                //     if (response.ok) {
                //         const result = await response.json();
                //         console.log("Practice conversation save result:", result);
                //     }
                // } else {
                //     console.warn("No conversationId found to save for practice session");
                // }

                console.log("Practice session ended successfully");
            } catch (error) {
                console.error("Error ending practice agent session:", error);
            } finally {
                setConversation(null);
            }
        }
    }, [conversation]);

    const handleAgentAudioEnd = useCallback(() => {
        console.log("🔊 Practice agent audio ended, resetting state");
        setIsAgentSpeaking(false);
        setElevenLabsAudioUrl(null);
    }, []);

    return {
        conversation,
        elevenLabsAudioUrl,
        isAgentSpeaking,
        startAgentSession,
        sendAudioToAgent,
        endAgentSession,
        handleAgentResponse,
        handleAgentAudioEnd,
    };
}