import React, { useRef, useEffect, useCallback } from 'react';
import { View, Animated, PanResponder, Image, LayoutChangeEvent, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../store/game.store';
import { getCardImagePath } from '../../utils/cardImageMapper';

interface DraggableCardProps {
  card: Card;
  isSelected: boolean;
  isPlayable: boolean;
  isMyTurn: boolean;
  onSelect: (cardId: string) => void;
  onPlayCard: (card: Card) => Promise<void>;
  pileLayout: { x: number; y: number; width: number; height: number } | null;
  isPlayingCard?: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  isSelected,
  isPlayable,
  isMyTurn,
  onSelect,
  onPlayCard,
  pileLayout,
  isPlayingCard = false,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.3)).current;
  const cardStartPosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const MIN_DRAG_DISTANCE = 12;
  const cardDimensionsRef = useRef<{ width: number; height: number }>({ width: 80, height: 120 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isSelected && isPlayable && isMyTurn && !isPlayingCard,
      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > MIN_DRAG_DISTANCE && isSelected && isPlayable && isMyTurn && !isPlayingCard;
      },
      onPanResponderGrant: (evt, { x0, y0 }) => {
        isDraggingRef.current = true;
        cardStartPosRef.current = { x: x0, y: y0 };
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });

        // Animate to elevated state
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shadowOpacity, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderMove: (evt, { dx, dy }) => {
        if (!isDraggingRef.current) return;
        pan.setValue({ x: dx, y: dy });
      },
      onPanResponderRelease: (evt, { dx, dy, x0, y0 }) => {
        isDraggingRef.current = false;
        const finalX = cardStartPosRef.current.x + dx;
        const finalY = cardStartPosRef.current.y + dy;

        // Check if released over pile
        const isOverPile =
          pileLayout &&
          finalX >= pileLayout.x &&
          finalX <= pileLayout.x + pileLayout.width &&
          finalY >= pileLayout.y &&
          finalY <= pileLayout.y + pileLayout.height;

        if (isOverPile) {
          // Play card with animation to pile
          Animated.parallel([
            Animated.timing(pan, {
              toValue: {
                x: pileLayout!.x + pileLayout!.width / 2 - cardStartPosRef.current.x,
                y: pileLayout!.y + pileLayout!.height / 2 - cardStartPosRef.current.y,
              },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onPlayCard(card);
            resetCardState();
          });
        } else {
          // Snap back to original position
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
              toValue: 0.3,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        resetCardState();
      },
    })
  ).current;

  const resetCardState = () => {
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    cardDimensionsRef.current = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
  };

  const cardImage = getCardImagePath(card.suit, card.value);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        if (isMyTurn && isPlayable) {
          onSelect(card.id);
        }
      }}
      disabled={!isMyTurn || !isPlayable}
    >
      <Animated.View
        style={[
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={{
            width: 60,
            height: 90,
            borderRadius: 8,
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? '#f0b429' : 'rgba(240, 180, 41, 0.2)',
            backgroundColor: isSelected ? 'rgba(240, 180, 41, 0.1)' : 'rgba(240, 180, 41, 0.05)',
            overflow: 'hidden',
            opacity: !isPlayable ? 0.5 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isDraggingRef.current ? 8 : 2 },
            shadowOpacity: shadowOpacity,
            shadowRadius: isDraggingRef.current ? 12 : 4,
            elevation: isDraggingRef.current ? 8 : 3,
          }}
          onLayout={handleLayout}
          pointerEvents="box-none"
        >
          {cardImage ? (
            <Image
              source={cardImage}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ opacity: 0.7 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: card.suit.includes('heart') || card.suit.includes('diamond') ? '#ef4444' : '#000' }}>
                  {card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value === 1 ? 'A' : card.value}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
