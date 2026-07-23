import { ref, computed } from 'vue'

const TABLET_BP = 768
const DESKTOP_BP = 1024

export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint() {
  const width = ref(window.innerWidth)

  function onResize() {
    width.value = window.innerWidth
  }

  window.addEventListener('resize', onResize)

  const breakpoint = computed<BreakpointName>(() => {
    if (width.value >= DESKTOP_BP) return 'desktop'
    if (width.value >= TABLET_BP) return 'tablet'
    return 'mobile'
  })

  const isMobile = computed(() => breakpoint.value !== 'desktop')
  const isTablet = computed(() => breakpoint.value === 'tablet')

  return { width, breakpoint, isMobile, isTablet }
}