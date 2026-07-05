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
  const tapStartTimeRef = useRef(0);
  const cardRef = useRef<View>(null);
  const MIN_DRAG_DISTANCE = 12;
  const TAP_TIMEOUT = 200;

  const panResponder = useRef(
    PanResponder.create({
      // Allow responder to be set for both selected and unselected cards
      onStartShouldSetPanResponder: () => {
        if (!isMyTurn || !isPlayable) return false;
        return true;
      },
      onMoveShouldSetPanResponder: (evt, { dx, dy }) => {
        if (!isMyTurn || !isPlayable) return false;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > MIN_DRAG_DISTANCE && isSelected;
      },
      onPanResponderGrant: (evt, { x0, y0 }) => {
        tapStartTimeRef.current = Date.now();

        if (cardRef.current) {
          cardRef.current.measure((fx, fy, width, height, px, py) => {
            cardStartPosRef.current = {
              x: x0,
              y: y0,
              screenX: px,
              screenY: py,
            };
            console.log(`[${cardKey}] GRANT - Local: {x0:${x0}, y0:${y0}} Screen: {px:${px}, py:${py}}`);
          });
        } else {
          cardStartPosRef.current = { x: x0, y: y0, screenX: x0, screenY: y0 };
        }

        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, { dx, dy }) => {
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > MIN_DRAG_DISTANCE && !isDraggingRef.current && isSelected) {
          isDraggingRef.current = true;
          console.log(`[${cardKey}] DRAG START - distance: ${distance.toFixed(2)}`);

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

        if (!isDraggingRef.current) return;

        pan.setValue({ x: dx, y: dy });

        const currentScreenX = cardStartPosRef.current.screenX + dx;
        const currentScreenY = cardStartPosRef.current.screenY + dy;

        if (pileLayout) {
          const isOverPile =
            currentScreenX >= pileLayout.x &&
            currentScreenX <= pileLayout.x + pileLayout.width &&
            currentScreenY >= pileLayout.y &&
            currentScreenY <= pileLayout.y + pileLayout.height;

          onCardDragStateChange?.({ isOverPile });
          console.log(`[${cardKey}] MOVE - pos: {${currentScreenX.toFixed(0)}, ${currentScreenY.toFixed(0)}} isOverPile: ${isOverPile}`);
        }
      },
      onPanResponderRelease: (evt, { dx, dy }) => {
        const tapDuration = Date.now() - tapStartTimeRef.current;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log(`[${cardKey}] RELEASE - duration: ${tapDuration}ms distance: ${distance.toFixed(2)}`);

        if (distance < MIN_DRAG_DISTANCE && tapDuration < TAP_TIMEOUT) {
          console.log(`[${cardKey}] TAP detected - toggling selection`);
          onSelect();
          isDraggingRef.current = false;
          return;
        }

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
          console.log(`[${cardKey}] SNAPPING BACK`);
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
        console.log(`[${cardKey}] TERMINATED`);
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
    </View>
  );
};
