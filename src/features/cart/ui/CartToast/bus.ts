/**
 * Tiny event bus for the "Додано до кошику" push toast (top of screen).
 * Decoupled from React so any add-to-cart call site can trigger it:
 *
 *   import { showCartToast } from '.../CartToast/bus'
 *   showCartToast({ title, image })
 *
 * A single <CartToast/> mounted near app root listens and renders the card.
 */
export type CartToastPayload = {
  title: string
  image?: string
}

const listeners = new Set<(p: CartToastPayload) => void>()

export function showCartToast(payload: CartToastPayload): void {
  listeners.forEach((l) => l(payload))
}

export function subscribeCartToast(l: (p: CartToastPayload) => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
