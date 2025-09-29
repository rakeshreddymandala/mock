import { useState, useRef, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";

export function useElevenLabsAgent(audioAnalysis?: { setupAudioAnalysis: (audio: HTMLAudioElement) => AnalyserNode | null, startAnalysis: () => void, stopAnalysis: () => void }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // APPROACH 3: Core audio monitoring function
  const startAudioMonitoring = useCallback((conversationInstance: Conversation) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("🎵 [APPROACH 3] Setting up real-time audio data monitoring...");

    pollingIntervalRef.current = setInterval(() => {
      try {
        // Monitor conversation mode and get audio data (as per Approach 3 plan)
        const currentMode = (conversationInstance as any).mode;
        const isCurrentlySpeaking = currentMode === 'speaking';

        // Log mode changes
        if (isCurrentlySpeaking !== isAgentSpeaking) {
          console.log(`🔄 [APPROACH 3] Mode changed: ${currentMode}`);
          setIsAgentSpeaking(isCurrentlySpeaking);
        }

        // Get real-time frequency data when agent is speaking
        if (isCurrentlySpeaking && typeof (conversationInstance as any).getOutputByteFrequencyData === 'function') {
          const frequencyData = (conversationInstance as any).getOutputByteFrequencyData();
          
          if (frequencyData && frequencyData.length > 0) {
            const dataArray = Array.from(frequencyData as Uint8Array);
            const avgAmplitude = dataArray.reduce((sum: number, val: number) => sum + val, 0) / dataArray.length;
            console.log(`🎧 [APPROACH 3] Got frequency data - Length: ${frequencyData.length}, Avg: ${avgAmplitude.toFixed(1)}, Sample: [${dataArray.slice(0, 5).join(', ')}]`);
            setAudioData(frequencyData as Uint8Array);
          } else {
            console.log(`🎧 [APPROACH 3] No frequency data available (length: ${frequencyData?.length || 0})`);
          }
        } else if (!isCurrentlySpeaking) {
          // Keep audioData for a short time to avoid timing issues
          // Only clear after agent has been not speaking for a while
          setTimeout(() => {
            if (!isAgentSpeaking) {
              console.log(`🔇 [APPROACH 3] Clearing audio data - agent stopped speaking`);
              setAudioData(null);
            }
          }, 200); // Wait 200ms before clearing
        }
      } catch (error) {
        console.error("❌ [APPROACH 3] Error in audio monitoring:", error);
      }
    }, 50); // Poll every 50ms for smooth animation

    console.log("✅ [APPROACH 3] Audio monitoring started");
  }, [isAgentSpeaking]);

  // Stop audio monitoring
  const stopAudioMonitoring = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("🔄 [APPROACH 3] Audio monitoring stopped");
    }
  }, []);

  // Refactored startAgentSession
  const startAgentSession = useCallback(async (interviewId: string) => {
    try {
      console.log("🚀 Starting ElevenLabs agent session...");

      const response = await fetch(`/api/interviews/${interviewId}/signed-url`);
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
      console.log("✅ Agent session started successfully");

      // APPROACH 3: Start real-time audio monitoring
      console.log("🎵 [APPROACH 3] Starting real-time audio monitoring...");
      startAudioMonitoring(newConversation);
    } catch (error) {
      console.error("❌ Error starting agent session:", error);
    }
  }, []);

  // APPROACH 3: Not needed - ElevenLabs handles audio automatically
  // Audio data comes from real-time monitoring instead

  const endAgentSession = useCallback(async (interviewId: string) => {
    if (conversation) {
      try {
        console.log("Ending agent session...");

        // Stop audio monitoring
        stopAudioMonitoring();

        // End the conversation session
        await conversation.endSession();
        console.log("✅ Agent session ended");

        // Try to save conversation ID if accessible
        try {
          const conversationId = (conversation as any).conversationId || (conversation as any).id;
          if (conversationId) {
            const response = await fetch(`/api/interviews/${interviewId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversationId }),
            });
            console.log("Conversation ID saved response:", response.status);
          }
        } catch (saveError) {
          console.log("Note: Could not save conversation ID (not critical)");
        }
      } catch (error) {
        console.error("Error ending agent session:", error);
      } finally {
        setConversation(null);
        setIsAgentSpeaking(false);
        setAudioData(null);
      }
    }
  }, [conversation, stopAudioMonitoring]);

  const handleAgentAudioEnd = useCallback(() => {
    console.log("🔊 Agent audio ended, resetting state");
    setIsAgentSpeaking(false);
    setAudioData(null);
  }, []);

  return {
    conversation,
    audioData,           // APPROACH 3: Real-time frequency data
    isAgentSpeaking,     // APPROACH 3: Speaking state
    startAgentSession,
    endAgentSession,
    handleAgentAudioEnd,
  };
}