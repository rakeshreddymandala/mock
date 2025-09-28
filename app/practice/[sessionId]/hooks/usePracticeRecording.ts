import { useState, useRef, useCallback } from "react"

export function usePracticeRecording(sessionId: string) {
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [systemAudioRecorder, setSystemAudioRecorder] = useState<MediaRecorder | null>(null)
    const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false)

    const audioChunksRef = useRef<Blob[]>([])
    const videoChunksRef = useRef<Blob[]>([])
    const systemAudioChunksRef = useRef<Blob[]>([])

    // Start recording both candidate and system audio
    const startRecording = useCallback((mediaStream: MediaStream, systemAudioElement?: HTMLAudioElement) => {
        if (!mediaStream) {
            console.error("❌ Media stream not available for practice recording")
            return
        }

        console.log(`🎓 Starting practice recording for session: ${sessionId}`)

        // Record candidate audio/video
        const candidateRecorder = new MediaRecorder(mediaStream)
        setMediaRecorder(candidateRecorder)

        audioChunksRef.current = []
        videoChunksRef.current = []
        systemAudioChunksRef.current = []

        candidateRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data)
                videoChunksRef.current.push(event.data)
            }
        }

        candidateRecorder.onstop = () => {
            saveCandidateRecordings()
        }

        // Record system audio (ElevenLabs agent responses) if available
        if (systemAudioElement) {
            try {
                console.log(`🎵 Setting up system audio recording for practice...`)

                // Create audio context to capture system audio
                const audioContext = new AudioContext()
                const source = audioContext.createMediaElementSource(systemAudioElement)
                const destination = audioContext.createMediaStreamDestination()

                // Connect source to destination (and also to speakers)
                source.connect(destination)
                source.connect(audioContext.destination)

                const systemRecorder = new MediaRecorder(destination.stream)
                setSystemAudioRecorder(systemRecorder)

                systemRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        systemAudioChunksRef.current.push(event.data)
                    }
                }

                systemRecorder.onstop = () => {
                    saveSystemAudio()
                }

                systemRecorder.start()
                console.log(`✅ System audio recording started for practice`)
            } catch (systemError) {
                console.error("❌ Failed to setup system audio recording:", systemError)
                // Continue with candidate recording only
            }
        }

        candidateRecorder.start()
        setIsRecording(true)
        console.log(`✅ Practice recording started`)
    }, [sessionId])

    const stopRecording = useCallback(() => {
        console.log(`🛑 Stopping practice recording for session: ${sessionId}`)

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
        }

        if (systemAudioRecorder && systemAudioRecorder.state !== 'inactive') {
            systemAudioRecorder.stop()
        }

        setIsRecording(false)
        console.log(`✅ Practice recording stopped`)
    }, [mediaRecorder, systemAudioRecorder, sessionId])

    const pauseRecording = useCallback(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause()
        }
        if (systemAudioRecorder && systemAudioRecorder.state === 'recording') {
            systemAudioRecorder.pause()
        }
        setIsRecording(false)
        console.log(`⏸️ Practice recording paused`)
    }, [mediaRecorder, systemAudioRecorder])

    const resumeRecording = useCallback(() => {
        if (mediaRecorder && mediaRecorder.state === 'paused') {
            mediaRecorder.resume()
        }
        if (systemAudioRecorder && systemAudioRecorder.state === 'paused') {
            systemAudioRecorder.resume()
        }
        setIsRecording(true)
        console.log(`▶️ Practice recording resumed`)
    }, [mediaRecorder, systemAudioRecorder])

    // Save candidate audio and video recordings
    const saveCandidateRecordings = useCallback(async () => {
        try {
            console.log(`💾 Saving candidate practice recordings...`)

            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" })

            console.log(`📊 Candidate recording sizes:`)
            console.log(`  - Audio: ${audioBlob.size} bytes`)
            console.log(`  - Video: ${videoBlob.size} bytes`)

            // Save candidate audio to AWS S3
            if (audioBlob.size > 0) {
                const audioFormData = new FormData()
                audioFormData.append("audio", audioBlob, `practice_${sessionId}_candidate_${Date.now()}.webm`)
                audioFormData.append("type", "candidate")

                const audioResponse = await fetch(`/api/practice/${sessionId}/audio`, {
                    method: "POST",
                    body: audioFormData,
                })

                if (audioResponse.ok) {
                    const audioResult = await audioResponse.json()
                    console.log(`✅ Candidate audio saved:`, audioResult)
                } else {
                    console.error(`❌ Failed to save candidate audio:`, await audioResponse.text())
                }
            }

            // Save candidate video to AWS S3
            if (videoBlob.size > 0) {
                const videoFormData = new FormData()
                videoFormData.append("video", videoBlob, `practice_${sessionId}_candidate_${Date.now()}.webm`)
                videoFormData.append("type", "candidate")

                const videoResponse = await fetch(`/api/practice/${sessionId}/video`, {
                    method: "POST",
                    body: videoFormData,
                })

                if (videoResponse.ok) {
                    const videoResult = await videoResponse.json()
                    console.log(`✅ Candidate video saved:`, videoResult)
                } else {
                    console.error(`❌ Failed to save candidate video:`, await videoResponse.text())
                }
            }
        } catch (error) {
            console.error(`❌ Error saving candidate practice recordings:`, error)
        }
    }, [sessionId])

    // Save system audio recordings (ElevenLabs agent responses)
    const saveSystemAudio = useCallback(async () => {
        try {
            console.log(`💾 Saving system audio (agent responses)...`)

            const systemAudioBlob = new Blob(systemAudioChunksRef.current, { type: "audio/webm" })
            console.log(`📊 System audio size: ${systemAudioBlob.size} bytes`)

            if (systemAudioBlob.size > 0) {
                const formData = new FormData()
                formData.append("audio", systemAudioBlob, `practice_${sessionId}_system_${Date.now()}.webm`)
                formData.append("type", "system")

                const response = await fetch(`/api/practice/${sessionId}/audio`, {
                    method: "POST",
                    body: formData,
                })

                if (response.ok) {
                    const result = await response.json()
                    console.log(`✅ System audio (agent responses) saved:`, result)
                } else {
                    console.error(`❌ Failed to save system audio:`, await response.text())
                }
            }
        } catch (error) {
            console.error(`❌ Error saving system audio:`, error)
        }
    }, [sessionId])

    const getAudioBlob = useCallback(() => {
        return new Blob(audioChunksRef.current, { type: "audio/webm" })
    }, [])

    const getVideoBlob = useCallback(() => {
        return new Blob(videoChunksRef.current, { type: "video/webm" })
    }, [])

    const getSystemAudioBlob = useCallback(() => {
        return new Blob(systemAudioChunksRef.current, { type: "audio/webm" })
    }, [])

    return {
        isRecording,
        isCandidateSpeaking,
        mediaRecorder,
        systemAudioRecorder,
        setIsCandidateSpeaking,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        saveCandidateRecordings,
        saveSystemAudio,
        getAudioBlob,
        getVideoBlob,
        getSystemAudioBlob,
    }
}