<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore } from '../../stores/ui'
import { useI18n } from 'vue-i18n'
import AvatarDetailView from './panels/info/AvatarDetail.vue'
import RegionDetailView from './panels/info/RegionDetail.vue'
import SectDetailView from './panels/info/SectDetail.vue'
import POIDetailView from './panels/info/POIDetail.vue'
import xIcon from '@/assets/icons/ui/lucide/x.svg'

const { t } = useI18n()
const uiStore = useUiStore()
const sheetRef = ref<HTMLElement | null>(null)
const startY = ref(0)
const translateY = ref(0)
const isDragging = ref(false)

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const currentComponent = computed(() => {
  switch (uiStore.selectedTarget?.type) {
    case 'avatar': return AvatarDetailView
    case 'region': return RegionDetailView
    case 'sect': return SectDetailView
    case 'poi': return POIDetailView
    default: return null
  }
})

const title = computed(() => {
  if (uiStore.detailData) return uiStore.detailData.name
  return uiStore.selectedTarget?.id || t('common.detail')
})

function close() {
  translateY.value = 0
  emit('update:open', false)
}

function onPointerDown(e: PointerEvent) {
  startY.value = e.clientY
  isDragging.value = true
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const delta = e.clientY - startY.value
  translateY.value = Math.max(0, delta)
}

function onPointerUp() {
  isDragging.value = false
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  if (translateY.value > 100) {
    close()
  } else {
    translateY.value = 0
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="info-sheet-overlay" @click="close">
        <div
          ref="sheetRef"
          class="info-sheet"
          :style="{ transform: `translateY(${translateY}px)` }"
          @click.stop
        >
          <div class="info-sheet-handle" @pointerdown="onPointerDown">
            <div class="info-sheet-handle-bar"></div>
          </div>
          <div class="info-sheet-header">
            <span class="info-sheet-title">{{ title }}</span>
            <button class="info-sheet-close" @click="close">
              <span class="close-icon" :style="{ '--icon-url': `url(${xIcon})` }" aria-hidden="true"></span>
            </button>
          </div>
          <div class="info-sheet-body">
            <div v-if="uiStore.isLoadingDetail && !uiStore.detailData" class="state-msg">
              {{ t('common.loading') }}
            </div>
            <div v-else-if="uiStore.detailError" class="state-msg error">
              {{ uiStore.detailError }}
            </div>
            <div v-else-if="uiStore.detailData && currentComponent" class="content-wrapper">
              <component :is="currentComponent" :data="uiStore.detailData" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.info-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.3);
}

.info-sheet {
  width: 100%;
  max-height: 60vh;
  background: var(--panel-bg, rgba(24, 24, 24, 0.96));
  border-radius: 12px 12px 0 0;
  border: 1px solid var(--color-border, #333);
  border-bottom: none;
  display: flex;
  flex-direction: column;
  transition: none;
  touch-action: none;
}

.info-sheet-handle {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
  cursor: grab;
  touch-action: none;
}

.info-sheet-handle-bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #555;
}

.info-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px 12px;
  border-bottom: 1px solid var(--color-border, #333);
  flex-shrink: 0;
}

.info-sheet-title {
  font-size: 16px;
  font-weight: bold;
}

.info-sheet-close {
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-sheet-close:hover {
  color: #fff;
}

.close-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-color: currentColor;
  -webkit-mask-image: var(--icon-url);
  mask-image: var(--icon-url);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.info-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
  min-height: 0;
}

.content-wrapper {
  height: 100%;
}

.state-msg {
  color: var(--color-text-secondary, #888);
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}

.state-msg.error {
  color: #ff7875;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-active .info-sheet,
.sheet-leave-active .info-sheet {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .info-sheet,
.sheet-leave-to .info-sheet {
  transform: translateY(100%);
}
</style>