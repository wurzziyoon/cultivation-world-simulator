# 统一滚动容器底部间距 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unified `padding-bottom` to all scroll containers and remove nested scrolling across 11+ components

**Architecture:** Each affected component gets `padding-bottom: 2em` (or equivalent) on its scroll container. Child components that previously had their own `overflow-y: auto` and `height: 100%` have these removed so the parent manages scrolling.

**Tech Stack:** Vue 3, CSS, scoped styles

## Global Constraints

- No functional changes — CSS only, except where `height: 100%` removal affects layout
- All 608 existing tests must pass after changes
- No data persistence changes

---

### Task 1: SystemMenuShell — 主滚动容器

**Files:**
- Modify: `web/src/components/SystemMenuShell.vue:207-228`

- [ ] **Step 1: Increase `.menu-content` padding-bottom**

```css
.menu-content {
  flex: 1;
  padding: 1.5em 1.5em 2em;
  overflow-y: auto;
  min-height: 0;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/SystemMenuShell.vue
git commit -m "fix: add bottom padding to system menu scroll container"
```

---

### Task 2: LLMConfigPanel — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/system/LLMConfigPanel.vue:107-110`

- [ ] **Step 1: Remove `overflow-y: auto` and `height: 100%`, add bottom padding**

```css
.llm-panel {
  padding: 0 0.8em 1em;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/system/LLMConfigPanel.vue
git commit -m "fix: remove nested scroll in LLMConfigPanel, add bottom padding"
```

---

### Task 3: SaveLoadPanel — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/system/SaveLoadPanel.vue:181-190`

- [ ] **Step 1: Remove `height: 100%`, add bottom padding to saves list**

```css
.save-panel, .load-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2em;
}

.saves-list {
  width: 100%;
  max-width: 50em;
  overflow-y: auto;
  flex: 1;
  padding-bottom: 0.5em;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/system/SaveLoadPanel.vue
git commit -m "fix: remove nested scroll in SaveLoadPanel, add bottom padding"
```

---

### Task 4: CreateAvatarPanel — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/system/CreateAvatarPanel.vue:147-166`

- [ ] **Step 1: Remove `height: 100%`**

```css
.create-panel {
  display: flex;
  flex-direction: column;
}

.create-layout {
  display: flex;
  gap: 1.5em;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/system/CreateAvatarPanel.vue
git commit -m "fix: remove nested scroll in CreateAvatarPanel"
```

---

### Task 5: InfoPanelContainer — 桌面详情面板底部间距

**Files:**
- Modify: `web/src/components/game/panels/info/InfoPanelContainer.vue:276-283`

- [ ] **Step 1: Add bottom padding to `.panel-body`**

```css
.panel-body {
  flex: 1;
  overflow: hidden;
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/info/InfoPanelContainer.vue
git commit -m "fix: add bottom padding to desktop info panel scroll container"
```

---

### Task 6: InfoSheet — 移动端详情面板底部间距

**Files:**
- Modify: `web/src/components/game/InfoSheet.vue:189-194`

- [ ] **Step 1: Add bottom padding**

```css
.info-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
  min-height: 0;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/InfoSheet.vue
git commit -m "fix: add bottom padding to mobile info sheet scroll container"
```

---

### Task 7: AvatarDetail — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/info/AvatarDetail.vue:268-275`

- [ ] **Step 1: Remove `overflow-y: auto`**

```css
.content-scroll {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/info/AvatarDetail.vue
git commit -m "fix: remove nested scroll in AvatarDetail"
```

---

### Task 8: RegionDetail — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/info/RegionDetail.vue:177-184`

- [ ] **Step 1: Remove `overflow-y: auto` and `height: 100%`**

```css
.region-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/info/RegionDetail.vue
git commit -m "fix: remove nested scroll in RegionDetail"
```

---

### Task 9: SectDetail — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/info/SectDetail.vue:197-204`

- [ ] **Step 1: Remove `overflow-y: auto`**

```css
.content-scroll {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/info/SectDetail.vue
git commit -m "fix: remove nested scroll in SectDetail"
```

---

### Task 10: POIDetail — 移除嵌套滚动

**Files:**
- Modify: `web/src/components/game/panels/info/POIDetail.vue:66-73`

- [ ] **Step 1: Remove `overflow: auto` and add bottom padding**

```css
.poi-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 0 4px 1em 0;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/game/panels/info/POIDetail.vue
git commit -m "fix: remove nested scroll in POIDetail, add bottom padding"
```

---

### Task 11: SplashLayer — 首页菜单可滚动

**Files:**
- Modify: `web/src/components/SplashLayer.vue:132-147`

- [ ] **Step 1: Make menu area scrollable, remove space-between**

```css
.glass-panel {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: clamp(360px, 42vw, 460px);
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: clamp(32px, 6vh, 72px) clamp(32px, 5vw, 60px);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.menu-area {
  width: 100%;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 1em;
}
```

- [ ] **Step 2: Run tests**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 3: Commit**

```bash
git add web/src/components/SplashLayer.vue
git commit -m "fix: make splash menu scrollable on short screens"
```

---

### Task 12: 最终验证

- [ ] **Step 1: Run full test suite**

Run: `cd web && npx vitest run --reporter verbose`
Expected: 608 passed

- [ ] **Step 2: Docker build test**

Run: `docker compose up -d --build`
Expected: Both containers healthy, frontend returns HTTP 200