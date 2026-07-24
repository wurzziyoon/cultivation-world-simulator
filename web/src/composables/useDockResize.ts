import { onUnmounted, ref } from 'vue'

export function useDockResize(
  initialHeight: number,
  minHeight: number,
  maxHeight: number,
  isEnabled: () => boolean,
) {
  const dockHeight = ref(Math.max(minHeight, Math.min(maxHeight, initialHeight)))
  const isResizing = ref(false)

  let resizeStartY = 0
  let resizeStartHeight = 0

  function onResizePointerMove(e: PointerEvent) {
    if (!isResizing.value) return
    const delta = resizeStartY - e.clientY
    dockHeight.value = Math.max(minHeight, Math.min(maxHeight, resizeStartHeight + delta))
  }

  function stopResize() {
    if (!isResizing.value) return
    isResizing.value = false
    document.removeEventListener('pointermove', onResizePointerMove)
    document.removeEventListener('pointerup', stopResize)
  }

  function startResize(e: PointerEvent) {
    if (!isEnabled()) return
    e.preventDefault()
    resizeStartY = e.clientY
    resizeStartHeight = dockHeight.value
    isResizing.value = true
    document.addEventListener('pointermove', onResizePointerMove, { passive: true })
    document.addEventListener('pointerup', stopResize, { passive: true })
  }

  onUnmounted(() => {
    stopResize()
  })

  return {
    dockHeight,
    isResizing,
    startResize,
    stopResize,
  }
}
