# Mobile Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the desktop-only layout of the cultivation world simulator for foldable phones (700-900px) and tablets (768-1024px).

**Architecture:** Detect viewport width via a reactive composable (`useBreakpoint`), then conditionally render a mobile layout that replaces the sidebar with a drawer, the info panel with a bottom sheet, and collapses the status bar. Desktop layout is completely unchanged.

**Tech Stack:** Vue 3, TypeScript, Pixi.js (pixi-viewport), Naive UI, Pinia

## Global Constraints

- Breakpoint: `1024px` — below this, mobile layout activates
- Desktop layout must remain pixel-identical for viewports >1024px
- Touch targets must be minimum 44×44px on mobile
- All new components must have tests
- No new external dependencies (use VueUse if needed, already available)
- Do not modify the Pixi.js canvas rendering logic

---

### Task 1: Create `useBreakpoint` composable

**Files:**
- Create: `web/src/composables/useBreakpoint.ts`
- Test: `web/src/__tests__/composables/useBreakpoint.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `{ isMobile: Ref<boolean>, isTablet: Ref<boolean>, breakpoint: Ref<'mobile' | 'tablet' | 'desktop'> }`

- [ ] **Step 1: Write the failing test**

```ts
// web/src/__tests__/composables/useBreakpoint.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBreakpoint } from '../../composables/useBreakpoint'

