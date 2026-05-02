import { useState } from 'react'
import Button from '@/components/ui/Button'
import LobbyCard from '@/components/lobby/LobbyCard'
import { useLobbies, useCreateLobby, useJoinLobby } from '@/hooks/useLobby'
import Input from '@/components/ui/Input'

export default function LobbyBrowser() {
  const { data: lobbies, isLoading, error } = useLobbies('waiting')
  const { mutate: createLobby, isPending: isCreating } = useCreateLobby()
  const { mutate: joinLobby, isPending: isJoining } = useJoinLobby()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [createForm, setCreateForm] = useState({
    maxPlayers: 4,
  })

  const handleCreateLobby = () => {
    createLobby({
      max_players: createForm.maxPlayers,
      game_type: 'lobby',
      is_private: false,
    })
    setShowCreateForm(false)
  }

  const handleJoinByCode = () => {
    if (joinCode.trim()) {
      joinLobby(joinCode.trim().toUpperCase())
      setJoinCode('')
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading-lg font-rajdhani mb-2">Available Lobbies</h1>
          <p className="text-text-secondary">Join a game or create a new lobby</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Join by Code */}
          <div className="card-base">
            <h3 className="text-heading-sm font-rajdhani mb-4">Join by Code</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter lobby code (e.g., ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                disabled={isJoining}
              />
              <Button
                fullWidth
                onClick={handleJoinByCode}
                loading={isJoining}
                disabled={!joinCode.trim()}
              >
                Join Lobby
              </Button>
            </div>
          </div>

          {/* Create New Lobby */}
          <div className="card-base">
            <h3 className="text-heading-sm font-rajdhani mb-4">Create Lobby</h3>
            {!showCreateForm ? (
              <Button fullWidth variant="primary" onClick={() => setShowCreateForm(true)}>
                Create New Lobby
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Max Players</label>
                  <select
                    value={createForm.maxPlayers}
                    onChange={(e) => setCreateForm({ maxPlayers: parseInt(e.target.value) })}
                    className="w-full bg-bg-surface border border-gray-700 rounded px-3 py-2 text-text-primary"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={5}>5 Players</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    flex="1"
                    variant="primary"
                    onClick={handleCreateLobby}
                    loading={isCreating}
                  >
                    Create
                  </Button>
                  <Button
                    flex="1"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lobbies List */}
        <div>
          <h2 className="text-heading-md font-rajdhani mb-4">Active Lobbies</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">Loading lobbies...</p>
            </div>
          ) : error ? (
            <div className="card-base bg-red-500 bg-opacity-10 border-red-500">
              <p className="text-red-500">Failed to load lobbies. Please try again.</p>
            </div>
          ) : !lobbies || lobbies.length === 0 ? (
            <div className="card-base text-center py-12">
              <p className="text-text-secondary mb-4">No lobbies available</p>
              <p className="text-sm text-text-muted">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lobbies.map((lobby) => (
                <LobbyCard
                  key={lobby.code}
                  lobby={lobby}
                  onJoin={joinLobby}
                  joining={isJoining}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
