/**
 * Tiny event bus for the bookmark "Збережено" toast. Decoupled from React
 * so any code (store, UI component) can trigger it with a single call.
 *
 *   import { showBookmarkToast } from '.../bookmarkToast'
 *   showBookmarkToast()
 *
 * A single <BookmarkToast/> instance mounted near app root listens and
 * renders the black bar.
 */

const listeners = new Set<() => void>()

export function showBookmarkToast(): void {
  listeners.forEach((l) => l())
}

export function subscribeBookmarkToast(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
