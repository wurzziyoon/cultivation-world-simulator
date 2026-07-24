import { describe, it, expect } from 'vitest'
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
})