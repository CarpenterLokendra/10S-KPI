import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { leaderboardService } from '@/services/leaderboard.service'
import { userService } from '@/services/user.service'
import Button from '@/components/ui/Button'
import { useState } from 'react'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<'rating' | 'games_won' | 'games_played'>('rating')
  const [limit] = useState(100)
  const [offset] = useState(0)

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', limit, offset, sortBy],
    queryFn: () => leaderboardService.getLeaderboard(limit, offset, sortBy),
  })

  const { data: globalStats } = useQuery({
    queryKey: ['leaderboard-global'],
    queryFn: () => leaderboardService.getGlobalStats(),
  })

  // Fetch usernames for entries that don't have them
  const players = leaderboardData?.players || []
  const { data: usernames } = useQuery({
    queryKey: ['leaderboard-usernames', players.map(p => p.user_id)],
    queryFn: async () => {
      const names: Record<string, string> = {}
      for (const player of players) {
        if (!player.username) {
          try {
            const profile = await userService.getPublicProfile(player.user_id)
            names[player.user_id] = profile.username
          } catch {
            names[player.user_id] = `Player ${player.user_id.slice(0, 8)}`
          }
        }
      }
      return names
    },
    enabled: players.length > 0,
  })

  const getPlayerName = (player: any): string => {
    return player.username || usernames?.[player.user_id] || `Player ${player.user_id.slice(0, 8)}`
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-amber-900/20 to-slate-900 overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-500/15 to-gold-500/5 rounded-2xl rotate-45 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-yellow-500/15 to-amber-500/5 rounded-2xl -rotate-45 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-bg-surface/80 backdrop-blur border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-rajdhani font-bold bg-gradient-to-r from-gold-500 to-yellow-400 bg-clip-text text-transparent">🏆 Leaderboard</h1>
            <p className="text-text-secondary mt-1">Top players worldwide</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/lobbies')}>
            Back to Lobbies
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-surface rounded-lg p-4 border border-gray-700">
            <div className="text-text-secondary text-sm">Total Players</div>
            <div className="text-2xl font-bold text-gold-500">{globalStats.total_players}</div>
          </div>
          <div className="bg-bg-surface rounded-lg p-4 border border-gray-700">
            <div className="text-text-secondary text-sm">Total Games</div>
            <div className="text-2xl font-bold text-gold-500">{globalStats.total_games_played}</div>
          </div>
          <div className="bg-bg-surface rounded-lg p-4 border border-gray-700">
            <div className="text-text-secondary text-sm">Avg Rating</div>
            <div className="text-2xl font-bold text-gold-500">
              {globalStats.average_player_rating.toFixed(0)}
            </div>
          </div>
          <div className="bg-bg-surface rounded-lg p-4 border border-gray-700">
            <div className="text-text-secondary text-sm">Highest Rating</div>
            <div className="text-2xl font-bold text-gold-500">
              {globalStats.highest_rating.toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Sort buttons */}
      <div className="max-w-6xl mx-auto px-6 pb-6 flex gap-2">
        <Button
          variant={sortBy === 'rating' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('rating')}
        >
          By Rating
        </Button>
        <Button
          variant={sortBy === 'games_won' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('games_won')}
        >
          By Wins
        </Button>
        <Button
          variant={sortBy === 'games_played' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSortBy('games_played')}
        >
          By Games Played
        </Button>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {leaderboardLoading ? (
          <div className="bg-bg-surface rounded-lg p-8 text-center text-text-secondary">
            Loading leaderboard...
          </div>
        ) : !players.length ? (
          <div className="bg-bg-surface rounded-lg p-8 text-center text-text-secondary">
            No players yet. Be the first!
          </div>
        ) : (
          <div className="bg-bg-surface rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-bg-base">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-secondary">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-secondary">
                    Player
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-text-secondary">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-text-secondary">
                    Games Played
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-text-secondary">
                    Wins
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-text-secondary">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr
                    key={player.user_id}
                    className="border-b border-gray-700 hover:bg-bg-elevated transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${player.user_id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{MEDALS[idx] || `#${player.rank}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{getPlayerName(player)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gold-500 font-semibold">{player.rating.toFixed(0)}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      {player.total_games}
                    </td>
                    <td className="px-6 py-4 text-right text-text-primary font-semibold">
                      {player.total_wins}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-sm">
                        {(player.win_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
