<script setup lang="ts">
import { useWorldStore } from '../../stores/world'
import { useSocketStore } from '../../stores/socket'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreakpoint } from '../../composables/useBreakpoint'
import StatusWidget from './StatusWidget.vue'
import StatusBarPanels from './StatusBarPanels.vue'
import { PHENOMENON_RARITY_COLORS, STATUS_BAR_COLORS } from '@/constants/uiColors'
import calendarIcon from '@/assets/icons/ui/lucide/calendar.svg'
import bookOpenIcon from '@/assets/icons/ui/lucide/book-open.svg'
import sparklesIcon from '@/assets/icons/ui/lucide/sparkles.svg'
import shieldIcon from '@/assets/icons/ui/lucide/shield.svg'
import trophyIcon from '@/assets/icons/ui/lucide/trophy.svg'
import swordsIcon from '@/assets/icons/ui/lucide/swords.svg'
import usersIcon from '@/assets/icons/ui/lucide/users.svg'
import landmarkIcon from '@/assets/icons/ui/lucide/landmark.svg'
import clock3Icon from '@/assets/icons/ui/lucide/clock-3.svg'
import scrollTextIcon from '@/assets/icons/ui/lucide/scroll-text.svg'

const { t, locale } = useI18n()
const { isMobile } = useBreakpoint()
const store = useWorldStore()
const socketStore = useSocketStore()
const panelsRef = ref<InstanceType<typeof StatusBarPanels> | null>(null)

type StatusBarPanelKey =
  | 'time'
  | 'worldInfo'
  | 'ranking'
  | 'tournament'
  | 'sectRelations'
  | 'mortalOverview'
  | 'dynastyOverview'
  | 'hiddenDomain'
  | 'phenomenonSelector'
  | 'avatarOverview'
  | 'worldSecret'

const phenomenonColor = computed(() => {
  const p = store.currentPhenomenon
  if (!p) return STATUS_BAR_COLORS.neutral
  return getRarityColor(p.rarity)
})

const domainLabel = computed(() => {
  return t('game.status_bar.hidden_domain.label')
})

const avatarOverviewLabel = computed(() => {
  return t('game.status_bar.avatar_overview.label')
})

const timeLabel = computed(() => {
  const yearPart = `${store.year}${t('common.year')}`
  const monthPart = `${store.month}${t('common.month')}`
  if (locale.value.startsWith('ja') || locale.value.startsWith('zh')) {
    return `${yearPart}${monthPart}`
  }
  return `${yearPart} ${monthPart}`
})

function getRarityColor(rarity: string) {
  return PHENOMENON_RARITY_COLORS[rarity] ?? STATUS_BAR_COLORS.neutral
}
async function openPhenomenonSelector() {
  await store.getPhenomenaList()
  void openPanel('phenomenonSelector')
}

function openPanel(panel: StatusBarPanelKey) {
  void panelsRef.value?.open(panel)
}

const showMoreMenu = ref(false)

	function handleMoreWidgetClick(e: MouseEvent) {
	  const dropdown = (e.currentTarget as HTMLElement).querySelector('.more-dropdown')
	  if (dropdown && !dropdown.contains(e.target as Node)) {
	    showMoreMenu.value = false
	  }
	}

interface MoreMenuItem {
  key: string
  label: string
  icon?: string
  action: () => void
}

const moreMenuItems = computed<MoreMenuItem[]>(() => {
  const items: MoreMenuItem[] = [
    { key: 'hiddenDomain', label: domainLabel.value, icon: shieldIcon, action: () => openPanel('hiddenDomain') },
    { key: 'sectRelations', label: t('game.sect_relations.title_short'), icon: shieldIcon, action: () => openPanel('sectRelations') },
    { key: 'dynastyOverview', label: t('game.dynasty.title_short'), icon: landmarkIcon, action: () => openPanel('dynastyOverview') },
    { key: 'mortalOverview', label: t('game.mortal_system.title_short'), icon: usersIcon, action: () => openPanel('mortalOverview') },
    { key: 'ranking', label: t('game.ranking.title_short'), icon: trophyIcon, action: () => openPanel('ranking') },
    { key: 'tournament', label: t('game.ranking.tournament_short'), icon: swordsIcon, action: () => openPanel('tournament') },
    { key: 'avatarOverview', label: avatarOverviewLabel.value, icon: clock3Icon, action: () => openPanel('avatarOverview') },
    { key: 'worldSecret', label: t('game.status_bar.world_secret.label'), icon: scrollTextIcon, action: () => openPanel('worldSecret') },
    { key: 'worldInfo', label: t('game.status_bar.world_info.label'), icon: bookOpenIcon, action: () => openPanel('worldInfo') },
  ]

  if (store.currentPhenomenon) {
    items.unshift({
      key: 'phenomenon',
      label: `[${store.currentPhenomenon.name}]`,
      icon: sparklesIcon,
      action: () => openPhenomenonSelector(),
    })
  }

  return items
})
</script>

