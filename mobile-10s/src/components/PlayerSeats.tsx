import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Player {
  id: string;
  username: string;
  avatar_url?: string;
  score?: number;
  status?: 'active' | 'folded' | 'waiting';
}

interface PlayerSeatsProps {
  players: Player[];
  currentPlayerId?: string;
  isDark: boolean;
}

export const PlayerSeats: React.FC<PlayerSeatsProps> = ({
  players,
  currentPlayerId,
  isDark,
}) => {
  const getSeatPosition = (index: number, total: number) => {
    const positions = [
      { top: 0, left: '50%', transform: [{ translateX: -40 }] }, // Top center
      { top: '50%', right: 10, transform: [{ translateY: -40 }] }, // Right
      { top: '100%', left: '50%', transform: [{ translateX: -40 }, { translateY: -80 }] }, // Bottom
      { top: '50%', left: 10, transform: [{ translateY: -40 }] }, // Left
    ];

    return positions[index % 4] || positions[0];
  };

  return (
    <View style={styles.container}>
      {players.map((player, index) => (
        <View
          key={player.id}
          style={[
            styles.seatWrapper,
            getSeatPosition(index, players.length),
          ]}
        >
          <View
            style={[
              styles.seat,
              {
                borderColor:
                  currentPlayerId === player.id
                    ? '#f0b429'
                    : isDark
                    ? '#666'
                    : '#ccc',
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderWidth: currentPlayerId === player.id ? 3 : 1,
              },
            ]}
          >
            {player.avatar_url ? (
              <Image
                source={{ uri: player.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: isDark ? '#444' : '#ddd' },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: isDark ? '#fff' : '#666' },
                  ]}
                >
                  {player.username[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text
              style={[
                styles.playerName,
                { color: isDark ? '#fff' : '#333' },
              ]}
              numberOfLines={1}
            >
              {player.username}
            </Text>
            {player.score !== undefined && (
              <Text
                style={[
                  styles.score,
                  { color: isDark ? '#f0b429' : '#f0b429' },
                ]}
              >
                {player.score}
              </Text>
            )}
            {player.status && (
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      player.status === 'active'
                        ? '#4ade80'
                        : player.status === 'folded'
                        ? '#ef4444'
                        : '#eab308',
                  },
                ]}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  seat: {
    width: 80,
    height: 100,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  score: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
