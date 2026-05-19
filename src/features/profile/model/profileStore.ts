import { useSyncExternalStore } from 'react'

export type AddressType = 'home' | 'work' | 'other'

export type SavedAddress = {
  id: string
  type: AddressType
  label: string
  city: string
  branch?: string
  street?: string
  recipient: string
  phone: string
  isDefault?: boolean
}

export type SavedCard = {
  id: string
  brand: 'visa' | 'mastercard' | 'amex'
  last4: string
  expiry: string // MM/YY
  cardholder?: string
  isDefault?: boolean
}

export type ProfileSettings = {
  theme: 'auto' | 'light' | 'dark'
  units: 'metric' | 'imperial'
  notifyEmail: boolean
  notifyPush: boolean
  notifySms: boolean
}

const DEFAULT_SETTINGS: ProfileSettings = {
  theme: 'auto',
  units: 'metric',
  notifyEmail: true,
  notifyPush: true,
  notifySms: false,
}

const KEY_ADDR = 'mp:addresses'
const KEY_CARDS = 'mp:cards'
const KEY_SETTINGS = 'mp:settings'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const listenersAddr = new Set<() => void>()
const listenersCards = new Set<() => void>()
const listenersSettings = new Set<() => void>()

let addressesState: SavedAddress[] = readJson<SavedAddress[]>(KEY_ADDR, seedAddresses())
let cardsState: SavedCard[] = readJson<SavedCard[]>(KEY_CARDS, seedCards())
let settingsState: ProfileSettings = readJson<ProfileSettings>(KEY_SETTINGS, DEFAULT_SETTINGS)

if (!readJson<SavedAddress[]>(KEY_ADDR, []).length) writeJson(KEY_ADDR, addressesState)
if (!readJson<SavedCard[]>(KEY_CARDS, []).length) writeJson(KEY_CARDS, cardsState)

function seedAddresses(): SavedAddress[] {
  return [
    {
      id: 'addr-1',
      type: 'home',
      label: 'Дім',
      city: 'Київ',
      branch: 'НП №47',
      recipient: 'Сергій Бельський',
      phone: '+380 67 123 45 67',
      isDefault: true,
    },
  ]
}

function seedCards(): SavedCard[] {
  return [
    {
      id: 'card-1',
      brand: 'visa',
      last4: '4242',
      expiry: '08/27',
      cardholder: 'S BELSKIY',
      isDefault: true,
    },
  ]
}

function notify(set: Set<() => void>) {
  for (const fn of set) fn()
}

export const profile = {
  // ── Addresses ─────────────────────────────────────────────
  getAddresses() { return addressesState },
  subscribeAddresses(cb: () => void) { listenersAddr.add(cb); return () => listenersAddr.delete(cb) },
  addAddress(a: Omit<SavedAddress, 'id'>) {
    const id = `addr-${Date.now()}`
    const isFirst = addressesState.length === 0
    addressesState = [...addressesState, { ...a, id, isDefault: a.isDefault || isFirst }]
    if (a.isDefault) addressesState = addressesState.map((x) => ({ ...x, isDefault: x.id === id }))
    writeJson(KEY_ADDR, addressesState)
    notify(listenersAddr)
  },
  updateAddress(id: string, patch: Partial<SavedAddress>) {
    addressesState = addressesState.map((a) => (a.id === id ? { ...a, ...patch } : a))
    if (patch.isDefault) {
      addressesState = addressesState.map((a) => ({ ...a, isDefault: a.id === id }))
    }
    writeJson(KEY_ADDR, addressesState)
    notify(listenersAddr)
  },
  deleteAddress(id: string) {
    const wasDefault = addressesState.find((a) => a.id === id)?.isDefault
    addressesState = addressesState.filter((a) => a.id !== id)
    if (wasDefault && addressesState[0]) {
      addressesState = addressesState.map((a, i) => ({ ...a, isDefault: i === 0 }))
    }
    writeJson(KEY_ADDR, addressesState)
    notify(listenersAddr)
  },

  // ── Cards ─────────────────────────────────────────────────
  getCards() { return cardsState },
  subscribeCards(cb: () => void) { listenersCards.add(cb); return () => listenersCards.delete(cb) },
  addCard(c: Omit<SavedCard, 'id'>) {
    const id = `card-${Date.now()}`
    const isFirst = cardsState.length === 0
    cardsState = [...cardsState, { ...c, id, isDefault: c.isDefault || isFirst }]
    if (c.isDefault) cardsState = cardsState.map((x) => ({ ...x, isDefault: x.id === id }))
    writeJson(KEY_CARDS, cardsState)
    notify(listenersCards)
  },
  deleteCard(id: string) {
    const wasDefault = cardsState.find((c) => c.id === id)?.isDefault
    cardsState = cardsState.filter((c) => c.id !== id)
    if (wasDefault && cardsState[0]) {
      cardsState = cardsState.map((c, i) => ({ ...c, isDefault: i === 0 }))
    }
    writeJson(KEY_CARDS, cardsState)
    notify(listenersCards)
  },

  // ── Settings ──────────────────────────────────────────────
  getSettings() { return settingsState },
  subscribeSettings(cb: () => void) { listenersSettings.add(cb); return () => listenersSettings.delete(cb) },
  setSettings(patch: Partial<ProfileSettings>) {
    settingsState = { ...settingsState, ...patch }
    writeJson(KEY_SETTINGS, settingsState)
    notify(listenersSettings)
  },
}

export function useAddresses() {
  return useSyncExternalStore(profile.subscribeAddresses, profile.getAddresses, profile.getAddresses)
}
export function useCards() {
  return useSyncExternalStore(profile.subscribeCards, profile.getCards, profile.getCards)
}
export function useSettings() {
  return useSyncExternalStore(profile.subscribeSettings, profile.getSettings, profile.getSettings)
}
