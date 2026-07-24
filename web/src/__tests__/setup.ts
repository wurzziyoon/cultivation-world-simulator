import { vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// jsdom does not provide PointerEvent; polyfill it as a subclass of MouseEvent.
if (typeof globalThis.PointerEvent === 'undefined') {
  // @ts-expect-error - minimal polyfill for test environment
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init)
    }
  }
}

// Use fake timers globally for consistent async testing.
vi.useFakeTimers()

const originalConsoleError = console.error.bind(console)
const originalConsoleWarn = console.warn.bind(console)

function stringifyConsoleArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg
      if (arg instanceof Error) return arg.message
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    })
    .join(' ')
}

function shouldSilenceConsole(args: unknown[]): boolean {
  const text = stringifyConsoleArgs(args)
  return (
    text.includes('[SystemStore toggle pause]') ||
    text.includes('[MapStore preload map]') ||
    text.includes('[SocketRouter llm config required]')
  )
}

// Setup fresh Pinia instance for each test.
beforeEach(() => {
  setActivePinia(createPinia())
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    if (shouldSilenceConsole(args)) return
    originalConsoleError(...args)
  })
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    if (shouldSilenceConsole(args)) return
    originalConsoleWarn(...args)
  })
})

// Cleanup after each test.
afterEach(() => {
  vi.restoreAllMocks()
})