<template>
  <header class="top-bar">
    <div class="left">
      <span class="title">{{ t('splash.title') }}</span>
      <span class="status-dot" :class="{ connected: socketStore.isConnected }"></span>
    </div>
    <div class="center">
      <StatusWidget
        :label="timeLabel"
        :icon="calendarIcon"
        :color="STATUS_BAR_COLORS.time"
        :disable-popover="true"
        @trigger-click="openPanel('time')"
      />

      <template v-if="!isMobile">
        <StatusWidget
          v-if="store.currentPhenomenon"
          :label="`[${store.currentPhenomenon.name}]`"
          :icon="sparklesIcon"
          :color="phenomenonColor"
          :disable-popover="true"
          @trigger-click="openPhenomenonSelector"
        />

        <StatusWidget
          :label="domainLabel"
          :icon="shieldIcon"
          :color="STATUS_BAR_COLORS.hiddenDomain"
          :disable-popover="true"
          @trigger-click="openPanel('hiddenDomain')"
        />

        <StatusWidget
          :label="t('game.sect_relations.title_short')"
          :icon="shieldIcon"
          :color="STATUS_BAR_COLORS.sectRelations"
          :disable-popover="true"
          @trigger-click="openPanel('sectRelations')"
        />

        <StatusWidget
          :label="t('game.dynasty.title_short')"
          :icon="landmarkIcon"
          :color="STATUS_BAR_COLORS.dynasty"
          :disable-popover="true"
          @trigger-click="openPanel('dynastyOverview')"
        />

        <StatusWidget
          :label="t('game.mortal_system.title_short')"
          :icon="usersIcon"
          :color="STATUS_BAR_COLORS.mortal"
          :disable-popover="true"
          @trigger-click="openPanel('mortalOverview')"
        />

        <StatusWidget
          :label="t('game.ranking.title_short')"
          :icon="trophyIcon"
          :color="STATUS_BAR_COLORS.ranking"
          :disable-popover="true"
          @trigger-click="openPanel('ranking')"
        />

        <StatusWidget
          :label="t('game.ranking.tournament_short')"
          :icon="swordsIcon"
          :color="STATUS_BAR_COLORS.tournament"
          :disable-popover="true"
          @trigger-click="openPanel('tournament')"
        />

        <StatusWidget
          :label="avatarOverviewLabel"
          :icon="clock3Icon"
          :color="STATUS_BAR_COLORS.neutral"
          :disable-popover="true"
          @trigger-click="openPanel('avatarOverview')"
        />

        <StatusWidget
          :label="t('game.status_bar.world_secret.label')"
          :icon="scrollTextIcon"
          :color="STATUS_BAR_COLORS.worldSecret"
          :disable-popover="true"
          @trigger-click="openPanel('worldSecret')"
        />

        <StatusWidget
          :label="t('game.status_bar.world_info.label')"
          :icon="bookOpenIcon"
          :color="STATUS_BAR_COLORS.worldInfo"
          :disable-popover="true"
          @trigger-click="openPanel('worldInfo')"
        />
      </template>

      <div v-if="isMobile" class="more-widget" @click="handleMoreWidgetClick">
        <span class="divider">|</span>
        <span class="widget-trigger more-trigger" @click.stop="showMoreMenu = !showMoreMenu" title="More">
          <span class="widget-label">⋮</span>
        </span>
        <div v-if="showMoreMenu" class="more-dropdown" @click.stop>
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
    </div>

    <StatusBarPanels ref="panelsRef" />

    <div class="author">
      <a
        class="author-link"
        href="https://github.com/4thfever/cultivation-world-simulator"
        target="_blank"
        rel="noopener"
      >
        {{ t('game.status_bar.author_github') }}
      </a>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  height: 36px;
  background:
    linear-gradient(180deg, rgba(34, 34, 34, 0.98), rgba(22, 22, 22, 0.98)),
    linear-gradient(90deg, rgba(120, 182, 255, 0.08), rgba(227, 179, 65, 0.04) 38%, rgba(95, 191, 122, 0.06) 100%);
  border-bottom: 1px solid #2f2f2f;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 14px;
  z-index: 10;
  gap: 16px;
  min-width: 0;
}

.top-bar .title {
  font-weight: bold;
  margin-right: 8px;
  color: #e8dcc0;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.center {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.center::-webkit-scrollbar {
  display: none;
}

.center :deep(.status-widget) {
  flex: 0 0 auto;
}

.left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 0 1 auto;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff4d4f;
}

.status-dot.connected {
  background: #52c41a;
}

.author {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  color: #bbb;
  display: none; /* 暂时隐藏，因为空间可能不够 */
}

@media (min-width: 1024px) {
  .author {
    display: flex;
  }
}

.author-link {
  color: #4dabf7;
  text-decoration: none;
}

.author-link:hover {
  color: #8bc6ff;
  text-decoration: underline;
}

.more-widget {
  position: relative;
}

.more-trigger {
  font-size: 20px;
  letter-spacing: 0;
  padding: 0 8px;
  min-height: 44px;
  min-width: 44px;
  justify-content: center;
  display: flex;
  align-items: center;
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
  padding: 15px 12px;
  line-height: 14px;
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
</style>
