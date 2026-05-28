import { useEffect, useRef, useState } from 'react'
import { SponsoredSlot } from '../SponsoredSlot/SponsoredSlot'
import { SPONSORED_CARDS } from '../../../../data/sponsored'
import './SponsoredCarousel.css'

const AUTO_ADVANCE_MS = 5000
const USER_PAUSE_MS = 8000 // resume auto-advance N ms after manual swipe

/**
 * Horizontal sponsored carousel — paged with scroll-snap so the user can
 * swipe freely between ads, and a timer auto-advances every 5 seconds.
 * Each slide is ~94% of the rail width, leaving a ~3% peek of the prev
 * and next ad on either side (Yandex Market pattern).
 *
 * Auto-advance pauses for a few seconds after any user gesture so the
 * carousel doesn't fight the finger.
 */
export function SponsoredCarousel() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)
  // Timestamp of the last user gesture — the auto-advance interval
  // skips ticks while we're still inside the cool-down window.
  const lastTouchAt = useRef<number>(0)

  // Sync active dot with whichever slide is currently snapped.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let raf = 0
    function update() {
      if (!rail) return
      const slideWidth = rail.clientWidth * 0.94
      const idx = Math.round(rail.scrollLeft / slideWidth)
      setActive(Math.max(0, Math.min(SPONSORED_CARDS.length - 1, idx)))
    }
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    function onTouch() {
      lastTouchAt.current = Date.now()
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    rail.addEventListener('pointerdown', onTouch, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      rail.removeEventListener('scroll', onScroll)
      rail.removeEventListener('pointerdown', onTouch)
    }
  }, [])

  // Auto-advance: every 5s, scroll to the next slide. Wraps around.
  // Skipped while the user has been interacting in the last 8s.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || SPONSORED_CARDS.length <= 1) return
    const tick = window.setInterval(() => {
      if (Date.now() - lastTouchAt.current < USER_PAUSE_MS) return
      const slideWidth = rail.clientWidth * 0.94
      const total = SPONSORED_CARDS.length
      const current = Math.round(rail.scrollLeft / slideWidth)
      const next = (current + 1) % total
      rail.scrollTo({ left: next * slideWidth, behavior: 'smooth' })
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(tick)
  }, [])

  if (SPONSORED_CARDS.length === 0) return null

  return (
    <div className="sponsored-carousel">
      <div className="sponsored-carousel__rail" ref={railRef}>
        {/* Leading spacer matches the trailing peek width so slide 0
            centers with equal 3% padding on the left. */}
        <div className="sponsored-carousel__spacer" aria-hidden="true" />
        {SPONSORED_CARDS.map((card) => (
          <div key={card.id} className="sponsored-carousel__slide">
            <SponsoredSlot card={card} />
          </div>
        ))}
        <div className="sponsored-carousel__spacer" aria-hidden="true" />
      </div>
      <div className="sponsored-carousel__dots" aria-hidden="true">
        {SPONSORED_CARDS.map((_, i) => (
          <span
            key={i}
            className={`sponsored-carousel__dot ${i === active ? 'sponsored-carousel__dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
