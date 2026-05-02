import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TurnTimerProps {
  isActive: boolean
  onExpire?: () => void
  maxSeconds?: number
  className?: string
}

export default function TurnTimer({
  isActive,
  onExpire,
  maxSeconds = 30,
  className = '',
}: TurnTimerProps) {
  const [seconds, setSeconds] = useState(maxSeconds)

  useEffect(() => {
    if (!isActive) {
      setSeconds(maxSeconds)
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onExpire?.()
          return maxSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, maxSeconds, onExpire])

  const percentage = (seconds / maxSeconds) * 100
  const isLow = seconds <= 10
  const isCritical = seconds <= 5

  return (
    <div className={`card-base text-center ${className}`}>
      <p className="text-text-secondary text-xs mb-2">Time Remaining</p>

      {/* Circular timer */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />

          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{
              strokeDashoffset: (1 - percentage / 100) * 2 * Math.PI * 45,
            }}
            transition={{ duration: 0.3 }}
            className={`${
              isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gold-500'
            }`}
          />
        </svg>

        {/* Center text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: isCritical ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isCritical ? Infinity : 0,
          }}
        >
          <span
            className={`text-2xl font-bold font-rajdhani ${
              isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gold-500'
            }`}
          >
            {seconds}
          </span>
        </motion.div>
      </div>

      {/* Status text */}
      {isCritical && (
        <motion.p
          className="text-xs text-red-500 font-semibold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          Hurry!
        </motion.p>
      )}
      {isLow && !isCritical && (
        <p className="text-xs text-orange-500 font-semibold">Running out</p>
      )}
      {!isLow && <p className="text-xs text-text-muted">Your turn</p>}
    </div>
  )
}
