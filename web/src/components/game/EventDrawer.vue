<script setup lang="ts">
import EventPanel from './panels/EventPanel.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="event-drawer-wrapper">
        <div class="event-drawer-backdrop" @click="close"></div>
        <aside class="event-drawer">
          <div class="event-drawer-header">
            <h3>事件</h3>
            <button class="event-drawer-close" @click="close">✕</button>
          </div>
          <EventPanel />
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.event-drawer-wrapper {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.event-drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.event-drawer {
  position: relative;
  width: min(85vw, 400px);
  height: 100%;
  background: #181818;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 1;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
}

.event-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #222;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.event-drawer-header h3 {
  margin: 0;
  font-size: 14px;
}

.event-drawer-close {
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.event-drawer-close:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .event-drawer,
.drawer-leave-active .event-drawer {
  transition: transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .event-drawer,
.drawer-leave-to .event-drawer {
  transform: translateX(100%);
}
</style>