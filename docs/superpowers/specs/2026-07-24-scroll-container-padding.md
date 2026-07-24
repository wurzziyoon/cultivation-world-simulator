# 统一滚动容器底部间距规范

## 问题

屏幕高度不足时，多个面板的最后一个元素被裁切或紧贴滚动容器底部，无法正常查看和交互。涉及首页 splash、系统菜单各 tab、详情面板（桌面 + 移动端）共 10+ 个组件。

## 根因

没有统一的滚动容器规范。每个组件各自设置 `overflow-y: auto`，padding 值不统一，导致：

1. 嵌套滚动 — 父级滚动容器与子级滚动容器同时存在，子级的底部 padding 不生效
2. 最后一个元素紧贴容器底部 — 滚动容器缺少 `padding-bottom`
3. 首页 splash 菜单区域完全不可滚动

## 统一规则

**每个滚动容器在底部增加 `padding-bottom: 2em`，确保最后一个元素有呼吸空间。**

## 改动清单

### 1. 系统菜单 — SystemMenuShell.vue

- `.menu-content`: `padding` 从 `1.5em` 改为 `1.5em 1.5em 2em`（增加底部 padding）
- 移除 `LLMConfigPanel > .llm-panel` 的 `overflow-y: auto` 和 `height: 100%`
- 移除 `SaveLoadPanel > .save-panel / .load-panel` 的 `height: 100%`
- 移除 `CreateAvatarPanel > .create-panel` 的 `height: 100%`

### 2. LLM 配置面板 — LLMConfigPanel.vue

- `.llm-panel`: 移除 `overflow-y: auto` 和 `height: 100%`
- 改为 `padding: 0 0.8em 1em`

### 3. 存档面板 — SaveLoadPanel.vue

- `.save-panel, .load-panel`: 移除 `height: 100%`
- `.saves-list`: 增加 `padding-bottom: 0.5em`

### 4. 创建角色面板 — CreateAvatarPanel.vue

- `.create-panel`: 移除 `height: 100%`
- `.create-layout`: 移除 `height: 100%`

### 5. 详情面板（桌面）— InfoPanelContainer.vue

- `.panel-body`: `padding` 从 `16px` 改为 `16px 16px 24px`
- `.content-wrapper`: 移除 `overflow: hidden`

### 6. 详情面板（移动端）— InfoSheet.vue

- `.info-sheet-body`: 增加 `padding-bottom: 24px`

### 7. 角色详情 — AvatarDetail.vue

- `.content-scroll`: 移除 `overflow-y: auto`

### 8. 地区详情 — RegionDetail.vue

- 移除 `overflow-y: auto` 和 `height: 100%`

### 9. 宗门详情 — SectDetail.vue

- `.content-scroll`: 移除 `overflow-y: auto`

### 10. POI 详情 — POIDetail.vue

- 移除 `overflow: auto` 和 `height: 100%`

### 11. 首页 splash — SplashLayer.vue

- `.glass-panel`: `justify-content` 从 `space-between` 改为 `flex-start`
- `.menu-area`: 增加 `overflow-y: auto` 和 `flex: 1`
- 增加底部 padding

## 不受影响的组件

独立 Modal（DeceasedModal, AvatarOverviewModal, RankingModal 等）不嵌套在其他滚动容器内，无需修改。