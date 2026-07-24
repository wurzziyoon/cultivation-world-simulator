import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, ref } from 'vue'

// Mock vue-i18n.
vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      locale: { value: 'zh-CN' },
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock useBreakpoint composable — desktop by default.
const mockIsMobile = vi.hoisted(() => ({ __v_isRef: true, value: false }))
vi.mock('@/composables/useBreakpoint', () => ({
  useBreakpoint: () => ({
    isMobile: mockIsMobile,
    isTablet: { __v_isRef: true, value: false },
    breakpoint: { __v_isRef: true, value: 'desktop' },
    width: { __v_isRef: true, value: 1200 },
  }),
}))

// Mock naive-ui providers.
vi.mock('naive-ui', () => {
  const makeSlotProvider = () => ({
    setup(_: any, { slots }: any) {
      return () => slots.default?.()
    },
  })
  return {
    NConfigProvider: makeSlotProvider(),
    NMessageProvider: makeSlotProvider(),
    NDialogProvider: makeSlotProvider(),
    darkTheme: {},
    createDiscreteApi: () => ({
      message: { info: () => {}, success: () => {}, error: () => {}, warning: () => {} },
      notification: { info: () => {}, success: () => {}, error: () => {}, warning: () => {} },
      dialog: { info: () => {}, success: () => {}, error: () => {}, warning: () => {} },
      loadingBar: { start: () => {}, finish: () => {}, error: () => {} },
    }),
  }
})

import App from '../App.vue'

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          SplashLayer: true,
          GameCanvas: true,
          RoleplayDock: true,
          InfoPanelContainer: true,
          StatusBar: true,
          EventPanel: true,
          SystemMenu: true,
          LoadingOverlay: true,
          EventDrawer: true,
          InfoSheet: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})