/**
 * Debug utilities for driver.js popover positioning issues
 * Use these to diagnose why popovers appear in wrong locations
 */

interface ElementMeasurement {
  rect: DOMRect
  computed: CSSStyleDeclaration
  parent: HTMLElement | null
  parentRect: DOMRect | null
  parentComputed: CSSStyleDeclaration | null
}

export function debugElementMeasurement(selector: string): ElementMeasurement | null {
  const el = document.querySelector(selector) as HTMLElement
  if (!el) {
    console.error(`❌ Element not found: ${selector}`)
    return null
  }

  const rect = el.getBoundingClientRect()
  const computed = window.getComputedStyle(el)
  const parent = el.parentElement as HTMLElement | null
  const parentRect = parent?.getBoundingClientRect() || null
  const parentComputed = parent ? window.getComputedStyle(parent) : null

  console.group(`📍 Element Measurement: ${selector}`)
  console.log('✓ Element found')
  console.log('Element BoundingClientRect:', {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  })
  console.log('Element CSS (potentially affecting positioning):', {
    position: computed.position,
    transform: computed.transform !== 'none' ? computed.transform : 'none',
    zIndex: computed.zIndex,
    display: computed.display,
  })

  if (parent) {
    console.log('Parent element:', parent.tagName, {
      class: parent.className,
    })
    console.log('Parent BoundingClientRect:', {
      top: Math.round(parentRect!.top),
      left: Math.round(parentRect!.left),
      width: Math.round(parentRect!.width),
      height: Math.round(parentRect!.height),
    })
    console.log('Parent CSS (affects coordinate system):', {
      position: parentComputed!.position,
      overflow: parentComputed!.overflow,
      transform: parentComputed!.transform !== 'none' ? parentComputed!.transform : 'none',
    })
  }

  console.groupEnd()

  return { rect, computed, parent, parentRect, parentComputed }
}

export function debugAllElements(selectors: string[]): void {
  console.group('🔍 Debugging All Guide Elements')
  selectors.forEach((selector) => {
    debugElementMeasurement(selector)
  })
  console.groupEnd()
}

export function debugPopoverPosition(): void {
  const popover = document.querySelector('.driver-popover') as HTMLElement
  if (!popover) {
    console.warn('⚠️ No popover currently visible')
    return
  }

  const rect = popover.getBoundingClientRect()
  const computed = window.getComputedStyle(popover)

  console.group('🎯 Popover Position (Rendered)')
  console.log('Popover BoundingClientRect:', {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  })
  console.log('Popover CSS:', {
    position: computed.position,
    top: computed.top,
    left: computed.left,
    transform: computed.transform !== 'none' ? computed.transform : 'none',
    zIndex: computed.zIndex,
  })
  console.log('Popover outer HTML (first 300 chars):', popover.outerHTML.substring(0, 300))
  console.groupEnd()
}

export function debugHighlightedElement(): void {
  const highlight = document.querySelector('.driver-highlight') as HTMLElement
  if (!highlight) {
    console.warn('⚠️ No highlight currently visible')
    return
  }

  const rect = highlight.getBoundingClientRect()
  const computed = window.getComputedStyle(highlight)

  console.group('🔆 Highlight Element Position')
  console.log('Highlight BoundingClientRect:', {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  })
  console.log('Highlight CSS:', {
    position: computed.position,
    zIndex: computed.zIndex,
  })
  console.groupEnd()
}

export function debugStepConfiguration(steps: any[]): void {
  console.group('⚙️ Driver.js Step Configuration')
  steps.forEach((step, i) => {
    const title = step.popover?.title || step.element
    console.log(`Step ${i}: ${step.element}`, {
      side: step.popover?.side,
      align: step.popover?.align,
      title: title.substring(0, 40),
    })
  })
  console.groupEnd()
}

/**
 * Call this once the tour is active and a popover is showing
 * Compares the target element position with the popover position
 */
export function debugPositioningMismatch(): void {
  const popover = document.querySelector('.driver-popover') as HTMLElement
  const highlight = document.querySelector('.driver-highlight') as HTMLElement

  if (!popover || !highlight) {
    console.warn('⚠️ Cannot compare: popover or highlight not visible')
    return
  }

  const highlightRect = highlight.getBoundingClientRect()
  const popoverRect = popover.getBoundingClientRect()

  // Calculate expected position based on side/align
  const verticalGap = 12 // pixels
  const expectedPositions = {
    'bottom-start': {
      top: highlightRect.bottom + verticalGap,
      left: highlightRect.left,
    },
    'bottom-center': {
      top: highlightRect.bottom + verticalGap,
      left: highlightRect.left + (highlightRect.width - popoverRect.width) / 2,
    },
    'top-start': {
      top: highlightRect.top - popoverRect.height - verticalGap,
      left: highlightRect.left,
    },
    'top-center': {
      top: highlightRect.top - popoverRect.height - verticalGap,
      left: highlightRect.left + (highlightRect.width - popoverRect.width) / 2,
    },
  }

  console.group('🔄 Positioning Mismatch Analysis')
  console.log('Highlight position:', {
    top: Math.round(highlightRect.top),
    left: Math.round(highlightRect.left),
    bottom: Math.round(highlightRect.bottom),
    right: Math.round(highlightRect.right),
  })
  console.log('Popover actual position:', {
    top: Math.round(popoverRect.top),
    left: Math.round(popoverRect.left),
    bottom: Math.round(popoverRect.bottom),
    right: Math.round(popoverRect.right),
  })
  console.log('Expected positions (assuming bottom-start as default):', expectedPositions)
  console.log('Mismatch offset:', {
    topDiff: Math.round(popoverRect.top - highlightRect.bottom),
    leftDiff: Math.round(popoverRect.left - highlightRect.left),
  })
  console.groupEnd()
}

export function enableDebugMode(): void {
  console.log('🐛 Debug mode enabled for driver.js tour')

  // Hook into driver.js events if possible
  const observer = new MutationObserver(() => {
    const popover = document.querySelector('.driver-popover')
    if (popover) {
      console.log('📢 Popover appeared in DOM')
      debugPositioningMismatch()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Return cleanup function
  return () => observer.disconnect()
}
