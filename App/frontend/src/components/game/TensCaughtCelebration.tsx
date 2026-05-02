import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TensCaughtCelebrationProps {
  playerName?: string | null
  count?: number
  onDismiss?: () => void
  autoDismissMs?: number
}

export default function TensCaughtCelebration({
  playerName,
  count = 1,
  onDismiss,
  autoDismissMs = 3500,
}: TensCaughtCelebrationProps) {
  useEffect(() => {
    if (playerName && autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs)
      return () => clearTimeout(timer)
    }
  }, [playerName, autoDismissMs, onDismiss])

  const points = count * 100

  return (
    <AnimatePresence>
      {playerName && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background effect */}
          <motion.div
            className="absolute inset-0 bg-gold-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Main celebration message */}
          <motion.div
            className="card-base text-center px-8 py-6"
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <motion.h1
              className="text-4xl font-bold text-gold-500 mb-2 font-rajdhani"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
                repeatDelay: 0.3,
              }}
            >
              🔟 10S CAUGHT! 🔟
            </motion.h1>

            <motion.p
              className="text-xl font-bold text-text-primary mb-2"
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {playerName}
            </motion.p>

            <motion.div
              className="text-lg text-gold-500 font-semibold"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.4, delay: 0.4, repeat: 1 }}
            >
              +{points} Points!
            </motion.div>
          </motion.div>

          {/* Particle bursts */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gold-500 rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 150,
                y: Math.sin((i / 8) * Math.PI * 2) * 150,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                delay: 0.3,
                easing: 'easeOut',
              }}
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-8px',
                marginTop: '-8px',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
