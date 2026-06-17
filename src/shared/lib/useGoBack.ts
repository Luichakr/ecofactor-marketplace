import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Back handler that goes to the *real* previous in-app entry when one exists,
 * and to a logical fallback route otherwise.
 *
 * Why not plain `navigate(-1)`: when the history stack is shallow — a deep
 * link, the first screen of a fresh WebView session, or an entry that was
 * `replace`d (e.g. the GitHub Pages 404 SPA redirect) — `navigate(-1)` has
 * nowhere to go and the browser drops the user on the app root ("back jumps
 * to home"). React Router stores a monotonic `idx` on `history.state`; idx 0
 * means there is no in-app step behind us, so we route to `fallback` instead.
 */
export function useGoBack(fallback = '/marketplace') {
  const navigate = useNavigate()
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [navigate, fallback])
}
