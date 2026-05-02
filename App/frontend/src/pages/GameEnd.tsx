import { useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/game.store'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'

const MEDALS = ['🥇', '🥈', '🥉', '🏅', '🎖️']

export default function GameEnd() {
  const navigate = useNavigate()
  const location = useLocation()
  const { players, lastRoundWinner, resetGame } = useGameStore()

  // Sort players by score for final standings
  const finalStandings = [...players].sort((a, b) => b.score - a.score)

  const handlePlayAgain = () => {
    resetGame()
    navigate('/lobbies')
  }

  const handleProfile = (userId: string) => {
    navigate(`/profile/${userId}`)
  }

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base to-bg-surface flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Victory Banner */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">Game Over!</h1>
          <p className="text-text-secondary text-lg">
            {lastRoundWinner === useGameStore.getState().gameId
              ? 'Congratulations, you won! 🏆'
              : 'Thanks for playing!'}
          </p>
        </motion.div>

        {/* Final Standings */}
        <motion.div
          variants={itemVariants}
          className="bg-bg-surface rounded-lg border border-gray-700 overflow-hidden mb-8"
        >
          <div className="bg-bg-elevated px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-text-primary">Final Standings</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {finalStandings.map((player, idx) => (
                <motion.div
                  key={player.id}
                  variants={itemVariants}
                  onClick={() => handleProfile(player.id)}
                  className="flex items-center gap-4 p-4 bg-bg-elevated rounded-lg border border-gray-700 hover:border-gold-500 transition-colors cursor-pointer"
                >
                  {/* Rank */}
                  <div className="text-4xl min-w-[60px]">
                    {MEDALS[idx] || `#${idx + 1}`}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text-primary truncate">{player.username}</div>
                    <div className="text-text-secondary text-sm">
                      {player.handSize} cards remaining
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gold-500">{player.score}</div>
                    <div className="text-text-secondary text-sm">Points</div>
                  </div>

                  {/* Caught Tens */}
                  {player.caughtTens.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl">🔟</div>
                      <div className="text-text-secondary text-sm">{player.caughtTens.length}</div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Game Stats */}
        {players.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-bg-surface rounded-lg border border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-text-primary">{players.length}</div>
              <div className="text-text-secondary text-sm mt-1">Players</div>
            </div>
            <div className="bg-bg-surface rounded-lg border border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-gold-500">
                {finalStandings[0]?.score || 0}
              </div>
              <div className="text-text-secondary text-sm mt-1">High Score</div>
            </div>
            <div className="bg-bg-surface rounded-lg border border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {players.reduce((sum, p) => sum + (p.caughtTens?.length || 0), 0)}
              </div>
              <div className="text-text-secondary text-sm mt-1">Total 10s</div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            fullWidth
            variant="primary"
            size="lg"
            onClick={handlePlayAgain}
            className="text-lg"
          >
            🎮 Play Again
          </Button>
          <Button
            fullWidth
            variant="secondary"
            size="lg"
            onClick={() => navigate('/lobbies')}
            className="text-lg"
          >
            🏠 Return to Lobbies
          </Button>
        </motion.div>

        {/* Social */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-text-secondary mb-4">View final stats:</p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/leaderboard')}
          >
            📊 View Leaderboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
