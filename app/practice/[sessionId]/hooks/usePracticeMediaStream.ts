import { useState, useEffect, useRef } from "react"

export function usePracticeMediaStream() {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [hasPermissions, setHasPermissions] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const videoRef = useRef<HTMLVideoElement>(null)

    // Fetch available video input devices (cameras)
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((allDevices) => {
            setDevices(allDevices.filter((d) => d.kind === "videoinput"))
        })
    }, [])

    // Attach media stream to the video element
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream
            console.log("🎥 Practice MediaStream tracks:", mediaStream.getTracks())
            console.log("📹 Practice Video tracks:", mediaStream.getVideoTracks())
        }
    }, [mediaStream])

    const requestPermissions = async (deviceId?: string) => {
        try {
            const constraints: MediaStreamConstraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : true,
                audio: true,
            }

            console.log("🎥 Requesting practice session permissions...")
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            setMediaStream(stream)
            setHasPermissions(true)
            console.log("✅ Practice session permissions granted")
            return true
        } catch (error) {
            console.error("❌ Practice session permission denied:", error)
            throw new Error("Camera and microphone access are required for practice sessions.")
        }
    }

    const toggleCamera = () => {
        if (mediaStream) {
            const videoTrack = mediaStream.getVideoTracks()[0]
            if (videoTrack) {
                const newCameraState = !videoTrack.enabled
                videoTrack.enabled = newCameraState
                setIsCameraOn(newCameraState)
                console.log("📹 Practice camera toggled:", newCameraState ? "ON" : "OFF")
            }
        }
    }

    const toggleMic = () => {
        if (mediaStream) {
            const audioTrack = mediaStream.getAudioTracks()[0]
            if (audioTrack) {
                const newMicState = !audioTrack.enabled
                audioTrack.enabled = newMicState
                setIsMicOn(newMicState)
                console.log("🎤 Practice microphone toggled:", newMicState ? "ON" : "OFF")
            }
        }
    }

    const cleanup = () => {
        if (mediaStream) {
            console.log("🧹 Cleaning up practice session media stream")
            mediaStream.getTracks().forEach((track) => track.stop())
            setMediaStream(null)
        }
    }

    return {
        mediaStream,
        hasPermissions,
        isCameraOn,
        isMicOn,
        devices,
        videoRef,
        requestPermissions,
        toggleCamera,
        toggleMic,
        cleanup
    }
}