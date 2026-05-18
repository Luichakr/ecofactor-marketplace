import { useEffect, useRef, useState, type ReactNode } from 'react'
import './StickyCTA.css'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Pinned action bar above the bottom nav. Renders a fixed-position strip
 * plus an equal-height spacer in the document flow so page content can
 * scroll above the bar rather than under it. Spacer height tracks the
 * real bar via ResizeObserver.
 */
export function StickyCTA({ children, className = '' }: Props) {
  const barRef = useRef<HTMLDivElement | null>(null)
  const [spacerHeight, setSpacerHeight] = useState<number>(168)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    setSpacerHeight(el.offsetHeight)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setSpacerHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <div className="sticky-cta-spacer" style={{ height: spacerHeight }} aria-hidden="true" />
      <div ref={barRef} className={`sticky-cta ${className}`}>
        {children}
      </div>
    </>
  )
}
