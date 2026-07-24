import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EventDrawer from '../../../components/game/EventDrawer.vue'

describe('EventDrawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders when open is true', () => {
    mount(EventDrawer, {
      props: { open: true },
      global: {
        stubs: { EventPanel: true },
      },
    })
    expect(document.body.querySelector('.event-drawer')).toBeTruthy()
    expect(document.body.querySelector('.event-drawer-backdrop')).toBeTruthy()
  })

  it('does not render when open is false', () => {
    mount(EventDrawer, {
      props: { open: false },
      global: {
        stubs: { EventPanel: true },
      },
    })
    expect(document.body.querySelector('.event-drawer')).toBeFalsy()
  })

  it('emits update:open on backdrop click', async () => {
    const wrapper = mount(EventDrawer, {
      props: { open: true },
      global: {
        stubs: { EventPanel: true },
      },
    })
    const backdrop = document.body.querySelector('.event-drawer-backdrop') as HTMLElement
    await backdrop.click()
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
  })
})