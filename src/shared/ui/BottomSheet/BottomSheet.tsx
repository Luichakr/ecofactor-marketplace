import { useEffect, type ReactNode } from 'react'
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

/**
 * Slide-up bottom sheet with a dimmed backdrop. Closes on backdrop click,
 * Escape key, or programmatic `onClose`. Body scroll is locked while open.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  titleAside,
  children,
  maxHeightPct = 88,
}: Props) {
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

  if (!open) return null

  return (
    <div className="bottom-sheet" role="dialog" aria-modal="true">
      <div className="bottom-sheet__backdrop" onClick={onClose} />
      <div className="bottom-sheet__panel" style={{ maxHeight: `${maxHeightPct}dvh` }}>
        <div className="bottom-sheet__handle" aria-hidden="true" />
        {(title || titleAside) && (
          <header className="bottom-sheet__header">
            {title && <h2 className="bottom-sheet__title">{title}</h2>}
            {titleAside && <div className="bottom-sheet__aside">{titleAside}</div>}
          </header>
        )}
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </div>
  )
}
