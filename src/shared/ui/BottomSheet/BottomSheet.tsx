import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import './BottomSheet.css'

type Props = {
  open: boolean
  onClose: () => void
  /** Optional title shown above the content area. */
  title?: string
  /** Optional inline content shown to the right of the title (e.g. "ПЕРЕГЛЯНУТИ →"). */
  titleAside?: ReactNode
  /** Sheet body. */
  children: ReactNode
  /** Max height as % of viewport. Default 88 (leaves a strip of dimmed page above). */
  maxHeightPct?: number
}

// Drag further than this (px) and release → dismiss.
const CLOSE_THRESHOLD = 110

/**
 * Slide-up bottom sheet with a dimmed backdrop. Closes on backdrop click,
 * Escape, programmatic `onClose`, or a swipe-down on the handle/header.
 * Body scroll is locked while open.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  titleAside,
  children,
  maxHeightPct = 88,
}: Props) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef<number | null>(null)
  const dyRef = useRef(0)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  // Reset the drag offset whenever the sheet (re)opens.
  useEffect(() => {
    if (open) {
      setDragY(0)
      setDragging(false)
    }
  }, [open])

  if (!open) return null

  function onPointerDown(e: ReactPointerEvent) {
    startYRef.current = e.clientY
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (startYRef.current == null) return
    const dy = Math.max(0, e.clientY - startYRef.current) // only downward
    dyRef.current = dy
    setDragY(dy)
  }

  function endDrag() {
    if (startYRef.current == null) return
    const shouldClose = dyRef.current > CLOSE_THRESHOLD
    startYRef.current = null
    dyRef.current = 0
    setDragging(false)
    setDragY(0)
    if (shouldClose) onClose()
  }

  return (
    <div className="bottom-sheet" role="dialog" aria-modal="true">
      <div className="bottom-sheet__backdrop" onClick={onClose} />
      <div
        className="bottom-sheet__panel"
        style={{
          maxHeight: `${maxHeightPct}dvh`,
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : undefined,
        }}
      >
        {/* Drag zone — handle + header. Swipe down past the threshold closes. */}
        <div
          className="bottom-sheet__drag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="bottom-sheet__handle" aria-hidden="true" />
          {(title || titleAside) && (
            <header className="bottom-sheet__header">
              {title && <h2 className="bottom-sheet__title">{title}</h2>}
              {titleAside && <div className="bottom-sheet__aside">{titleAside}</div>}
            </header>
          )}
        </div>
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </div>
  )
}
