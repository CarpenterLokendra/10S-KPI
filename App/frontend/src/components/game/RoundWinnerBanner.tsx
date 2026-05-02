import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RoundWinnerBannerProps {
  winner?: string | null
  winningCard?: { suit: string; value: string } | null
  onDismiss?: () => void
  autoDismissMs?: number
}

export default function RoundWinnerBanner({
  winner,
  winningCard,
  onDismiss,
  autoDismissMs = 2500,
}: RoundWinnerBannerProps) {
  useEffect(() => {
    if (winner && autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs)
      return () => clearTimeout(timer)
    }
  }, [winner, autoDismissMs, onDismiss])

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="card-base bg-gradient-to-r from-gold-500 to-gold-600 text-center px-8 py-6 shadow-2xl">
            <motion.h2
              className="text-heading-md font-rajdhani text-text-primary mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              🎉 Round Won! 🎉
            </motion.h2>

            <motion.p
              className="text-lg font-bold text-text-primary mb-2"
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {winner}
            </motion.p>

            {winningCard && (
              <motion.p
                className="text-sm text-text-secondary"
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                Winning card: {winningCard.value} of {winningCard.suit}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
