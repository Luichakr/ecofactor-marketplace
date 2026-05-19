import { useSyncExternalStore } from 'react'

const KEY = 'mp:supportChat'

export type ChatMessage = {
  id: string
  from: 'user' | 'support'
  text: string
  at: string
}

let state: ChatMessage[] = load()
const listeners = new Set<() => void>()

function load(): ChatMessage[] {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      const s = seed()
      window.localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw) as ChatMessage[]
  } catch { return seed() }
}

function seed(): ChatMessage[] {
  return [
    {
      id: 'm0',
      from: 'support',
      text: 'Вітаємо! Підтримка ECOFACTOR на зв’язку — пишіть, що вам допомогти.',
      at: new Date().toISOString(),
    },
  ]
}

function persist() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  for (const fn of listeners) fn()
}

export const supportChat = {
  getAll() { return state },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  send(text: string, context?: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: 'user',
      text: context ? `[${context}] ${trimmed}` : trimmed,
      at: new Date().toISOString(),
    }
    state = [...state, userMsg]
    persist()
    // Auto-reply after small delay for demo realism.
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `m-${Date.now()}-r`,
        from: 'support',
        text: 'Ваше повідомлення прийнято. Менеджер відповість протягом 15 хвилин.',
        at: new Date().toISOString(),
      }
      state = [...state, reply]
      persist()
    }, 600)
  },
}

export function useSupportChat() {
  return useSyncExternalStore(supportChat.subscribe, supportChat.getAll, supportChat.getAll)
}
