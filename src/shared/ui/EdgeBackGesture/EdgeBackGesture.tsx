import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * iOS/Android-style "swipe from the left edge to go back" gesture.
 *
 * In a WebView the OS back-swipe doesn't drive an SPA's router, so we
 * implement it: a touch that starts within EDGE px of the left edge and
 * drags right past THRESHOLD (mostly horizontal) navigates one step back —
 * but only when there's in-app history to pop (idx > 0), mirroring useGoBack.
 *
 * Renders nothing; mount once near the app root.
 */
const EDGE = 22 // px from the left edge where the gesture can start
const THRESHOLD = 70 // px of rightward travel to commit
const MAX_OFF_AXIS = 60 // px of vertical drift before we treat it as a scroll
const MAX_MS = 700 // gesture must complete within this window

export function EdgeBackGesture() {
  const navigate = useNavigate()

  useEffect(() => {
    let active = false
    let startX = 0
    let startY = 0
    let startT = 0

    function onStart(e: TouchEvent) {
      const t = e.touches[0]
      if (!t) return
      active = t.clientX <= EDGE
      startX = t.clientX
      startY = t.clientY
      startT = Date.now()
    }

    function onMove(e: TouchEvent) {
      if (!active) return
      const t = e.touches[0]
      if (!t) return
      const dx = t.clientX - startX
      const dy = Math.abs(t.clientY - startY)
      // A clearly vertical move is a scroll, not a back-swipe.
      if (dy > MAX_OFF_AXIS && dy > Math.abs(dx)) active = false
    }

    function onEnd(e: TouchEvent) {
      if (!active) return
      active = false
      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - startX
      const dy = Math.abs(t.clientY - startY)
      const dt = Date.now() - startT
      if (dx > THRESHOLD && dy < MAX_OFF_AXIS && dt < MAX_MS) {
        const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
        if (idx > 0) navigate(-1)
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [navigate])

  return null
}
