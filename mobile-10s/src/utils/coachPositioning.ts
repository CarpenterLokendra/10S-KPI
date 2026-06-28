/**
 * Coach modal positioning utilities matching web app's driver.js behavior
 * Supports: top, bottom, left, right positioning with start/center/end alignment
 */

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

interface ElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScreenDimensions {
  width: number;
  height: number;
}

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
  side: PopoverSide;
}

const POPOVER_WIDTH = 280;
const POPOVER_HEIGHT = 180;
const SPACING = 16;
const SCREEN_PADDING = 12;

/**
 * Calculate popover position based on side and align
 * Falls back to alternative positions if primary doesn't fit
 */
export function calculatePopoverPosition(
  elementLayout: ElementLayout | null,
  screenDims: ScreenDimensions,
  preferredSide: PopoverSide = 'bottom',
  preferredAlign: PopoverAlign = 'start'
): PopoverPosition {
  if (!elementLayout) {
    return {
      top: screenDims.height / 2 - POPOVER_HEIGHT / 2,
      left: SCREEN_PADDING,
      width: screenDims.width - SCREEN_PADDING * 2,
      side: 'bottom',
    };
  }

  // Try preferred position first
  const position = tryPosition(
    elementLayout,
    screenDims,
    preferredSide,
    preferredAlign
  );

  if (position) return position;

  // Fallback priority: try other sides
  const fallbackSides: PopoverSide[] = [
    'bottom',
    'top',
    'right',
    'left',
  ].filter((s) => s !== preferredSide);

  for (const side of fallbackSides) {
    const fallbackPos = tryPosition(elementLayout, screenDims, side, preferredAlign);
    if (fallbackPos) return fallbackPos;
  }

  // Last resort: center on screen
  return {
    top: Math.max(
      SCREEN_PADDING,
      screenDims.height / 2 - POPOVER_HEIGHT / 2
    ),
    left: SCREEN_PADDING,
    width: screenDims.width - SCREEN_PADDING * 2,
    side: 'bottom',
  };
}

function tryPosition(
  element: ElementLayout,
  screen: ScreenDimensions,
  side: PopoverSide,
  align: PopoverAlign
): PopoverPosition | null {
  let top: number;
  let left: number;
  let width = POPOVER_WIDTH;

  // Calculate position based on side
  switch (side) {
    case 'bottom':
      top = element.y + element.height + SPACING;
      left = calculateHorizontalAlignment(
        element.x,
        element.width,
        width,
        screen.width,
        align
      );
      break;

    case 'top':
      top = element.y - POPOVER_HEIGHT - SPACING;
      left = calculateHorizontalAlignment(
        element.x,
        element.width,
        width,
        screen.width,
        align
      );
      break;

    case 'left':
      top = calculateVerticalAlignment(
        element.y,
        element.height,
        POPOVER_HEIGHT,
        screen.height,
        align
      );
      left = element.x - width - SPACING;
      break;

    case 'right':
      top = calculateVerticalAlignment(
        element.y,
        element.height,
        POPOVER_HEIGHT,
        screen.height,
        align
      );
      left = element.x + element.width + SPACING;
      break;
  }

  // Check if position is within screen bounds
  const isWithinBounds = isPositionWithinBounds(
    top,
    left,
    width,
    screen
  );

  if (!isWithinBounds) {
    return null;
  }

  return { top, left, width, side };
}

function calculateHorizontalAlignment(
  elementX: number,
  elementWidth: number,
  popoverWidth: number,
  screenWidth: number,
  align: PopoverAlign
): number {
  let left: number;

  switch (align) {
    case 'start':
      // Align with left edge of element
      left = elementX;
      break;
    case 'center':
      // Center popover over element
      left = elementX + elementWidth / 2 - popoverWidth / 2;
      break;
    case 'end':
      // Align with right edge of element
      left = elementX + elementWidth - popoverWidth;
      break;
  }

  // Clamp to screen bounds
  left = Math.max(SCREEN_PADDING, left);
  left = Math.min(screenWidth - SCREEN_PADDING - popoverWidth, left);

  return left;
}

function calculateVerticalAlignment(
  elementY: number,
  elementHeight: number,
  popoverHeight: number,
  screenHeight: number,
  align: PopoverAlign
): number {
  let top: number;

  switch (align) {
    case 'start':
      // Align with top edge of element
      top = elementY;
      break;
    case 'center':
      // Center popover over element
      top = elementY + elementHeight / 2 - popoverHeight / 2;
      break;
    case 'end':
      // Align with bottom edge of element
      top = elementY + elementHeight - popoverHeight;
      break;
  }

  // Clamp to screen bounds
  top = Math.max(SCREEN_PADDING, top);
  top = Math.min(screenHeight - SCREEN_PADDING - popoverHeight, top);

  return top;
}

function isPositionWithinBounds(
  top: number,
  left: number,
  width: number,
  screen: ScreenDimensions
): boolean {
  return (
    top >= SCREEN_PADDING &&
    top + POPOVER_HEIGHT <= screen.height - SCREEN_PADDING &&
    left >= SCREEN_PADDING &&
    left + width <= screen.width - SCREEN_PADDING
  );
}
