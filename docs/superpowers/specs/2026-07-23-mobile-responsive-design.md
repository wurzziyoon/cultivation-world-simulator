# Mobile Experience Enhancement for Foldable & Tablet Devices

**Date**: 2026-07-23
**Status**: Approved
**Target Devices**: Foldable phones (700-900px width), Tablets (768-1024px width)
**Breakpoint**: `1024px` (switch to mobile layout)

## Overview

Current desktop layout uses a three-column horizontal structure (Map + Sidebar + InfoPanel) that cannot fit on foldable or tablet screens. This spec adapts the layout for mobile while preserving the full desktop experience at larger viewports.

## 1. Layout Architecture

### Desktop (>1024px)
```
┌─────────────────────────────────────────────────┐
│  StatusBar (36px)                               │
├──────────────────────────────┬──────────────────┤
│                              │                  │
│  Map (flex:1) + InfoPanel    │  Sidebar(400px)  │
│  + RoleplayDock              │  EventPanel      │
│                              │                  │
├──────────────────────────────┴──────────────────┤
│  RoleplayDock (底部)                            │
└─────────────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌─────────────────────────────────────┐
│  StatusBar (精简)                    │
├─────────────────────────────────────┤
│                                     │
│  Map (flex:1, 全宽)                 │
│  + InfoPanel → 底部 Sheet          │
│  [+ 浮动按钮: 打开事件抽屉]         │
│                                     │
├─────────────────────────────────────┤
│  RoleplayDock (底部 Sheet)          │
└─────────────────────────────────────┘
```

### Key Changes
- **Sidebar** → hidden, replaced by a floating button that opens a right-side drawer
- **InfoPanel** → from absolute-positioned overlay to bottom sheet
- **StatusBar** → shows only core info, rest collapsed into a "more" menu
- **Map** → full width, takes the space previously split with sidebar

## 2. EventPanel Sidebar → Drawer

### Behavior
- On mobile, the sidebar (`<aside class="sidebar">`) is hidden via `display: none`
- A floating action button (FAB) appears on the map area at `bottom: 20px; right: 20px`
- Tapping the FAB opens a drawer from the right edge
- The drawer has a semi-transparent backdrop overlay
- Tapping the backdrop or close button dismisses the drawer

### Drawer Specs
- Width: `min(85vw, 400px)`
- Height: 100vh (minus status bar)
- Slide-in animation: `translateX(100%) → translateX(0)`, 200ms ease
- Backdrop: `rgba(0, 0, 0, 0.5)`, backdrop-filter: `blur(2px)`
- Touch: swipe right-to-left to close, event list scrollable
- Content: same EventPanel component, no changes needed

### FAB Specs
- Size: 48×48px (touch-friendly)
- Icon: event list icon
- Background: `rgba(0, 0, 0, 0.6)` with border
- Z-index: above map, below info panel
- Hidden when drawer is open

## 3. InfoPanel → Bottom Sheet

### Behavior
- When a target is selected, the InfoPanel slides up from the bottom
- A drag handle (═══) at the top allows swipe-down dismissal
- Tapping outside the sheet closes it
- Sheet overlays on top of the RoleplayDock

### Bottom Sheet Specs
- Width: 100% (full width)
- Max height: `60vh`
- Initial height: `min(40vh, max-content)`
- Border radius: `12px 12px 0 0`
- Background: `var(--panel-bg)`
- Drag handle: centered, 40×4px, `border-radius: 2px`, `background: #555`
- Slide animation: `translateY(100%) → translateY(0)`, 250ms ease
- Content is scrollable internally

### CSS/Structural Changes
- `InfoPanelContainer.vue`: remove `position: absolute; right: 20px; top: 60px; bottom: 16px; width: ...`
- On mobile: `position: fixed; bottom: 0; left: 0; right: 0; z-index: 60`
- Add drag-to-dismiss gesture handling
- On tablet, consider wider sheet with left/right padding

## 4. StatusBar → Responsive

### Behavior
- At <1024px, only essential widgets remain visible:
  - Game title + connection status dot
  - Time display (always visible)
- A "more" button (`⋮`) opens a dropdown containing all other widgets:
  - Current phenomenon, Hidden Domain, Sect Relations, Dynasty
  - Mortal System, Ranking, Tournament, Avatar Overview
  - World Secret, World Info

### Implementation
- StatusWidget items in the `.center` div are conditionally rendered via `v-if` or CSS `display: none`
- The "more" dropdown is a simple popover with clickable items
- Each item in the dropdown triggers the same panel-open action
- Touch targets: minimum 44×44px

## 5. RoleplayDock → Enhanced

### Existing
- Already collapses to 1-column grid at 900px
- Has resize handle, collapse toggle, and height persistence

### Mobile Enhancements
- Add visual drag handle at top (already has resize handle, enhance for touch)
- Keyboard-avoiding: when text input is focused, the dock should remain visible above the keyboard
- Larger touch targets: send button → 44×44px minimum
- Touch scrolling: interaction history scrolls naturally with touch
- Consider adding swipe-down to collapse gesture

## 6. Map Touch Interactions

### Pixi.js Viewport
- Verify `Viewport.vue` already supports pinch-to-zoom
- If not, add `pinch` and `wheel` options to the Pixi.js Viewport plugin
- Ensure `pointerdown` events work for touch (they already do in Pixi.js)

### Touch Targets
- Top control buttons: increase from 40px to 48px on mobile
- Ensure 8px minimum spacing between touch targets
- All interactive elements must have `cursor: pointer` or appropriate touch feedback

## 7. Files to Modify

| File | Changes |
|------|---------|
| `web/src/App.vue` | Add responsive layout logic, conditionally show sidebar/drawer, FAB button |
| `web/src/components/game/panels/EventPanel.vue` | Create drawer wrapper, add close button for mobile |
| `web/src/components/game/panels/info/InfoPanelContainer.vue` | Convert to bottom sheet on mobile, add drag handle, swipe-to-dismiss |
| `web/src/components/layout/StatusBar.vue` | Add responsive collapse for widgets, "more" dropdown |
| `web/src/components/game/RoleplayDock.vue` | Add touch enhancements, keyboard-avoiding behavior |
| `web/src/components/game/GameCanvas.vue` | Add pinch-to-zoom support check, larger touch targets |
| `web/src/style.css` | Add global responsive utilities |

## 8. Non-Goals

- Small phone support (<700px) — out of scope
- PWA/service worker — not needed
- Offline support — not needed
- Desktop layout changes — desktop experience is preserved exactly
- Performance optimization for mobile rendering — only layout changes