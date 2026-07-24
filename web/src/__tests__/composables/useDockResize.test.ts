import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useDockResize } from '../../composables/useDockResize'

describe('useDockResize', () => {
  it('initializes with given height', () => {
    const { dockHeight } = useDockResize(200, 100, 400, () => true)
    expect(dockHeight.value).toBe(200)
  })

  it('clamps to min on initialization', () => {
    const { dockHeight } = useDockResize(50, 100, 400, () => true)
    expect(dockHeight.value).toBe(100)
  })

  it('clamps to max on initialization', () => {
    const { dockHeight } = useDockResize(500, 100, 400, () => true)
    expect(dockHeight.value).toBe(400)
  })

  it('handles resize via pointer events', () => {
    const { dockHeight, startResize } = useDockResize(200, 100, 400, () => true)

    // Start resize at clientY=300
    const pointerDown = new PointerEvent('pointerdown', { clientY: 300, bubbles: true })
    startResize(pointerDown)

    // Move pointer up to clientY=200, which should increase height by 100
    const pointerMove = new PointerEvent('pointermove', { clientY: 200, bubbles: true })
    document.dispatchEvent(pointerMove)
    expect(dockHeight.value).toBe(300)

    // Move pointer further up to clientY=50, but clamped to maxHeight=400
    const pointerMove2 = new PointerEvent('pointermove', { clientY: 50, bubbles: true })
    document.dispatchEvent(pointerMove2)
    expect(dockHeight.value).toBe(400)

    // Release pointer
    const pointerUp = new PointerEvent('pointerup', { bubbles: true })
    document.dispatchEvent(pointerUp)

    // After release, moving again should not change height
    const pointerMove3 = new PointerEvent('pointermove', { clientY: 0, bubbles: true })
    document.dispatchEvent(pointerMove3)
    expect(dockHeight.value).toBe(400)
  })
})