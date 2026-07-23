import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useBreakpoint } from '../../composables/useBreakpoint'

function mountComposable<T>(factory: () => T): T {
  let result!: T
  mount(defineComponent({
    setup() {
      result = factory()
      return () => null
    },
  }))
  return result
}

describe('useBreakpoint', () => {
  beforeEach(() => {
    // Default window is 1024px+
    window.innerWidth = 1440
    window.dispatchEvent(new Event('resize'))
  })

  it('returns desktop for viewport >= 1024px', () => {
    const { breakpoint, isMobile } = mountComposable(() => useBreakpoint())
    expect(breakpoint.value).toBe('desktop')
    expect(isMobile.value).toBe(false)
  })

  it('returns tablet for viewport 768-1023px', () => {
    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    const { breakpoint, isMobile, isTablet } = mountComposable(() => useBreakpoint())
    expect(breakpoint.value).toBe('tablet')
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(true)
  })

  it('updates on window resize', () => {
    const { breakpoint, isMobile } = mountComposable(() => useBreakpoint())
    expect(breakpoint.value).toBe('desktop')

    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    expect(breakpoint.value).toBe('tablet')
    expect(isMobile.value).toBe(true)
  })
})