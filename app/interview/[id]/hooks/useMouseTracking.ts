import { useState, useEffect, useCallback, useRef } from 'react'

interface MousePosition {
    x: number
    y: number
}

interface DesignatedArea {
    x: number
    y: number
    width: number
    height: number
}

interface UseMouseTrackingOptions {
    isActive: boolean
    toleranceZone?: number // Extra pixels around designated area
    warningDelay?: number // Milliseconds before showing warning
    warningDuration?: number // Milliseconds to show warning
    maxWarningsPerMinute?: number // Prevent spam
}

export function useMouseTracking({
    isActive,
    toleranceZone = 50,
    warningDelay = 2000,
    warningDuration = 4000,
    maxWarningsPerMinute = 3
}: UseMouseTrackingOptions) {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
    const [showWarning, setShowWarning] = useState(false)
    const [isInDesignatedArea, setIsInDesignatedArea] = useState(true)
    const [designatedArea, setDesignatedArea] = useState<DesignatedArea | null>(null)

    const warningTimeoutRef = useRef<NodeJS.Timeout>()
    const hideWarningTimeoutRef = useRef<NodeJS.Timeout>()
    const lastWarningTimeRef = useRef<number>(0)
    const warningCountRef = useRef<number>(0)
    const warningResetTimeoutRef = useRef<NodeJS.Timeout>()
    const designatedAreaRef = useRef<DesignatedArea | null>(null)

    // Calculate designated area based on current window size
    const calculateDesignatedArea = useCallback((): DesignatedArea => {
        const controlAreaWidth = 400
        const controlAreaHeight = 100
        const bottomOffset = 120 // Distance from bottom

        return {
            x: window.innerWidth / 2 - controlAreaWidth / 2 - toleranceZone,
            y: window.innerHeight - bottomOffset - controlAreaHeight - toleranceZone,
            width: controlAreaWidth + (toleranceZone * 2),
            height: controlAreaHeight + (toleranceZone * 2)
        }
    }, [toleranceZone])

    // Check if mouse is within designated area
    const isMouseInArea = useCallback((pos: MousePosition, area: DesignatedArea): boolean => {
        return pos.x >= area.x &&
            pos.x <= area.x + area.width &&
            pos.y >= area.y &&
            pos.y <= area.y + area.height
    }, [])

    // Reset warning count every minute
    const resetWarningCount = useCallback(() => {
        warningCountRef.current = 0
        warningResetTimeoutRef.current = setTimeout(resetWarningCount, 60000)
    }, [])

    // Show warning with rate limiting
    const triggerWarning = useCallback(() => {
        const now = Date.now()

        // Rate limiting: Check if we've exceeded max warnings per minute
        if (warningCountRef.current >= maxWarningsPerMinute) {
            return
        }

        // Minimum time between warnings (10 seconds)
        if (now - lastWarningTimeRef.current < 10000) {
            return
        }

        lastWarningTimeRef.current = now
        warningCountRef.current++
        setShowWarning(true)

        // Auto-hide warning after duration
        if (hideWarningTimeoutRef.current) {
            clearTimeout(hideWarningTimeoutRef.current)
        }
        hideWarningTimeoutRef.current = setTimeout(() => {
            setShowWarning(false)
        }, warningDuration)
    }, [maxWarningsPerMinute, warningDuration])

    // Handle mouse movement
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!isActive) return

        const currentDesignatedArea = designatedAreaRef.current
        if (!currentDesignatedArea) return

        const newPosition = { x: event.clientX, y: event.clientY }
        setMousePosition(newPosition)

        const inArea = isMouseInArea(newPosition, currentDesignatedArea)
        setIsInDesignatedArea(inArea)

        if (inArea) {
            // Mouse is back in area - clear any pending warnings
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
                warningTimeoutRef.current = undefined
            }
            // Hide warning if showing
            setShowWarning(false)
        } else {
            // Mouse left area - start warning timer if not already started
            if (!warningTimeoutRef.current) {
                warningTimeoutRef.current = setTimeout(() => {
                    triggerWarning()
                    warningTimeoutRef.current = undefined
                }, warningDelay)
            }
        }
    }, [isActive, isMouseInArea, warningDelay, triggerWarning])

    // Handle window resize
    const handleResize = useCallback(() => {
        if (isActive) {
            const newArea = calculateDesignatedArea()
            setDesignatedArea(newArea)
        }
    }, [isActive, calculateDesignatedArea])

    // Keep ref in sync with state
    useEffect(() => {
        designatedAreaRef.current = designatedArea
    }, [designatedArea])

    // Setup event listeners and initial state
    useEffect(() => {
        if (!isActive) return

        // Calculate initial designated area
        const area = calculateDesignatedArea()
        setDesignatedArea(area)

        // Start warning count reset timer
        resetWarningCount()

        const cleanup = () => {
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
                warningTimeoutRef.current = undefined
            }
            if (hideWarningTimeoutRef.current) {
                clearTimeout(hideWarningTimeoutRef.current)
                hideWarningTimeoutRef.current = undefined
            }
            if (warningResetTimeoutRef.current) {
                clearTimeout(warningResetTimeoutRef.current)
                warningResetTimeoutRef.current = undefined
            }
        }

        return cleanup
    }, [isActive, calculateDesignatedArea, resetWarningCount])

    // Add mouse event listener separately
    useEffect(() => {
        if (!isActive) return

        document.addEventListener('mousemove', handleMouseMove)
        return () => document.removeEventListener('mousemove', handleMouseMove)
    }, [isActive, handleMouseMove])

    // Add resize event listener separately
    useEffect(() => {
        if (!isActive) return

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isActive, handleResize])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
            }
            if (hideWarningTimeoutRef.current) {
                clearTimeout(hideWarningTimeoutRef.current)
            }
            if (warningResetTimeoutRef.current) {
                clearTimeout(warningResetTimeoutRef.current)
            }
        }
    }, [])

    // Manual hide warning function
    const hideWarning = useCallback(() => {
        setShowWarning(false)
        if (hideWarningTimeoutRef.current) {
            clearTimeout(hideWarningTimeoutRef.current)
        }
    }, [])

    return {
        mousePosition,
        showWarning,
        isInDesignatedArea,
        designatedArea,
        hideWarning,
        // Debug info (can be removed in production)
        debugInfo: {
            warningCount: warningCountRef.current,
            lastWarningTime: lastWarningTimeRef.current
        }
    }
}