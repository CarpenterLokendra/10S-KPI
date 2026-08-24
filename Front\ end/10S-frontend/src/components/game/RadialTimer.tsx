import React, { useState, useEffect, useRef } from 'react'
import { soundService } from '@/services/sound.service'

interface RectangularTimerProps {
  remainingSeconds: number
  totalSeconds: number
  cardWidth?: number
  cardHeight?: number
  borderRadius?: number
  gap?: number
  offsetX?: number
  offsetY?: number
}

export default function RectangularTimer({
  remainingSeconds,
  totalSeconds,
  cardWidth = 128,
  cardHeight = 180,
  borderRadius = 12,
  gap = 2,
  offsetX = 1.5,
  offsetY = 1.5,
}: RectangularTimerProps) {
  // Update progress 10 times per second for smooth animation
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds)
  const lastUpdateTimeRef = useRef(Date.now())
  const lastRemainingSecondsRef = useRef(remainingSeconds)

  useEffect(() => {
    lastUpdateTimeRef.current = Date.now()
    lastRemainingSecondsRef.current = remainingSeconds
    setDisplaySeconds(remainingSeconds)
  }, [remainingSeconds])

  // Update display 10 times per second (every 100ms) for smooth animation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsedMs = now - lastUpdateTimeRef.current
      const elapsedSeconds = elapsedMs / 1000
      const newDisplaySeconds = Math.max(0, lastRemainingSecondsRef.current - elapsedSeconds)
      setDisplaySeconds(newDisplaySeconds)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Determine color based on percentage of time remaining
  const percentageRemaining = (displaySeconds / totalSeconds) * 100
  let timerColor = '#22c55e' // Green (> 50%)
  let shouldBlink = false

  if (percentageRemaining < 50 && percentageRemaining >= 30) {
    timerColor = '#fb923c' // Orange (30-50%)
  } else if (percentageRemaining < 30) {
    timerColor = '#ef4444' // Red (< 30%)
    if (percentageRemaining < 10) {
      shouldBlink = true // Blink when < 10%
    }
  }

  // Play alarm sound when timer turns orange (< 50%) until it ends
  // Orange (30-50%): every 1 second, Red (< 30%): every 0.5 seconds
  const alarmSoundRef = useRef<NodeJS.Timeout | null>(null)
  const alarmStartedRef = useRef(false)
  const previousAlarmIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    // Determine alarm interval based on color
    const isRed = percentageRemaining < 30
    const alarmInterval = isRed ? 500 : 1000 // 0.5s when red, 1s when orange

    // Stop alarm when timer ends or goes back above 50%
    if ((percentageRemaining >= 50 || percentageRemaining <= 0) && alarmStartedRef.current) {
      alarmStartedRef.current = false
      previousAlarmIntervalRef.current = null
      if (alarmSoundRef.current) {
        clearInterval(alarmSoundRef.current)
        alarmSoundRef.current = null
      }
      return
    }

    // Start or manage alarm when timer is below 50%
    if (percentageRemaining < 50 && percentageRemaining > 0) {
      if (!alarmStartedRef.current) {
        // First time starting the alarm
        alarmStartedRef.current = true
        previousAlarmIntervalRef.current = alarmInterval
        alarmSoundRef.current = setInterval(() => {
          soundService.alarm()
        }, alarmInterval)
        // Register interval with soundService so it can be stopped externally (e.g., on game-ended)
        soundService.registerAlarmInterval(alarmSoundRef.current)
        soundService.alarm() // Play immediately
      } else if (previousAlarmIntervalRef.current !== alarmInterval && alarmSoundRef.current) {
        // Only update interval if the frequency actually changed (orange ↔ red transition)
        previousAlarmIntervalRef.current = alarmInterval
        clearInterval(alarmSoundRef.current)
        alarmSoundRef.current = setInterval(() => {
          soundService.alarm()
        }, alarmInterval)
        soundService.registerAlarmInterval(alarmSoundRef.current)
      }
      // If interval hasn't changed, do nothing - let the existing interval keep running
    }
  }, [percentageRemaining])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (alarmSoundRef.current) {
        clearInterval(alarmSoundRef.current)
      }
    }
  }, [])

  const BORDER_WIDTH = 3
  const outerW = cardWidth + gap * 2
  const outerH = cardHeight + gap * 2
  const outerRadius = borderRadius + gap
  const progress = Math.max(0, Math.min(1, displaySeconds / totalSeconds))

  // Calculate perimeter of rounded rectangle for SVG stroke-dasharray
  const strokeInset = BORDER_WIDTH / 2
  const rectW = outerW - BORDER_WIDTH
  const rectH = outerH - BORDER_WIDTH
  const rx = Math.max(0, outerRadius - strokeInset)
  const perimeter = 2 * (rectW - 2 * rx) + 2 * (rectH - 2 * rx) + 2 * Math.PI * rx
  const strokeDashoffset = perimeter * (1 - progress)

  return (
    <>
      <style>{`
        @keyframes blinkTimer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* SVG-based perimeter countdown timer */}
      <div
        style={{
          position: 'absolute',
          top: `${offsetY}px`,
          left: `${offsetX}px`,
          width: `${outerW}px`,
          height: `${outerH}px`,
          zIndex: 10,
          pointerEvents: 'none',
          animation: shouldBlink ? 'blinkTimer 0.6s infinite' : 'none',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${outerW} ${outerH}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'visible',
          }}
        >
          {/* Track rect - subtle background ring */}
          <rect
            x={strokeInset}
            y={strokeInset}
            width={rectW}
            height={rectH}
            rx={rx}
            ry={rx}
            fill="none"
            stroke={`${timerColor}40`}
            strokeWidth={BORDER_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Progress rect - animated perimeter countdown */}
          <rect
            x={strokeInset}
            y={strokeInset}
            width={rectW}
            height={rectH}
            rx={rx}
            ry={rx}
            fill="none"
            stroke={timerColor}
            strokeWidth={BORDER_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={perimeter}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.05s linear, stroke 0.15s ease',
            }}
          />
        </svg>
      </div>
    </>
  )
}
