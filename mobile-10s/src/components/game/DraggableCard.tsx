import React, { useRef, useState, useEffect } from 'react';
import { View, Animated, PanResponder, Image, Text } from 'react-native';
import { Card } from '../../store/game.store';
import { getCardImagePath } from '../../utils/cardImageMapper';

interface DraggableCardProps {
  card: Card;
  isSelected: boolean;
  isPlayable: boolean;
  isMyTurn: boolean;
  onSelect: () => void;
  onPlayCard: (card: Card) => Promise<void>;
  pileLayout: { x: number; y: number; width: number; height: number } | null;
  isPlayingCard?: boolean;
  flatListScrollOffset?: number;
  onCardDragStateChange?: (state: { isOverPile: boolean }) => void;
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
  flatListScrollOffset = 0,
  onCardDragStateChange,
}) => {
  const cardKey = `${card.suit}-${card.value}`;
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const scale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.3)).current;
  const cardStartPosRef = useRef({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const isDraggingRef = useRef(false);
  const touchStartTimeRef = useRef(0);
  const cardRef = useRef<View>(null);
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isSelectedRef = useRef(isSelected);
  const cardAbsolutePosRef = useRef({ x: 0, y: 0 });
  const MIN_DRAG_DISTANCE = 12;
  const TAP_TIMEOUT = 200;

  // Keep isSelectedRef up-to-date
  useEffect(() => {
    isSelectedRef.current = isSelected;
  }, [isSelected]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const canRespond = isPlayable && isMyTurn && !isPlayingCard;
        console.log(`[${cardKey}] START - can respond: ${canRespond}`);
        return canRespond;
      },

      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hasMovement = distance > MIN_DRAG_DISTANCE;

        if (hasMovement) {
          console.log(`[${cardKey}] MOVE responder check - distance: ${distance.toFixed(2)}, isSelected: ${isSelectedRef.current}`);
        }

        return hasMovement && isSelectedRef.current;
      },

      onPanResponderGrant: (evt, { x0, y0 }) => {
        touchStartTimeRef.current = Date.now();
        console.log(`[${cardKey}] GRANT - x0:${x0}, y0:${y0}`);

        cardStartPosRef.current = { x: x0, y: y0, screenX: x0, screenY: y0 };

        if (cardRef.current) {
          try {
            cardRef.current.measure((fx, fy, width, height, px, py) => {
              cardStartPosRef.current = { x: x0, y: y0, screenX: px, screenY: py };
              cardAbsolutePosRef.current = { x: px, y: py };
              console.log(`[${cardKey}] Measured - screen: (${px.toFixed(0)}, ${py.toFixed(0)})`);
            });
          } catch (e) {
            console.log(`[${cardKey}] Measure failed`);
          }
        }
      },

      onPanResponderMove: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > MIN_DRAG_DISTANCE && isSelectedRef.current && !isDraggingRef.current) {
          isDraggingRef.current = true;
          console.log(`[${cardKey}] DRAG START - distance: ${distance.toFixed(2)}`);

          startAnimation(
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 150,
              useNativeDriver: true,
            }),
            'DRAG_START'
          );
        }

        if (!isDraggingRef.current) return;

        // Update drag position using state instead of setValue
        setDragOffset({ x: dx, y: dy });

        // Check pile collision
        const currentX = cardStartPosRef.current.screenX + dx;
        const currentY = cardStartPosRef.current.screenY + dy;

        if (pileLayout) {
          const isOverPile =
            currentX >= pileLayout.x &&
            currentX <= pileLayout.x + pileLayout.width &&
            currentY >= pileLayout.y &&
            currentY <= pileLayout.y + pileLayout.height;

          onCardDragStateChange?.({ isOverPile });
        }
      },

      onPanResponderRelease: (evt, { dx, dy }) => {
        const duration = Date.now() - touchStartTimeRef.current;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log(`[${cardKey}] RELEASE - distance: ${distance.toFixed(2)}, duration: ${duration}ms, isDragging: ${isDraggingRef.current}`);

        // Detect tap
        if (distance < MIN_DRAG_DISTANCE && duration < TAP_TIMEOUT && !isDraggingRef.current) {
          console.log(`[${cardKey}] TAP - toggle selection`);
          onSelect();
          setDragOffset({ x: 0, y: 0 });
          return;
        }

        // Handle drag
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          const finalX = cardStartPosRef.current.screenX + dx;
          const finalY = cardStartPosRef.current.screenY + dy;

          const isOverPile =
            pileLayout &&
            finalX >= pileLayout.x &&
            finalX <= pileLayout.x + pileLayout.width &&
            finalY >= pileLayout.y &&
            finalY <= pileLayout.y + pileLayout.height;

          console.log(`[${cardKey}] DRAG END - over pile: ${isOverPile}`);

          if (isOverPile) {
            console.log(`[${cardKey}] PLAY CARD`);
            onPlayCard(card);
            resetCardState();
          } else {
            console.log(`[${cardKey}] SNAP BACK`);
            snapBack();
          }
        } else {
          // Non-drag release
          if (distance > MIN_DRAG_DISTANCE) {
            snapBack();
          }
        }
      },

      onPanResponderTerminate: () => {
        console.log(`[${cardKey}] TERMINATE`);
        isDraggingRef.current = false;
        resetCardState();
        onCardDragStateChange?.({ isOverPile: false });
      },
    })
  ).current;

  // Cleanup: Stop animations when component unmounts
  useEffect(() => {
    return () => {
      if (activeAnimationRef.current) {
        activeAnimationRef.current.stop();
        console.log(`[${cardKey}] Cleanup - stopped animation on unmount`);
      }
    };
  }, [cardKey]);

  // Helper to stop previous animation before starting new one
  const startAnimation = (animation: Animated.CompositeAnimation, label: string) => {
    if (activeAnimationRef.current) {
      console.log(`[${cardKey}] Stopping previous animation before ${label}`);
      activeAnimationRef.current.stop();
    }
    activeAnimationRef.current = animation;
    animation.start();
  };

  const snapBack = () => {
    startAnimation(
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      'SNAP_BACK'
    );

    setDragOffset({ x: 0, y: 0 });
    onCardDragStateChange?.({ isOverPile: false });
  };

  const resetCardState = () => {
    startAnimation(
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      'RESET'
    );

    setDragOffset({ x: 0, y: 0 });
  };

  const cardImage = getCardImagePath(card.suit, card.value);

  return (
    <View style={{ marginRight: 8 }}>
      <Animated.View
        ref={cardRef}
        style={[
          {
            transform: [
              { translateX: dragOffset.x },
              { translateY: dragOffset.y },
              { scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={{
            width: 60,
            height: 90,
            borderRadius: 8,
            borderWidth: isSelected ? 5 : 1,
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
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: card.suit.includes('heart') || card.suit.includes('diamond') ? '#ef4444' : '#000',
                  }}
                >
                  {card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value === 1 ? 'A' : card.value}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};
