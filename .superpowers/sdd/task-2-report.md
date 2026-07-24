# Task 2 Report: Make StatusBar responsive

## Status: DONE

## Commits
- `11fd6474` - feat: make StatusBar responsive with collapsible widget menu

## Files Modified
- `web/src/components/layout/StatusBar.vue` — Added responsive logic with `useBreakpoint` composable, `moreMenuItems` computed, and mobile dropdown UI
- `web/src/__tests__/components/StatusBar.test.ts` — Added `useBreakpoint` mock and 3 mobile test cases

## Test Results
- PASS: All 29 tests (26 existing + 3 new mobile tests)
- No regressions in existing tests

## Details
- **StatusBar.vue** changes:
  - Imported `useBreakpoint` from the composable (`isMobile` ref)
  - Wrapped all non-time `StatusWidget` items in `<template v-if="!isMobile">`
  - Added mobile dropdown with `<div v-if="isMobile" class="more-widget">`
  - `moreMenuItems` computed includes all 10 non-time widgets (phenomenon, hiddenDomain, sectRelations, dynasty, mortalOverview, ranking, tournament, avatarOverview, worldSecret, worldInfo) with their labels, icons, and actions
  - Added dropdown styles (positioned, dark-themed, hover effects, mask-image icons)

- **Test changes**:
  - Added `mockIsMobile` ref-like object via `vi.hoisted` (with `__v_isRef: true` for Vue template auto-unwrapping)
  - Added `vi.mock('@/composables/useBreakpoint')` returning the mock refs
  - Reset `mockIsMobile.value = false` in `beforeEach`
  - 3 new mobile tests: verifies widget collapse, dropdown open/close, and dropdown contents

## Concerns
- The `useBreakpoint` composable uses `onMounted`/`onUnmounted` which are not triggered in the test environment (mount uses stubs). The mock handles this by returning a plain ref-like object. This is acceptable since the composable is tested separately.

## Update: Touch target & click-outside fix (2026-07-24)

### Changes
- **`.more-dropdown-item`**: Increased vertical padding from `8px` to `13px` (`padding: 13px 12px`) to meet 44px minimum touch target height
- **`.more-trigger`**: Added `min-height: 44px; display: flex; align-items: center;` for 44px minimum touch target
- **Click-outside handler**: Added `handleMoreWidgetClick` function that closes the dropdown when clicking on the `.more-widget` wrapper but outside the dropdown. Uses `@click.stop` on the trigger and dropdown to prevent unwanted toggle/close interactions.
- **Test updated**: The click-outside test now clicks `.more-widget` (outside dropdown) instead of clicking the dropdown itself.

### Test Results
- PASS: All 29 tests still pass

## Update: Touch target size re-review fixes (2026-07-24)

### Changes
- **`.more-trigger`**: Added `min-width: 44px; justify-content: center;` so the "more" button (vertical dots) is a full 44x44px touch target, not just 44px tall.
- **`.more-dropdown-item`**: Changed from `padding: 13px 12px` (with default `line-height: normal` giving ~41.6px total) to `padding: 15px 12px; line-height: 14px;` for exactly 44px per item.

### Test Results
- PASS: All 29 tests still pass