import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '@/stores/ui'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual as Record<string, unknown>,
    useI18n: () => ({ t: (key: string) => key }),
  }
})

import InfoSheet from '../../../components/game/InfoSheet.vue'

describe('InfoSheet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders when open is true', () => {
    const wrapper = mount(InfoSheet, {
      props: { open: true },
      global: {
        stubs: ['AvatarDetailView', 'RegionDetailView', 'SectDetailView', 'POIDetailView'],
      },
    })
    expect(document.body.querySelector('.info-sheet')).toBeTruthy()
  })

  it('does not render when open is false', () => {
    const wrapper = mount(InfoSheet, { props: { open: false } })
    expect(wrapper.find('.info-sheet').exists()).toBe(false)
  })

  it('emits update:open when close button is clicked', async () => {
    const wrapper = mount(InfoSheet, {
      props: { open: true },
      global: {
        stubs: ['AvatarDetailView', 'RegionDetailView', 'SectDetailView', 'POIDetailView'],
      },
    })
    const closeBtn = document.body.querySelector('.info-sheet-close') as HTMLElement
    expect(closeBtn).toBeTruthy()
    await closeBtn.click()
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
  })
})