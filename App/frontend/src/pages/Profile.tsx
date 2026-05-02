import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { userId: paramUserId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: authUser } = useAuthStore()

  const userId = paramUserId || authUser?.id
  const isOwnProfile = !paramUserId || paramUserId === authUser?.id

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', avatar_url: '' })

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => (isOwnProfile ? userService.getCurrentUserProfile() : userService.getPublicProfile(userId!)),
    enabled: !!userId,
  })

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: () => userService.getPlayerStatistics(userId!),
    enabled: !!userId,
  })

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: { username?: string; avatar_url?: string }) => userService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data)
      useAuthStore.setState({ user: data })
      setIsEditing(false)
      toast.success('Profile updated!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        avatar_url: profile.avatar_url || '',
      })
    }
  }, [profile])

  const handleSave = () => {
    updateProfile(formData)
  }

  const loading = profileLoading || statsLoading

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base to-bg-surface">
      {/* Header */}
      <div className="bg-bg-surface border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">👤 Profile</h1>
          <Button variant="secondary" onClick={() => navigate('/lobbies')}>
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="bg-bg-surface rounded-lg p-8 text-center text-text-secondary">
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="bg-bg-surface rounded-lg p-8 text-center text-text-secondary">
            User not found
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-bg-surface rounded-lg border border-gray-700 p-6 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.username.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Edit Avatar */}
                {isOwnProfile && isEditing && (
                  <Input
                    type="text"
                    placeholder="Avatar URL"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="mb-4"
                  />
                )}

                {/* Username */}
                <h2 className="text-2xl font-bold text-text-primary mb-2">{profile.username}</h2>
                <p className="text-text-secondary text-sm mb-6">{profile.email}</p>

                {/* Rating Badge */}
                {stats && (
                  <div className="bg-bg-elevated rounded-lg p-4 mb-4">
                    <div className="text-gold-500 text-3xl font-bold">{stats.rating.toFixed(0)}</div>
                    <div className="text-text-secondary text-sm">Rating (Rank #{stats.rank})</div>
                  </div>
                )}

                {/* Edit Button */}
                {isOwnProfile && (
                  <>
                    {!isEditing ? (
                      <Button fullWidth variant="primary" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          flex
                          variant="primary"
                          onClick={handleSave}
                          disabled={isUpdating}
                        >
                          Save
                        </Button>
                        <Button
                          flex
                          variant="secondary"
                          onClick={() => setIsEditing(false)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="md:col-span-2">
              <div className="bg-bg-surface rounded-lg border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">📊 Statistics</h3>

                {isEditing && isOwnProfile && (
                  <div className="mb-6 p-4 bg-bg-elevated rounded-lg border border-gray-700">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                )}

                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Games Played" value={stats.total_games_played} />
                    <StatCard label="Games Won" value={stats.total_games_won} highlight />
                    <StatCard label="Games Lost" value={stats.total_games_lost} />
                    <StatCard
                      label="Win Rate"
                      value={`${(stats.win_rate * 100).toFixed(1)}%`}
                      highlight
                    />
                    <StatCard
                      label="Total Points"
                      value={stats.total_points_scored}
                      highlight
                    />
                    <StatCard
                      label="Avg Points/Game"
                      value={stats.average_points_per_game.toFixed(0)}
                    />
                    <StatCard
                      label="10s Caught"
                      value={stats.tens_caught}
                      highlight
                    />
                  </div>
                )}
              </div>

              {/* Account Info */}
              {isOwnProfile && (
                <div className="bg-bg-surface rounded-lg border border-gray-700 p-6 mt-6">
                  <h3 className="text-xl font-bold text-text-primary mb-4">ℹ️ Account Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-text-secondary">Email:</span>
                      <span className="ml-2 text-text-primary">{profile.email}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Member since:</span>
                      <span className="ml-2 text-text-primary">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          profile.is_active
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}
                      >
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center ${
      highlight ? 'bg-gold-500 bg-opacity-10 border border-gold-500 border-opacity-50' : 'bg-bg-elevated border border-gray-700'
    }`}>
      <div className={`text-2xl font-bold ${highlight ? 'text-gold-500' : 'text-text-primary'}`}>
        {value}
      </div>
      <div className="text-text-secondary text-xs mt-1">{label}</div>
    </div>
  )
}