describe('useBreakpoint', () => {
  beforeEach(() => {
    // Default window is 1024px+
    window.innerWidth = 1440
    window.dispatchEvent(new Event('resize'))
  })

  it('returns desktop for viewport >= 1024px', () => {
    const { breakpoint, isMobile } = useBreakpoint()
    expect(breakpoint.value).toBe('desktop')
    expect(isMobile.value).toBe(false)
  })

  it('returns tablet for viewport 768-1023px', () => {
    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    const { breakpoint, isMobile, isTablet } = useBreakpoint()
    expect(breakpoint.value).toBe('tablet')
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(true)
  })

  it('updates on window resize', () => {
    const { breakpoint, isMobile } = useBreakpoint()
    expect(breakpoint.value).toBe('desktop')

    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    expect(breakpoint.value).toBe('tablet')
    expect(isMobile.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run web/src/__tests__/composables/useBreakpoint.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// web/src/composables/useBreakpoint.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

const TABLET_BP = 768
const DESKTOP_BP = 1024

export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint() {
  const width = ref(window.innerWidth)

  function onResize() {
    width.value = window.innerWidth
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  const breakpoint = computed<BreakpointName>(() => {
    if (width.value >= DESKTOP_BP) return 'desktop'
    if (width.value >= TABLET_BP) return 'tablet'
    return 'mobile'
  })

  const isMobile = computed(() => breakpoint.value !== 'desktop')
  const isTablet = computed(() => breakpoint.value === 'tablet')

  return { width, breakpoint, isMobile, isTablet }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run web/src/__tests__/composables/useBreakpoint.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/composables/useBreakpoint.ts web/src/__tests__/composables/useBreakpoint.test.ts
git commit -m "feat: add useBreakpoint composable for responsive viewport detection"
```

---

### Task 2: Make StatusBar responsive — collapse widgets into "more" dropdown

**Files:**
- Modify: `web/src/components/layout/StatusBar.vue`
- Test: `web/src/__tests__/components/StatusBar.test.ts` (modify)

**Interfaces:**
- Consumes: `useBreakpoint()` from Task 1
- Produces: responsive StatusBar with collapsed "more" dropdown on mobile

- [ ] **Step 1: Read existing StatusBar test**

```bash
cat web/src/__tests__/components/StatusBar.test.ts
```

- [ ] **Step 2: Add responsive logic to StatusBar.vue**

Import `useBreakpoint`:
```ts
import { useBreakpoint } from '../../composables/useBreakpoint'
const { isMobile } = useBreakpoint()
```

In the template, add `v-if="!isMobile"` to all `StatusWidget` items except the time widget. Wrap the collapsed widgets in a "more" dropdown:

```vue
<!-- After the time widget, before the "more" button -->
<template v-if="!isMobile">
  <!-- existing StatusWidget lines... -->
</template>

<!-- "more" dropdown for mobile -->
<div v-if="isMobile" class="more-widget">
  <span class="divider">|</span>
  <span class="widget-trigger more-trigger" @click="showMoreMenu = !showMoreMenu" title="More">
    <span class="widget-label">⋮</span>
  </span>
  <div v-if="showMoreMenu" class="more-dropdown" @click="showMoreMenu = false">
    <button
      v-for="item in moreMenuItems"
      :key="item.key"
      class="more-dropdown-item"
      @click="item.action()"
    >
      <span v-if="item.icon" class="more-dropdown-icon" :style="{ '--icon-url': `url(${item.icon})` }"></span>
      {{ item.label }}
    </button>
  </div>
</div>
```

Add `showMoreMenu` ref and `moreMenuItems` computed array to the script section:
```ts
const showMoreMenu = ref(false)

interface MoreMenuItem {
  key: string
  label: string
  icon?: string
  action: () => void
}

const moreMenuItems = computed<MoreMenuItem[]>(() => [
  // ... map of all non-time widgets with their labels, icons, and openPanel actions
  { key: 'hiddenDomain', label: domainLabel.value, icon: shieldIcon, action: () => openPanel('hiddenDomain') },
  { key: 'sectRelations', label: t('game.sect_relations.title_short'), icon: shieldIcon, action: () => openPanel('sectRelations') },
  // ... etc for all 9 widgets
])
```

Add styles for the dropdown:
```css
.more-widget {
  position: relative;
}

.more-trigger {
  font-size: 20px;
  letter-spacing: 0;
  padding: 0 8px;
}

.more-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #222;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 4px;
  z-index: 1000;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.more-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #eee;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.more-dropdown-item:hover {
  background: rgba(255,255,255,0.08);
}

.more-dropdown-icon {
  width: 16px;
  height: 16px;
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
  flex-shrink: 0;
}
```

- [ ] **Step 3: Update StatusBar test**

Modify the existing test to cover the collapsed state. Add a test case for mobile width.

- [ ] **Step 4: Run tests**

Run: `npx vitest run web/src/__tests__/components/StatusBar.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/layout/StatusBar.vue web/src/__tests__/components/StatusBar.test.ts
git commit -m "feat: make StatusBar responsive with collapsible widget menu"
```

---

### Task 3: Create EventDrawer component

**Files:**
- Create: `web/src/components/game/EventDrawer.vue`
- Test: `web/src/__tests__/components/game/EventDrawer.test.ts`

**Interfaces:**
- Consumes: `EventPanel` component (reused inside), `isMobile` from Task 1
- Produces: `<EventDrawer v-model:open="bool" />` — a slide-in drawer from right

- [ ] **Step 1: Write the failing test**

```ts
// web/src/__tests__/components/game/EventDrawer.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventDrawer from '../../../components/game/EventDrawer.vue'

describe('EventDrawer', () => {
  it('renders when open is true', () => {
    const wrapper = mount(EventDrawer, { props: { open: true } })
    expect(wrapper.find('.event-drawer').exists()).toBe(true)
    expect(wrapper.find('.event-drawer-backdrop').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(EventDrawer, { props: { open: false } })
    expect(wrapper.find('.event-drawer').exists()).toBe(false)
  })

  it('emits update:open on backdrop click', async () => {
    const wrapper = mount(EventDrawer, { props: { open: true } })
    await wrapper.find('.event-drawer-backdrop').trigger('click')
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run web/src/__tests__/components/game/EventDrawer.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```vue
<!-- web/src/components/game/EventDrawer.vue -->
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
  width: 36px;
  height: 36px;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run web/src/__tests__/components/game/EventDrawer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/game/EventDrawer.vue web/src/__tests__/components/game/EventDrawer.test.ts
git commit -m "feat: add EventDrawer component for mobile sidebar replacement"
```

---

### Task 4: Create InfoSheet component (bottom sheet for info panel)

**Files:**
- Create: `web/src/components/game/InfoSheet.vue`
- Test: `web/src/__tests__/components/game/InfoSheet.test.ts`

**Interfaces:**
- Consumes: `uiStore.selectedTarget` (existing), `isMobile` from Task 1
- Produces: bottom sheet with drag-to-dismiss, wraps the same detail views as InfoPanelContainer

- [ ] **Step 1: Write the failing test**

```ts
// web/src/__tests__/components/game/InfoSheet.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import InfoSheet from '../../../components/game/InfoSheet.vue'

describe('InfoSheet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders when there is a selected target', () => {
    const wrapper = mount(InfoSheet, {
      props: { open: true },
      global: { stubs: ['AvatarDetailView', 'RegionDetailView', 'SectDetailView', 'POIDetailView'] }
    })
    expect(wrapper.find('.info-sheet').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = mount(InfoSheet, { props: { open: false } })
    expect(wrapper.find('.info-sheet').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run web/src/__tests__/components/game/InfoSheet.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```vue
<!-- web/src/components/game/InfoSheet.vue -->
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run web/src/__tests__/components/game/InfoSheet.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/game/InfoSheet.vue web/src/__tests__/components/game/InfoSheet.test.ts
git commit -m "feat: add InfoSheet bottom sheet component for mobile info panel"
```

---

### Task 5: Add touch support to useDockResize

**Files:**
- Modify: `web/src/composables/useDockResize.ts`
- Test: `web/src/__tests__/composables/useDockResize.test.ts` (create)

**Interfaces:**
- Consumes: existing `useDockResize` interface
- Produces: same interface, but `startResize` also handles `TouchEvent` (pointer events already work)

- [ ] **Step 1: Write the failing test**

```ts
// web/src/__tests__/composables/useDockResize.test.ts
import { describe, it, expect } from 'vitest'
import { useDockResize } from '../../composables/useDockResize'

describe('useDockResize', () => {
  it('initializes with given height', () => {
    const { dockHeight } = useDockResize(200, 100, 400, () => true)
    expect(dockHeight.value).toBe(200)
  })

  it('clamps to min/max on initialization', () => {
    const { dockHeight } = useDockResize(50, 100, 400, () => true)
    expect(dockHeight.value).toBe(100)
  })

  it('clamps to max', () => {
    const { dockHeight } = useDockResize(500, 100, 400, () => true)
    expect(dockHeight.value).toBe(400)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run web/src/__tests__/composables/useDockResize.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Enhance existing implementation**

The existing `useDockResize` uses `MouseEvent` in `startResize`. The `@mousedown` in the template already triggers this. Since we're using `@pointerdown` instead (which fires for both mouse and touch), the `MouseEvent` type will still work via pointer event compatibility. However, we need to handle `TouchEvent` for the drag handle gesture in the RoleplayDock.

The real change: in `RoleplayDock.vue`, change `@mousedown="startResize"` to `@pointerdown="startResize"` — pointer events handle both mouse and touch. The `e.clientY` property works the same way for both.

- [ ] **Step 4: Run tests**

Run: `npx vitest run web/src/__tests__/composables/useDockResize.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/composables/useDockResize.ts web/src/__tests__/composables/useDockResize.test.ts
git commit -m "feat: add pointer event support to useDockResize for touch compatibility"
```

---

### Task 6: Wire up responsive layout in App.vue

**Files:**
- Modify: `web/src/App.vue`
- Test: `web/src/__tests__/App.test.ts` (create, or update existing)

**Interfaces:**
- Consumes: `useBreakpoint` (Task 1), `EventDrawer` (Task 3), `InfoSheet` (Task 4)
- Produces: responsive root layout

- [ ] **Step 1: Read existing App test**

```bash
cat web/src/__tests__/components/StatusBar.test.ts
```

- [ ] **Step 2: Modify App.vue template**

Add imports at the top:
```ts
import { useBreakpoint } from './composables/useBreakpoint'
import EventDrawer from './components/game/EventDrawer.vue'
import InfoSheet from './components/game/InfoSheet.vue'

const { isMobile } = useBreakpoint()
const eventDrawerOpen = ref(false)
```

In the template, replace the sidebar section with conditional rendering:

```vue
<!-- Before: -->
<div class="main-content">
  <div class="map-container">...</div>
  <div class="sidebar-resizer" ...></div>
  <aside class="sidebar" ...>...</aside>
</div>

<!-- After: -->
<div class="main-content">
  <div class="map-container">
    ...
    <!-- Mobile: FAB button to open event drawer -->
    <button
      v-if="isMobile"
      class="event-fab"
      @click="eventDrawerOpen = true"
      aria-label="Open events"
    >
      <span class="event-fab-icon">📋</span>
    </button>
  </div>
  <!-- Desktop: sidebar resizer + sidebar -->
  <template v-if="!isMobile">
    <div class="sidebar-resizer" ...></div>
    <aside class="sidebar" ...>...</aside>
  </template>
</div>

<!-- Mobile: EventDrawer + InfoSheet -->
<EventDrawer v-if="isMobile" v-model:open="eventDrawerOpen" />
<InfoSheet v-if="isMobile" v-model:open="uiStore.selectedTarget !== null" />
```

Add responsive overrides for `isMobile`:
- On mobile: `.sidebar-resizer` and `.sidebar` should not render
- `.top-controls` buttons: increase to 48×48px
- `--cws-sidebar-width` should be 0 on mobile

In the script section, conditionally call `useSidebarResize` only when not mobile:
```ts
// Only initialize sidebar resize on desktop
const { sidebarWidth, isResizing, onResizerMouseDown } = !isMobile.value
  ? useSidebarResize()
  : { sidebarWidth: ref(0), isResizing: ref(false), onResizerMouseDown: () => {} }
```

Add FAB button styles:
```css
.event-fab {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #444;
  color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 30;
  font-size: 20px;
}

.event-fab:hover {
  background: rgba(32, 28, 20, 0.82);
  border-color: rgba(232, 202, 143, 0.56);
}

.event-fab:active {
  transform: scale(0.95);
}
```

- [ ] **Step 3: Update App.vue test**

```ts
// web/src/__tests__/App.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App, {
      global: {
        stubs: [
          'SplashLayer', 'GameCanvas', 'RoleplayDock',
          'InfoPanelContainer', 'StatusBar', 'EventPanel',
          'SystemMenu', 'LoadingOverlay', 'EventDrawer', 'InfoSheet'
        ]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run web/src/__tests__/App.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/App.vue web/src/__tests__/App.test.ts
git commit -m "feat: wire up responsive layout with EventDrawer and InfoSheet in App.vue"
```

---

### Task 7: Enhance RoleplayDock for touch

**Files:**
- Modify: `web/src/components/game/RoleplayDock.vue`
- Test: `web/src/__tests__/components/game/RoleplayDock.test.ts` (modify)

- [ ] **Step 1: Read existing RoleplayDock test**

```bash
cat web/src/__tests__/components/game/RoleplayDock.test.ts
```

- [ ] **Step 2: Add touch enhancements**

Change `@mousedown` to `@pointerdown` on the resize handle:
```vue
<div
  class="roleplay-dock__resize-handle"
  :class="{ 'is-resizing': isResizing }"
  @pointerdown="startResize"
></div>
```

Add larger touch targets for the submit/send button on mobile:
```vue
<!-- In the conversation view, wrap the send button with a class -->
<button
  class="roleplay-dock__send-btn"
  :class="{ 'roleplay-dock__send-btn--mobile': isMobile }"
  @click="handleSendConversation"
>
```

Add styles:
```css
@media (max-width: 1024px) {
  .roleplay-dock__send-btn--mobile {
    min-width: 44px;
    min-height: 44px;
  }
}
```

Import `useBreakpoint`:
```ts
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run web/src/__tests__/components/game/RoleplayDock.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/components/game/RoleplayDock.vue
git commit -m "feat: enhance RoleplayDock touch support with pointer events and larger targets"
```

---

### Task 8: Add responsive CSS utilities

**Files:**
- Modify: `web/src/style.css`

- [ ] **Step 1: Add responsive utility classes**

```css
/* Responsive utilities */
@media (max-width: 1024px) {
  /* Hide elements that should only show on desktop */
  .desktop-only {
    display: none !important;
  }

  /* Larger touch targets */
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }
}

@media (min-width: 1025px) {
  .mobile-only {
    display: none !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/style.css
git commit -m "feat: add responsive CSS utility classes for mobile layout"
```

---

### Task 9: Manual testing on mobile viewports

**Files:** none (manual testing)

- [ ] **Step 1: Start the dev server**

```bash
cd web && npm run dev
```

- [ ] **Step 2: Open in browser and test desktop layout (>1024px)**

Ensure nothing is broken on desktop:
- Sidebar is visible
- Info panel is positioned absolutely on the right
- StatusBar shows all widgets
- RoleplayDock works as before

- [ ] **Step 3: Test tablet layout (768-1024px)**

Open Chrome DevTools → Device Toolbar → Select iPad Pro or similar (834px width):
- StatusBar: only title + time + "⋮" button visible
- Sidebar: hidden, replaced by FAB button on the map
- Info panel: bottom sheet slides up when selecting an avatar/entity
- RoleplayDock: touch interactions work, larger buttons
- FAB opens the drawer, backdrop click closes it

- [ ] **Step 4: Test foldable layout (~700px)**

Same as above, verify:
- All panels fit on screen
- Touch targets are large enough
- Bottom sheet and drawer animations are smooth
- Map takes full width

- [ ] **Step 5: Fix any issues found during testing**

If issues are found, fix them and commit.

- [ ] **Step 6: Commit any final fixes**

```bash
git add -A
git commit -m "fix: address mobile responsive layout issues found during testing"
```