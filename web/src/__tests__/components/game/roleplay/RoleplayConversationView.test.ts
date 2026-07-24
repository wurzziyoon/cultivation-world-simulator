import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import RoleplayConversationView from '@/components/game/roleplay/RoleplayConversationView.vue'

const { useBreakpointMock } = vi.hoisted(() => ({
  useBreakpointMock: { isMobile: false },
}))

vi.mock('@/composables/useBreakpoint', () => ({
  useBreakpoint: () => useBreakpointMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('RoleplayConversationView mobile send button', () => {
  it('adds roleplay-dock__send-btn--mobile class when isMobile is true', () => {
    useBreakpointMock.isMobile = true
    const wrapper = mount(RoleplayConversationView, {
      props: {
        avatarName: '闻人雾',
        targetName: '阴长生',
        description: 'description',
        caption: 'caption',
        modelValue: 'test message',
        messages: [],
        errorText: '',
        isSubmitting: false,
        submitText: '发送',
      },
    })
    const sendButton = wrapper.find('.roleplay-dock__conversation-actions .roleplay-dock__submit')
    expect(sendButton.classes()).toContain('roleplay-dock__send-btn--mobile')
  })

  it('does not add roleplay-dock__send-btn--mobile class when isMobile is false', () => {
    useBreakpointMock.isMobile = false
    const wrapper = mount(RoleplayConversationView, {
      props: {
        avatarName: '闻人雾',
        targetName: '阴长生',
        description: 'description',
        caption: 'caption',
        modelValue: 'test message',
        messages: [],
        errorText: '',
        isSubmitting: false,
        submitText: '发送',
      },
    })
    const sendButton = wrapper.find('.roleplay-dock__conversation-actions .roleplay-dock__submit')
    expect(sendButton.classes()).not.toContain('roleplay-dock__send-btn--mobile')
  })
})