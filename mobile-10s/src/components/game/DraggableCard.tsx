import React, { useRef } from 'react';
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
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.3)).current;
  const cardStartPosRef = useRef({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const isDraggingRef = useRef(false);
  const touchStartTimeRef = useRef(0);
  const cardRef = useRef<View>(null);
  const MIN_DRAG_DISTANCE = 12;
  const TAP_TIMEOUT = 200;

  const panResponder = useRef(
    PanResponder.create({
      // Always allow responder to grab if playable and it's my turn
      onStartShouldSetPanResponder: () => {
        const canRespond = isPlayable && isMyTurn && !isPlayingCard;
        console.log(`[${cardKey}] START - responder can respond: ${canRespond}`);
        return canRespond;
      },

      // Allow responder takeover if enough movement
      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hasMovement = distance > MIN_DRAG_DISTANCE;

        if (hasMovement) {
          console.log(`[${cardKey}] MOVE - distance: ${distance.toFixed(2)}, isSelected: ${isSelected}`);
        }

        // Only allow drag takeover if card is selected AND we have movement
        return hasMovement && isSelected;
      },

      onPanResponderGrant: (evt, { x0, y0 }) => {
        touchStartTimeRef.current = Date.now();
        console.log(`[${cardKey}] GRANT - x0:${x0}, y0:${y0}`);

        // Set initial position
        cardStartPosRef.current = { x: x0, y: y0, screenX: x0, screenY: y0 };

        // Try to get absolute position
        if (cardRef.current) {
          try {
            cardRef.current.measure((fx, fy, width, height, px, py) => {
              cardStartPosRef.current = { x: x0, y: y0, screenX: px, screenY: py };
              console.log(`[${cardKey}] Measured - screen: (${px.toFixed(0)}, ${py.toFixed(0)})`);
            });
          } catch (e) {
            console.log(`[${cardKey}] Measure failed`);
          }
        }

        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Start dragging once we exceed minimum distance and card is selected
        if (distance > MIN_DRAG_DISTANCE && isSelected && !isDraggingRef.current) {
          isDraggingRef.current = true;
          console.log(`[${cardKey}] DRAG START - distance: ${distance.toFixed(2)}`);

          // Animate elevation
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
        }

        // Only move if we're actively dragging
        if (!isDraggingRef.current) return;

        pan.setValue({ x: dx, y: dy });

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
          console.log(`[${cardKey}] DRAGGING - over pile: ${isOverPile}`);
        }
      },

      onPanResponderRelease: (evt, { dx, dy }) => {
        const duration = Date.now() - touchStartTimeRef.current;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log(`[${cardKey}] RELEASE - distance: ${distance.toFixed(2)}, duration: ${duration}ms, isDragging: ${isDraggingRef.current}`);

        // If it was just a tap (minimal movement & time)
        if (distance < MIN_DRAG_DISTANCE && duration < TAP_TIMEOUT && !isDraggingRef.current) {
          console.log(`[${cardKey}] TAP - toggle selection`);
          onSelect();
          return;
        }

        // If we were dragging
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
            // Animate to pile
            Animated.parallel([
              Animated.timing(pan, {
                toValue: {
                  x: pileLayout!.x + pileLayout!.width / 2 - cardStartPosRef.current.screenX,
                  y: pileLayout!.y + pileLayout!.height / 2 - cardStartPosRef.current.screenY,
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
            console.log(`[${cardKey}] SNAP BACK`);
            // Snap back
            snapBackToOrigin();
          }
        } else {
          // Touch ended without becoming a drag
          if (distance > MIN_DRAG_DISTANCE) {
            // Was moving but card not selected - snap back if moved
            snapBackToOrigin();
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

  const snapBackToOrigin = () => {
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

    onCardDragStateChange?.({ isOverPile: false });
  };

  const resetCardState = () => {
    pan.setValue({ x: 0, y: 0 });
    pan.setOffset({ x: 0, y: 0 });
    scale.setValue(1);
    shadowOpacity.setValue(0.3);
  };

  const cardImage = getCardImagePath(card.suit, card.value);

  return (
    <View style={{ marginRight: 8 }}>
      <Animated.View
        ref={cardRef}
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
