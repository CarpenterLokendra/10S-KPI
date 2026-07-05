import React, { useRef } from 'react';
import { View, Animated, PanResponder, Image, Text, TouchableWithoutFeedback } from 'react-native';
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
  const cardRef = useRef<View>(null);
  const MIN_DRAG_DISTANCE = 12;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Only allow drag if card is selected, playable, and it's my turn
        const shouldDrag = isSelected && isPlayable && isMyTurn && !isPlayingCard;
        console.log(`[${cardKey}] onStartShouldSetPanResponder: ${shouldDrag}`);
        return shouldDrag;
      },
      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        // Only activate drag with sufficient movement
        const distance = Math.sqrt(dx * dx + dy * dy);
        const shouldDrag = distance > MIN_DRAG_DISTANCE && isSelected && isPlayable && isMyTurn && !isPlayingCard;
        if (distance > MIN_DRAG_DISTANCE) {
          console.log(`[${cardKey}] onMoveShouldSetPanResponder: ${shouldDrag} (distance: ${distance.toFixed(2)})`);
        }
        return shouldDrag;
      },
      onPanResponderGrant: (evt, { x0, y0 }) => {
        console.log(`[${cardKey}] DRAG START - x0:${x0}, y0:${y0}`);
        isDraggingRef.current = true;

        // Set fallback position immediately
        cardStartPosRef.current = { x: x0, y: y0, screenX: x0, screenY: y0 };

        // Try to get absolute position
        if (cardRef.current) {
          try {
            cardRef.current.measure((fx, fy, width, height, px, py) => {
              cardStartPosRef.current = { x: x0, y: y0, screenX: px, screenY: py };
              console.log(`[${cardKey}] Measured position - screen: (${px.toFixed(0)}, ${py.toFixed(0)})`);
            });
          } catch (e) {
            console.log(`[${cardKey}] Measure failed, using local coords`);
          }
        }

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

        // Check if card is over pile
        const currentScreenX = cardStartPosRef.current.screenX + dx;
        const currentScreenY = cardStartPosRef.current.screenY + dy;

        if (pileLayout) {
          const isOverPile =
            currentScreenX >= pileLayout.x &&
            currentScreenX <= pileLayout.x + pileLayout.width &&
            currentScreenY >= pileLayout.y &&
            currentScreenY <= pileLayout.y + pileLayout.height;

          onCardDragStateChange?.({ isOverPile });
          console.log(`[${cardKey}] MOVE - isOverPile: ${isOverPile} pos: (${currentScreenX.toFixed(0)}, ${currentScreenY.toFixed(0)})`);
        }
      },
      onPanResponderRelease: (evt, { dx, dy }) => {
        console.log(`[${cardKey}] RELEASE - dx:${dx.toFixed(2)}, dy:${dy.toFixed(2)}`);

        if (!isDraggingRef.current) {
          isDraggingRef.current = false;
          return;
        }

        isDraggingRef.current = false;
        const finalScreenX = cardStartPosRef.current.screenX + dx;
        const finalScreenY = cardStartPosRef.current.screenY + dy;

        const isOverPile =
          pileLayout &&
          finalScreenX >= pileLayout.x &&
          finalScreenX <= pileLayout.x + pileLayout.width &&
          finalScreenY >= pileLayout.y &&
          finalScreenY <= pileLayout.y + pileLayout.height;

        console.log(`[${cardKey}] RELEASE result - isOverPile: ${isOverPile}`);

        if (isOverPile) {
          console.log(`[${cardKey}] PLAYING CARD`);
          // Play card with animation to pile
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

          onCardDragStateChange?.({ isOverPile: false });
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

  const cardImage = getCardImagePath(card.suit, card.value);

  return (
    <View style={{ marginRight: 8 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (isMyTurn && isPlayable) {
            console.log(`[${cardKey}] TAP - toggling selection`);
            onSelect();
          }
        }}
        disabled={!isMyTurn || !isPlayable}
      >
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
                  <Text style={{ fontSize: 16, fontWeight: '700', color: card.suit.includes('heart') || card.suit.includes('diamond') ? '#ef4444' : '#000' }}>
                    {card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value === 1 ? 'A' : card.value}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};
