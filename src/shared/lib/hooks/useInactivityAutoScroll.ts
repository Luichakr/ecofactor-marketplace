import { useEffect } from 'react'

type Options = {
  /** Scroll container element. If null/undefined the hook is a no-op. */
  scroller: HTMLElement | null | undefined
  /** Selector for slide elements used to measure step size. */
  slideSelector: string
  /** Scroll axis. Default "y". */
  axis?: 'x' | 'y'
  /** Inactivity threshold in ms before auto-scroll kicks in. Default 60_000 (1 min). */
  inactivityMs?: number
  /** Interval between auto-scroll steps in ms. Default 3_000. */
  advanceMs?: number
  /** Enable / disable. Default true. */
  enabled?: boolean
}

/**
 * After a period of user inactivity, auto-advances a scroll container one
 * slide at a time. Resets on touch / wheel / keyboard / scroll interaction.
 * Loops back to start after the last slide.
 */
export function useInactivityAutoScroll({
  scroller,
  slideSelector,
  axis = 'y',
  inactivityMs = 60_000,
  advanceMs = 3_000,
  enabled = true,
}: Options): void {
  useEffect(() => {
    if (!enabled || !scroller) return

    let inactivityTimer: number | undefined
    let advanceTimer: number | undefined
    let isAutoScrolling = false

    function getStep(): number {
      const first = scroller!.querySelector(slideSelector) as HTMLElement | null
      if (!first) return 0
      if (axis === 'y') return first.offsetHeight
      const styles = getComputedStyle(scroller!)
      const gap = parseFloat(styles.columnGap || styles.gap || '0')
      return first.offsetWidth + gap
    }

    function advance() {
      const step = getStep()
      if (!step) return
      isAutoScrolling = true
      if (axis === 'y') {
        const maxScroll = scroller!.scrollHeight - scroller!.clientHeight
        const next = scroller!.scrollTop + step
        scroller!.scrollTo({ top: next > maxScroll - 4 ? 0 : next, behavior: 'smooth' })
      } else {
        const maxScroll = scroller!.scrollWidth - scroller!.clientWidth
        const next = scroller!.scrollLeft + step
        scroller!.scrollTo({ left: next > maxScroll - 4 ? 0 : next, behavior: 'smooth' })
      }
      window.setTimeout(() => {
        isAutoScrolling = false
      }, 700)
    }

    function startAutoScroll() {
      if (advanceTimer) return
      advanceTimer = window.setInterval(advance, advanceMs)
    }

    function stopAutoScroll() {
      if (advanceTimer) {
        window.clearInterval(advanceTimer)
        advanceTimer = undefined
      }
    }

    function resetInactivity() {
      stopAutoScroll()
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      inactivityTimer = window.setTimeout(startAutoScroll, inactivityMs)
    }

    function onUserInteract() {
      if (isAutoScrolling) return
      resetInactivity()
    }

    const target = scroller
    target.addEventListener('pointerdown', onUserInteract)
    target.addEventListener('touchstart', onUserInteract, { passive: true })
    target.addEventListener('wheel', onUserInteract, { passive: true })
    target.addEventListener('keydown', onUserInteract)
    target.addEventListener('scroll', onUserInteract, { passive: true })

    resetInactivity()

    return () => {
      stopAutoScroll()
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      target.removeEventListener('pointerdown', onUserInteract)
      target.removeEventListener('touchstart', onUserInteract)
      target.removeEventListener('wheel', onUserInteract)
      target.removeEventListener('keydown', onUserInteract)
      target.removeEventListener('scroll', onUserInteract)
    }
  }, [scroller, slideSelector, axis, inactivityMs, advanceMs, enabled])
}
